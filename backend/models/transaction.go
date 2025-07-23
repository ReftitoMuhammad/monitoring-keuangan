package models

import "time"

// Transaction struct merepresentasikan tabel 'transactions'
type Transaction struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	UserID          uint      `gorm:"not null" json:"user_id"`
	WalletID        uint      `gorm:"not null" json:"wallet_id"`
	CategoryID      uint      `gorm:"not null" json:"category_id"`
	Amount          float64   `gorm:"type:decimal(15,2);not null" json:"amount"`
	Type            string    `gorm:"type:enum('income','expense');not null" json:"type"`
	Description     string    `json:"description"`
	TransactionDate time.Time `gorm:"type:date;not null" json:"transaction_date"`
	CreatedAt       time.Time `json:"created_at"`

	User     User     `gorm:"foreignKey:UserID" json:"-"`
	Wallet   Wallet   `gorm:"foreignKey:WalletID" json:"wallet"`     // Sertakan data wallet
	Category Category `gorm:"foreignKey:CategoryID" json:"category"` // Sertakan data kategori
}
