package models

import "time"

// User struct merepresentasikan tabel 'users' di database
type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Name         string    `gorm:"not null" json:"name"`
	Email        string    `gorm:"not null;unique" json:"email"`
	PasswordHash string    `gorm:"not null" json:"-"` // Jangan kirim password hash ke JSON response
	Currency     string    `gorm:"default:'IDR'" json:"currency"`
	Timezone     string    `gorm:"default:'Asia/Jakarta'" json:"timezone"`
	CreatedAt    time.Time `json:"created_at"`
}
