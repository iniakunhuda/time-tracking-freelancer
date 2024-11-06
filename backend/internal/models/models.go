// internal/models/models.go
package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Email    string    `gorm:"unique;not null" json:"email"`
	Password string    `json:"-"`
	Projects []Project `json:"projects"`
	Tasks    []Task    `json:"tasks"`
}

type Project struct {
	gorm.Model
	Name        string      `json:"name"`
	Description string      `json:"description"`
	HourlyRate  float64     `json:"hourly_rate"`
	UserID      uint        `json:"user_id"`
	TimeEntries []TimeEntry `json:"time_entries"`
	Tasks       []Task      `json:"tasks"`
}

type TimeEntry struct {
	gorm.Model
	StartTime time.Time `json:"start_time"`
	EndTime   time.Time `json:"end_time"`
	Duration  int64     `json:"duration"` // in seconds
	ProjectID uint      `json:"project_id"`
	TaskID    uint      `json:"task_id"`
	UserID    uint      `json:"user_id"`
}

type Task struct {
	gorm.Model
	Title       string      `json:"title"`
	Description string      `json:"description"`
	Status      string      `json:"status"`
	Tags        []string    `gorm:"type:text[]" json:"tags"`
	ProjectID   uint        `json:"project_id"`
	UserID      uint        `json:"user_id"`
	TimeEntries []TimeEntry `json:"time_entries"`
}
