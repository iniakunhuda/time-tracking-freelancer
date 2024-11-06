// internal/handlers/time_entry_handler.go
package handlers

import (
	"net/http"
	"timetracker/internal/database"
	"timetracker/internal/models"
	"timetracker/internal/utils"

	"github.com/gin-gonic/gin"
)

func CreateTimeEntry(c *gin.Context) {
	var entry models.TimeEntry
	if err := c.ShouldBindJSON(&entry); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	entry.UserID = utils.GetUserID(c)
	entry.Duration = entry.EndTime.Unix() - entry.StartTime.Unix()

	if err := database.DB.Create(&entry).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating time entry"})
		return
	}

	c.JSON(http.StatusCreated, entry)
}

func GetTimeEntries(c *gin.Context) {
	userID := utils.GetUserID(c)
	var entries []models.TimeEntry

	if err := database.DB.Where("user_id = ?", userID).Find(&entries).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching time entries"})
		return
	}

	c.JSON(http.StatusOK, entries)
}

func UpdateTimeEntry(c *gin.Context) {
	var entry models.TimeEntry
	if err := c.ShouldBindJSON(&entry); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	entry.UserID = utils.GetUserID(c)
	entry.Duration = entry.EndTime.Unix() - entry.StartTime.Unix()

	if err := database.DB.Save(&entry).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating time entry"})
		return
	}

	c.JSON(http.StatusOK, entry)
}

func DeleteTimeEntry(c *gin.Context) {
	id := c.Param("id")
	userID := utils.GetUserID(c)

	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.TimeEntry{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting time entry"})
		return
	}

	c.Status(http.StatusNoContent)
}

// Continue with other time entry handlers...
