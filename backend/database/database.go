package database

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// DB adalah instance koneksi database global (singleton)
var DB *gorm.DB

// ConnectDB menginisialisasi koneksi ke database
func ConnectDB() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL environment variable not set")
	}

	var err error
	// [FIX UTAMA] Inisialisasi koneksi dengan konfigurasi yang benar dan
	// simpan ke variabel global DB.
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		PrepareStmt: false, // Nonaktifkan prepared statement secara global
	})

	if err != nil {
		log.Fatal("Failed to connect to database!")
	}

	fmt.Println("Database connection successful!")
}
