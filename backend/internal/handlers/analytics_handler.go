// internal/handlers/analytics_handler.go
package handlers

import (
	"net/http"
	"time"
	"timetracker/internal/database"
	"timetracker/internal/models"
	"timetracker/internal/utils"

	"github.com/gin-gonic/gin"
)

type AnalyticsResponse struct {
	Date           string  `json:"date"`
	Hours          float64 `json:"hours"`
	TotalTasks     int64   `json:"totalTasks,omitempty"`
	CompletedTasks int64   `json:"completedTasks,omitempty"`
	TotalProjects  int64   `json:"totalProjects,omitempty"`
}

func GetDailyAnalytics(c *gin.Context) {
	userID := utils.GetUserID(c)
	var entries []models.TimeEntry
	var result []AnalyticsResponse

	dayAgo := time.Now().AddDate(0, 0, -1)

	err := database.DB.Where("user_id = ? AND start_time >= ?", userID, dayAgo).
		Find(&entries).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching analytics"})
		return
	}

	// Group by date
	dailyTotals := make(map[string]float64)
	for _, entry := range entries {
		day := entry.StartTime.Format("2006-01-02")
		dailyTotals[day] += float64(entry.Duration) / 3600
	}

	// Get tasks and projects count
	var totalTasks int64
	var completedTasks int64
	var totalProjects int64

	database.DB.Model(&models.Task{}).Where("user_id = ?", userID).Count(&totalTasks)
	database.DB.Model(&models.Task{}).Where("user_id = ? AND status = ?", userID, "COMPLETED").Count(&completedTasks)
	database.DB.Model(&models.Project{}).Where("user_id = ?", userID).Count(&totalProjects)

	// Convert to response format
	for date, hours := range dailyTotals {
		result = append(result, AnalyticsResponse{
			Date:           date,
			Hours:          hours,
			TotalTasks:     totalTasks,
			CompletedTasks: completedTasks,
			TotalProjects:  totalProjects,
		})
	}

	c.JSON(http.StatusOK, result)
}

func GetWeeklyAnalytics(c *gin.Context) {
	userID := utils.GetUserID(c)
	var entries []models.TimeEntry
	var result []AnalyticsResponse

	weekAgo := time.Now().AddDate(0, 0, -7)

	err := database.DB.Where("user_id = ? AND start_time >= ?", userID, weekAgo).
		Find(&entries).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching analytics"})
		return
	}

	// Group by day of week
	weeklyTotals := make(map[string]float64)
	for _, entry := range entries {
		day := entry.StartTime.Format("2006-01-02")
		weeklyTotals[day] += float64(entry.Duration) / 3600
	}

	// Get tasks and projects count
	var totalTasks int64
	var completedTasks int64
	var totalProjects int64

	database.DB.Model(&models.Task{}).Where("user_id = ?", userID).Count(&totalTasks)
	database.DB.Model(&models.Task{}).Where("user_id = ? AND status = ?", userID, "COMPLETED").Count(&completedTasks)
	database.DB.Model(&models.Project{}).Where("user_id = ?", userID).Count(&totalProjects)

	// Convert to response format
	for date, hours := range weeklyTotals {
		result = append(result, AnalyticsResponse{
			Date:           date,
			Hours:          hours,
			TotalTasks:     totalTasks,
			CompletedTasks: completedTasks,
			TotalProjects:  totalProjects,
		})
	}

	c.JSON(http.StatusOK, result)
}

func GetMonthlyAnalytics(c *gin.Context) {
	userID := utils.GetUserID(c)
	var entries []models.TimeEntry
	var result []AnalyticsResponse

	monthAgo := time.Now().AddDate(0, -1, 0)

	err := database.DB.Where("user_id = ? AND start_time >= ?", userID, monthAgo).
		Find(&entries).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching analytics"})
		return
	}

	// Group by month
	monthlyTotals := make(map[string]float64)
	for _, entry := range entries {
		month := entry.StartTime.Format("2006-01-02")
		monthlyTotals[month] += float64(entry.Duration) / 3600
	}

	// Get tasks and projects count
	var totalTasks int64
	var completedTasks int64
	var totalProjects int64

	database.DB.Model(&models.Task{}).Where("user_id = ?", userID).Count(&totalTasks)
	database.DB.Model(&models.Task{}).Where("user_id = ? AND status = ?", userID, "COMPLETED").Count(&completedTasks)
	database.DB.Model(&models.Project{}).Where("user_id = ?", userID).Count(&totalProjects)

	// Convert to response format
	for date, hours := range monthlyTotals {
		result = append(result, AnalyticsResponse{
			Date:           date,
			Hours:          hours,
			TotalTasks:     totalTasks,
			CompletedTasks: completedTasks,
			TotalProjects:  totalProjects,
		})
	}

	c.JSON(http.StatusOK, result)
}
