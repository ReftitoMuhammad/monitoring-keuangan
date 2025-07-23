package controllers

import (
	"dompet/backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UpdateDetailsInput struct {
	Name     string `json:"name" binding:"required"`
	Currency string `json:"currency" binding:"required"`
}

// UpdateUserDetails: Mengubah nama dan mata uang user
func UpdateUserDetails(c *gin.Context) {
	var input UpdateDetailsInput
	db := c.MustGet("db").(*gorm.DB)
	currentUser, _ := getCurrentUser(c)

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update data user di database
	db.Model(&currentUser).Updates(models.User{Name: input.Name, Currency: input.Currency})

	c.JSON(http.StatusOK, gin.H{"data": currentUser})
}

type ChangePasswordInput struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=8"`
}

// ChangePassword: Mengubah password user
func ChangePassword(c *gin.Context) {
	var input ChangePasswordInput
	db := c.MustGet("db").(*gorm.DB)
	currentUser, _ := getCurrentUser(c)

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verifikasi password saat ini
	if err := bcrypt.CompareHashAndPassword([]byte(currentUser.PasswordHash), []byte(input.CurrentPassword)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Current password is incorrect"})
		return
	}

	// Hash password baru
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash new password"})
		return
	}

	// Simpan password baru
	db.Model(&currentUser).Update("password_hash", string(hashedPassword))

	c.JSON(http.StatusOK, gin.H{"message": "Password changed successfully"})
}
