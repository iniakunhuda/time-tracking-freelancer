// internal/handlers/invoice_handler.go
package handlers

import (
	"net/http"
	"time"
	"timetracker/internal/database"
	"timetracker/internal/models"
	"timetracker/internal/utils"

	"github.com/gin-gonic/gin"
)

type InvoiceRequest struct {
	ProjectID uint      `json:"project_id"`
	StartDate time.Time `json:"start_date"`
	EndDate   time.Time `json:"end_date"`
}

func GenerateInvoice(c *gin.Context) {
	var req InvoiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := utils.GetUserID(c)

	var project models.Project
	if err := database.DB.Where("id = ? AND user_id = ?", req.ProjectID, userID).First(&project).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	var entries []models.TimeEntry
	err := database.DB.Where(
		"project_id = ? AND user_id = ? AND start_time BETWEEN ? AND ?",
		req.ProjectID, userID, req.StartDate, req.EndDate,
	).Find(&entries).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching time entries"})
		return
	}

	// Calculate total hours and amount
	var totalSeconds int64
	for _, entry := range entries {
		totalSeconds += entry.Duration
	}

	totalHours := float64(totalSeconds) / 3600
	totalAmount := totalHours * project.HourlyRate

	invoice := gin.H{
		"project_name": project.Name,
		"start_date":   req.StartDate,
		"end_date":     req.EndDate,
		"total_hours":  totalHours,
		"hourly_rate":  project.HourlyRate,
		"total_amount": totalAmount,
		"entries":      entries,
	}

	c.JSON(http.StatusOK, invoice)
}
