package models

import (
	"time"
)

// Wallet struct merepresentasikan tabel 'wallets' di database
type Wallet struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null" json:"user_id"`
	Name      string    `gorm:"not null" json:"name"`
	BankName  string    `gorm:"size:50" json:"bank_name,omitempty"`
	Currency  string    `gorm:"size:5;not null" json:"currency"`
	Balance   float64   `gorm:"type:decimal(15,2);not null;default:0.00" json:"balance"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relasi: Sebuah dompet dimiliki oleh seorang User
	User User `gorm:"foreignKey:UserID" json:"-"`
}
