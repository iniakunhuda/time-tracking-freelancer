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

func GetDailyAnalytics(c *gin.Context) {
	userID := utils.GetUserID(c)
	var entries []models.TimeEntry

	dayAgo := time.Now().AddDate(0, 0, -1)

	err := database.DB.Where("user_id = ? AND start_time >= ?", userID, dayAgo).
		Find(&entries).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching analytics"})
		return
	}

	dailyTotals := make(map[string]float64)
	for _, entry := range entries {
		day := entry.StartTime.Format("2006-01-02")
		dailyTotals[day] += float64(entry.Duration) / 3600
	}

	c.JSON(http.StatusOK, dailyTotals)
}

func GetWeeklyAnalytics(c *gin.Context) {
	userID := utils.GetUserID(c)
	var entries []models.TimeEntry

	weekAgo := time.Now().AddDate(0, 0, -7)

	err := database.DB.Where("user_id = ? AND start_time >= ?", userID, weekAgo).
		Find(&entries).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching analytics"})
		return
	}

	dailyTotals := make(map[string]float64)
	for _, entry := range entries {
		day := entry.StartTime.Format("Mon")
		dailyTotals[day] += float64(entry.Duration) / 3600
	}

	c.JSON(http.StatusOK, dailyTotals)
}

func GetMonthlyAnalytics(c *gin.Context) {
	userID := utils.GetUserID(c)
	var entries []models.TimeEntry

	monthAgo := time.Now().AddDate(0, -1, 0)

	err := database.DB.Where("user_id = ? AND start_time >= ?", userID, monthAgo).
		Find(&entries).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching analytics"})
		return
	}

	monthlyTotals := make(map[string]float64)
	for _, entry := range entries {
		month := entry.StartTime.Format("Jan")
		monthlyTotals[month] += float64(entry.Duration) / 3600
	}

	c.JSON(http.StatusOK, monthlyTotals)
}

func GetRangeAnalytics(c *gin.Context) {
	userID := utils.GetUserID(c)
	var entries []models.TimeEntry

	startTime := c.Query("start_time")
	endTime := c.Query("end_time")

	err := database.DB.Where("user_id = ? AND start_time >= ? AND start_time <= ?", userID, startTime, endTime).
		Find(&entries).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching analytics"})
		return
	}

	rangeTotals := make(map[string]float64)
	for _, entry := range entries {
		day := entry.StartTime.Format("2006-01-02")
		rangeTotals[day] += float64(entry.Duration) / 3600
	}

	c.JSON(http.StatusOK, rangeTotals)
}

func GetYearlyAnalytics(c *gin.Context) {
	userID := utils.GetUserID(c)
	var entries []models.TimeEntry

	yearAgo := time.Now().AddDate(-1, 0, 0)

	err := database.DB.Where("user_id = ? AND start_time >= ?", userID, yearAgo).
		Find(&entries).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching analytics"})
		return
	}

	yearlyTotals := make(map[string]float64)
	for _, entry := range entries {
		year := entry.StartTime.Format("2006")
		yearlyTotals[year] += float64(entry.Duration) / 3600
	}

	c.JSON(http.StatusOK, yearlyTotals)
}
