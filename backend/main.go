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
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
	// 	os.Getenv("DB_USER"),
	// 	os.Getenv("DB_PASSWORD"),
	// 	os.Getenv("DB_HOST"),
	// 	os.Getenv("DB_PORT"),
	// 	os.Getenv("DB_NAME"),
	// )

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL environment variable not set")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
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

	authRoutes := router.Group("/auth")
	{
		authRoutes.POST("/register", controllers.Register)
		authRoutes.POST("/login", controllers.Login)
	}

	apiRoutes := router.Group("/api")
	apiRoutes.Use(middlewares.AuthMiddleware())
	{
		apiRoutes.GET("/profile", controllers.GetProfile)
		apiRoutes.PUT("/profile", controllers.UpdateProfile)
		apiRoutes.PUT("/profile/password", controllers.ChangePassword)

		// Wallets
		apiRoutes.POST("/wallets", controllers.CreateWallet)
		apiRoutes.GET("/wallets", controllers.GetAllWallets)
		apiRoutes.GET("/wallets/:id", controllers.GetWalletByID)
		apiRoutes.PUT("/wallets/:id", controllers.UpdateWallet)
		apiRoutes.DELETE("/wallets/:id", controllers.DeleteWallet)

		// Categories
		apiRoutes.POST("/categories", controllers.CreateCategory)
		apiRoutes.GET("/categories", controllers.GetAllCategories)
		apiRoutes.PUT("/categories/:id", controllers.UpdateCategory)
		apiRoutes.DELETE("/categories/:id", controllers.DeleteCategory)

		// Transactions
		apiRoutes.POST("/transactions", controllers.CreateTransaction)
		apiRoutes.GET("/transactions", controllers.GetAllTransactions)

		// Exchange
		apiRoutes.GET("/exchange-rates", controllers.GetExchangeRates)

	}

	log.Println("Starting server on :8080")
	router.Run(":8080")
}
