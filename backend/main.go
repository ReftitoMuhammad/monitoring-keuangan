package main

import (
	"dompet/backend/controllers"
	"dompet/backend/database"
	"dompet/backend/middlewares"
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	database.ConnectDB()
	db := database.DB

	router := gin.Default()

	router.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:3000", "https://aturuang-zeta.vercel.app", "https://aturuang.reftitoindi.my.id"},
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

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Default untuk lokal
	}

	log.Println("Starting server on :" + port)
	router.Run(":" + port)
}
