package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetExchangeRates(c *gin.Context) {

	rates := map[string]float64{
		"USD": 1.0,
		"IDR": 16400.0,
		"EUR": 0.93,
	}

	c.JSON(http.StatusOK, gin.H{"data": rates})
}
