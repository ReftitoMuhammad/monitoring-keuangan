package models

import "time"

// User struct merepresentasikan tabel 'users' di database
type User struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	Name            string    `gorm:"not null" json:"name"`
	Email           string    `gorm:"not null;unique" json:"email"`
	ProfileImageURL string    `gorm:"type:text" json:"profile_image_url,omitempty"`
	PasswordHash    string    `gorm:"not null" json:"-"`
	Currency        string    `gorm:"default:'IDR'" json:"currency"`
	Timezone        string    `gorm:"default:'Asia/Jakarta'" json:"timezone"`
	CreatedAt       time.Time `json:"created_at"`
}
