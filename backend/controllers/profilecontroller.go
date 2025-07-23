package controllers

import (
	"dompet/backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UpdateDetailsInput struct {
	Name            string `json:"name" binding:"required"`
	Currency        string `json:"currency" binding:"required"`
	ProfileImageURL string `json:"profile_image_url" binding:"required"`
}

func UpdateUserDetails(c *gin.Context) {
	var input UpdateDetailsInput
	db := c.MustGet("db").(*gorm.DB)
	currentUser, _ := getCurrentUser(c)

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db.Model(&currentUser).Updates(models.User{Name: input.Name, Currency: input.Currency})
	c.JSON(http.StatusOK, gin.H{"data": currentUser})
}

type UpdateProfileInput struct {
	Name            string `json:"name,omitempty"`
	Currency        string `json:"currency,omitempty"`
	ProfileImageURL string `json:"profile_image_url,omitempty"`
}

func UpdateProfile(c *gin.Context) {
	var input UpdateProfileInput
	db := c.MustGet("db").(*gorm.DB)
	currentUser, _ := getCurrentUser(c)

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updateData := make(map[string]interface{})
	if input.Name != "" {
		updateData["name"] = input.Name
	}
	if input.Currency != "" {
		updateData["currency"] = input.Currency
	}

	if _, ok := c.GetPostForm("profile_image_url"); ok || input.ProfileImageURL != "" {
		updateData["profile_image_url"] = input.ProfileImageURL
	}

	if len(updateData) > 0 {
		if err := db.Model(&currentUser).Updates(updateData).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
			return
		}
	}
	var updatedUser models.User
	db.First(&updatedUser, currentUser.ID)

	c.JSON(http.StatusOK, gin.H{"data": currentUser})
}

type ChangePasswordInput struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=8"`
}

func ChangePassword(c *gin.Context) {
	var input ChangePasswordInput
	db := c.MustGet("db").(*gorm.DB)
	currentUser, _ := getCurrentUser(c)

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(currentUser.PasswordHash), []byte(input.CurrentPassword)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Current password is incorrect"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash new password"})
		return
	}

	db.Model(&currentUser).Update("password_hash", string(hashedPassword))

	c.JSON(http.StatusOK, gin.H{"message": "Password changed successfully"})
}
