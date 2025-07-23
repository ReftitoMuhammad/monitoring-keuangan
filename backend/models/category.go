package models

import "time"

// Category struct merepresentasikan tabel 'categories'
type Category struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null" json:"user_id"`
	Name      string    `gorm:"not null" json:"name"`
	Type      string    `gorm:"type:enum('income','expense');not null" json:"type"`
	CreatedAt time.Time `json:"created_at"`

	User User `gorm:"foreignKey:UserID" json:"-"`
}
