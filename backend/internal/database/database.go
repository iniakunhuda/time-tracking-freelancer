// internal/database/database.go
package database

import (
	"log"
	"timetracker/internal/config"
	"timetracker/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() *gorm.DB {
	var err error
	DB, err = gorm.Open(postgres.Open(config.AppConfig.DatabaseURL), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto migrate the schema
	DB.AutoMigrate(&models.User{}, &models.Project{}, &models.TimeEntry{}, &models.Task{})

	return DB
}
