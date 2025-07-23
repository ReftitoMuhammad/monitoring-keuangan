package utils

import (
	"os"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// GenerateToken menghasilkan token JWT baru untuk user ID tertentu
func GenerateToken(userID uint) (string, error) {
	// Token akan valid selama 24 jam
	expirationTime := time.Now().Add(24 * time.Hour)

	// Membuat claims (data di dalam token)
	claims := &jwt.RegisteredClaims{
		Subject:   strconv.FormatUint(uint64(userID), 10),
		ExpiresAt: jwt.NewNumericDate(expirationTime),
	}

	// Membuat token baru dengan claims dan metode signing HS256
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Menandatangani token dengan secret key dari .env
	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}
