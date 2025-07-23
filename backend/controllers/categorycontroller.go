package controllers

import (
	"dompet/backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CategoryInput struct {
	Name string `json:"name" binding:"required"`
	Type string `json:"type" binding:"required,oneof=income expense"`
}

// CreateCategory: Membuat kategori baru
func CreateCategory(c *gin.Context) {
	var input CategoryInput
	db := c.MustGet("db").(*gorm.DB)
	currentUser, _ := getCurrentUser(c) // Kita gunakan lagi helper dari wallet_controller

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	category := models.Category{
		Name:   input.Name,
		Type:   input.Type,
		UserID: currentUser.ID,
	}

	if err := db.Create(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": category})
}

// GetAllCategories: Mendapatkan semua kategori milik user
func GetAllCategories(c *gin.Context) {
	var categories []models.Category
	db := c.MustGet("db").(*gorm.DB)
	currentUser, _ := getCurrentUser(c)

	db.Where("user_id = ?", currentUser.ID).Find(&categories)

	c.JSON(http.StatusOK, gin.H{"data": categories})
}

// DeleteCategory: Menghapus kategori
func DeleteCategory(c *gin.Context) {
	var category models.Category
	db := c.MustGet("db").(*gorm.DB)
	currentUser, _ := getCurrentUser(c)

	if err := db.Where("id = ?", c.Param("id")).First(&category).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}

	if category.UserID != currentUser.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to delete this category"})
		return
	}

	// Coba hapus
	if err := db.Delete(&category).Error; err != nil {
		// Ini akan terjadi jika kategori sudah digunakan di transaksi (karena ON DELETE RESTRICT)
		c.JSON(http.StatusConflict, gin.H{"error": "Cannot delete category, it is already in use by transactions."})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": true, "message": "Category deleted successfully"})
}
