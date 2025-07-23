package main

import (
	"dompet/backend/controllers"
	"dompet/backend/middlewares"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database!")
	}
	fmt.Println("Database connection successful!")

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"}, // Izinkan frontend Anda
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.Use(func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	})

	// Grup rute publik (tidak perlu token)
	authRoutes := router.Group("/auth")
	{
		authRoutes.POST("/register", controllers.Register)
		authRoutes.POST("/login", controllers.Login)
	}

	// Grup rute terproteksi (wajib pakai token)
	apiRoutes := router.Group("/api")
	apiRoutes.Use(middlewares.AuthMiddleware())
	{
		// Rute untuk profil
		apiRoutes.GET("/profile", controllers.GetProfile)

		// Rute untuk Wallets
		apiRoutes.POST("/wallets", controllers.CreateWallet)
		apiRoutes.GET("/wallets", controllers.GetAllWallets)
		apiRoutes.GET("/wallets/:id", controllers.GetWalletByID)
		apiRoutes.PUT("/wallets/:id", controllers.UpdateWallet)
		apiRoutes.DELETE("/wallets/:id", controllers.DeleteWallet)

		// Rute untuk category
		apiRoutes.POST("/categories", controllers.CreateCategory)
		apiRoutes.GET("/categories", controllers.GetAllCategories)
		apiRoutes.DELETE("/categories/:id", controllers.DeleteCategory)

		// Rute untuk transaction
		apiRoutes.POST("/transactions", controllers.CreateTransaction)
		apiRoutes.GET("/transactions", controllers.GetAllTransactions)

		// Rute untuk profile
		apiRoutes.PUT("/profile/details", controllers.UpdateUserDetails)
		apiRoutes.PUT("/profile/password", controllers.ChangePassword)
	}

	log.Println("Starting server on :8080")
	router.Run(":8080")
}
