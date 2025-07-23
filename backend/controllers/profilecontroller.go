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

// type UpdateProfilePictureInput struct {
// 	ProfileImageURL string `json:"profile_image_url" binding:"required"`
// }

// UpdateUserDetails: Mengubah nama dan mata uang user
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

// func UpdateProfilePicture(c *gin.Context) {
// 	var input UpdateProfilePictureInput
// 	db := c.MustGet("db").(*gorm.DB)
// 	currentUser, _ := getCurrentUser(c)

// 	if err := c.ShouldBindJSON(&input); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}

// 	// Di aplikasi nyata, ini seharusnya URL dari layanan penyimpanan (S3, GCS).
// 	// Untuk demo, kita simpan string base64.
// 	db.Model(&currentUser).Update("profile_image_url", input.ProfileImageURL)

// 	c.JSON(http.StatusOK, gin.H{"data": currentUser})
// }

type UpdateProfileInput struct {
	Name            string `json:"name,omitempty"`
	Currency        string `json:"currency,omitempty"`
	ProfileImageURL string `json:"profile_image_url,omitempty"`
}

// [REVISI] Satu fungsi untuk menangani semua jenis update profil
func UpdateProfile(c *gin.Context) {
	var input UpdateProfileInput
	db := c.MustGet("db").(*gorm.DB)
	currentUser, _ := getCurrentUser(c)

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Buat map untuk menampung data yang akan diupdate secara dinamis
	updateData := make(map[string]interface{})
	if input.Name != "" {
		updateData["name"] = input.Name
	}
	if input.Currency != "" {
		updateData["currency"] = input.Currency
	}
	// Perhatikan: kita tidak memeriksa string kosong untuk URL gambar,
	// karena string kosong bisa jadi valid untuk menghapus gambar.
	// Frontend akan mengontrol kapan harus mengirim field ini.
	if _, ok := c.GetPostForm("profile_image_url"); ok || input.ProfileImageURL != "" {
		updateData["profile_image_url"] = input.ProfileImageURL
	}

	if len(updateData) > 0 {
		if err := db.Model(&currentUser).Updates(updateData).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
			return
		}
	}

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
