// internal/handlers/project_handler.go
package handlers

import (
	"net/http"
	"timetracker/internal/database"
	"timetracker/internal/models"
	"timetracker/internal/utils"

	"github.com/gin-gonic/gin"
)

func GetProjects(c *gin.Context) {
	userID := utils.GetUserID(c)
	var projects []models.Project

	if err := database.DB.Where("user_id = ?", userID).Find(&projects).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching projects"})
		return
	}

	c.JSON(http.StatusOK, projects)
}

func GetProject(c *gin.Context) {
	projectID := c.Param("id")
	userID := utils.GetUserID(c)
	var project models.Project

	if err := database.DB.Where("id = ? AND user_id = ?", projectID, userID).First(&project).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	c.JSON(http.StatusOK, project)
}

func CreateProject(c *gin.Context) {
	var project models.Project
	if err := c.ShouldBindJSON(&project); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	project.UserID = utils.GetUserID(c)

	if err := database.DB.Create(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating project"})
		return
	}

	c.JSON(http.StatusCreated, project)
}

// Continue with UpdateProject and DeleteProject...

func UpdateProject(c *gin.Context) {
	var project models.Project
	if err := c.ShouldBindJSON(&project); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	project.UserID = utils.GetUserID(c)

	if err := database.DB.Save(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating project"})
		return
	}

	c.JSON(http.StatusOK, project)
}

func DeleteProject(c *gin.Context) {
	projectID := c.Param("id")
	userID := utils.GetUserID(c)

	if err := database.DB.Where("id = ? AND user_id = ?", projectID, userID).Delete(&models.Project{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting project"})
		return
	}

	c.Status(http.StatusNoContent)
}
