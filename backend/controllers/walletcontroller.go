package controllers

import (
	"dompet/backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Helper function untuk mendapatkan user yang sedang login dari context
func getCurrentUser(c *gin.Context) (models.User, bool) {
	user, exists := c.Get("currentUser")
	if !exists {
		return models.User{}, false
	}
	return user.(models.User), true
}

// Struct untuk input saat membuat dompet
type CreateWalletInput struct {
	Name    string  `json:"name" binding:"required"`
	Balance float64 `json:"balance"` // Balance bersifat opsional saat dibuat, default 0
}

// CreateWallet: Membuat dompet baru untuk user yang sedang login
func CreateWallet(c *gin.Context) {
	var input CreateWalletInput
	db := c.MustGet("db").(*gorm.DB)
	currentUser, _ := getCurrentUser(c)

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	wallet := models.Wallet{
		Name:    input.Name,
		Balance: input.Balance,
		UserID:  currentUser.ID,
	}

	if err := db.Create(&wallet).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create wallet"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": wallet})
}

// GetAllWallets: Mendapatkan semua dompet milik user yang sedang login
func GetAllWallets(c *gin.Context) {
	var wallets []models.Wallet
	db := c.MustGet("db").(*gorm.DB)
	currentUser, _ := getCurrentUser(c)

	db.Where("user_id = ?", currentUser.ID).Find(&wallets)

	c.JSON(http.StatusOK, gin.H{"data": wallets})
}

// GetWalletByID: Mendapatkan satu dompet berdasarkan ID
func GetWalletByID(c *gin.Context) {
	var wallet models.Wallet
	db := c.MustGet("db").(*gorm.DB)
	currentUser, _ := getCurrentUser(c)

	// Cari dompet berdasarkan ID dari URL
	if err := db.Where("id = ?", c.Param("id")).First(&wallet).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wallet not found"})
		return
	}

	// Pastikan dompet ini milik user yang sedang login
	if wallet.UserID != currentUser.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to view this wallet"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": wallet})
}

// Struct untuk input saat update dompet
type UpdateWalletInput struct {
	Name string `json:"name"`
}

// UpdateWallet: Memperbarui nama dompet
func UpdateWallet(c *gin.Context) {
	var wallet models.Wallet
	var input UpdateWalletInput
	db := c.MustGet("db").(*gorm.DB)
	currentUser, _ := getCurrentUser(c)

	if err := db.Where("id = ?", c.Param("id")).First(&wallet).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wallet not found"})
		return
	}

	if wallet.UserID != currentUser.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to update this wallet"})
		return
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db.Model(&wallet).Updates(input)

	c.JSON(http.StatusOK, gin.H{"data": wallet})
}

// DeleteWallet: Menghapus dompet
func DeleteWallet(c *gin.Context) {
	var wallet models.Wallet
	db := c.MustGet("db").(*gorm.DB)
	currentUser, _ := getCurrentUser(c)

	if err := db.Where("id = ?", c.Param("id")).First(&wallet).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wallet not found"})
		return
	}

	if wallet.UserID != currentUser.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to delete this wallet"})
		return
	}

	db.Delete(&wallet)

	c.JSON(http.StatusOK, gin.H{"data": true, "message": "Wallet deleted successfully"})
}
