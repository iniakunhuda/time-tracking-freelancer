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
	ProjectID uint   `json:"projectId"` // Changed to match frontend
	StartDate string `json:"startDate"` // Changed to string
	EndDate   string `json:"endDate"`   // Changed to string
}

type InvoiceEntry struct {
	Date        string  `json:"date"`
	Hours       float64 `json:"hours"`
	Description string  `json:"description,omitempty"`
}

type InvoiceResponse struct {
	ProjectName string         `json:"projectName"`
	StartDate   string         `json:"startDate"`
	EndDate     string         `json:"endDate"`
	TotalHours  float64        `json:"totalHours"`
	HourlyRate  float64        `json:"hourlyRate"`
	TotalAmount float64        `json:"totalAmount"`
	Entries     []InvoiceEntry `json:"entries"`
}

func GenerateInvoice(c *gin.Context) {
	var req InvoiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse dates
	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start date format"})
		return
	}

	endDate, err := time.Parse("2006-01-02", req.EndDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end date format"})
		return
	}

	// Add one day to endDate to include the entire last day
	endDate = endDate.Add(24 * time.Hour)

	userID := utils.GetUserID(c)

	var project models.Project
	if err := database.DB.Where("id = ? AND user_id = ?", req.ProjectID, userID).First(&project).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	var entries []models.TimeEntry
	err = database.DB.Where(
		"project_id = ? AND user_id = ? AND start_time BETWEEN ? AND ?",
		req.ProjectID, userID, startDate, endDate,
	).Find(&entries).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching time entries"})
		return
	}

	// Group entries by date
	entriesByDate := make(map[string]float64)
	for _, entry := range entries {
		date := entry.StartTime.Format("2006-01-02")
		entriesByDate[date] += float64(entry.Duration) / 3600 // Convert seconds to hours
	}

	// Create formatted entries
	var formattedEntries []InvoiceEntry
	for date, hours := range entriesByDate {
		formattedEntries = append(formattedEntries, InvoiceEntry{
			Date:  date,
			Hours: hours,
		})
	}

	// Calculate totals
	var totalHours float64
	for _, hours := range entriesByDate {
		totalHours += hours
	}
	totalAmount := totalHours * project.HourlyRate

	response := InvoiceResponse{
		ProjectName: project.Name,
		StartDate:   req.StartDate,
		EndDate:     req.EndDate,
		TotalHours:  totalHours,
		HourlyRate:  project.HourlyRate,
		TotalAmount: totalAmount,
		Entries:     formattedEntries,
	}

	c.JSON(http.StatusOK, response)
}
