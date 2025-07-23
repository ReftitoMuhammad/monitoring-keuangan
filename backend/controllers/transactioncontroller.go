package controllers

import (
	"dompet/backend/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type TransactionInput struct {
	WalletID        uint      `json:"wallet_id" binding:"required"`
	CategoryID      uint      `json:"category_id" binding:"required"`
	Amount          float64   `json:"amount" binding:"required,gt=0"`
	Description     string    `json:"description"`
	TransactionDate time.Time `json:"transaction_date" binding:"required"`
}

// CreateTransaction: Membuat transaksi baru dan memperbarui saldo dompet
func CreateTransaction(c *gin.Context) {
	var input TransactionInput
	db := c.MustGet("db").(*gorm.DB)
	currentUser, _ := getCurrentUser(c)

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Mulai database transaction
	err := db.Transaction(func(tx *gorm.DB) error {
		// 1. Dapatkan dompet dan kategori, pastikan milik user yang benar
		var wallet models.Wallet
		if err := tx.Where("id = ? AND user_id = ?", input.WalletID, currentUser.ID).First(&wallet).Error; err != nil {
			return err // Dompet tidak ditemukan atau bukan milik user
		}

		var category models.Category
		if err := tx.Where("id = ? AND user_id = ?", input.CategoryID, currentUser.ID).First(&category).Error; err != nil {
			return err // Kategori tidak ditemukan atau bukan milik user
		}

		// 2. Buat record transaksi baru
		transaction := models.Transaction{
			UserID:          currentUser.ID,
			WalletID:        input.WalletID,
			CategoryID:      input.CategoryID,
			Amount:          input.Amount,
			Type:            category.Type, // Tipe transaksi mengikuti tipe kategori
			Description:     input.Description,
			TransactionDate: input.TransactionDate,
		}

		if err := tx.Create(&transaction).Error; err != nil {
			return err
		}

		// 3. Perbarui saldo dompet
		var newBalance float64
		if category.Type == "income" {
			newBalance = wallet.Balance + input.Amount
		} else {
			newBalance = wallet.Balance - input.Amount
		}

		if err := tx.Model(&wallet).Update("balance", newBalance).Error; err != nil {
			return err
		}

		// Jika semua berhasil, kembalikan nil
		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction failed: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Transaction created successfully"})
}

// GetAllTransactions: Mendapatkan semua transaksi milik user
func GetAllTransactions(c *gin.Context) {
	var transactions []models.Transaction
	db := c.MustGet("db").(*gorm.DB)
	currentUser, _ := getCurrentUser(c)

	// Gunakan Preload untuk memuat data relasi Wallet dan Category
	db.Preload("Wallet").Preload("Category").Where("user_id = ?", currentUser.ID).Order("transaction_date desc").Find(&transactions)

	c.JSON(http.StatusOK, gin.H{"data": transactions})
}
