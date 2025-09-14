package handlers

import (
	"github.com/Otabek228101/mehmon/database"
	"github.com/Otabek228101/mehmon/models"
	"github.com/gofiber/fiber/v2"
)

func GetHotels(c *fiber.Ctx) error {
	var hotels []models.Hotel
	database.DB.Find(&hotels)
	return c.JSON(hotels)
}

func GetCarRentals(c *fiber.Ctx) error {
	var carRentals []models.CarRental
	database.DB.Find(&carRentals)
	return c.JSON(carRentals)
}

func CreateHotel(c *fiber.Ctx) error {
	var hotel models.Hotel

	if err := c.BodyParser(&hotel); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request data",
		})
	}

	if err := database.DB.Create(&hotel).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create hotel",
		})
	}

	return c.Status(201).JSON(hotel)
}

func CreateCarRental(c *fiber.Ctx) error {
	var carRental models.CarRental

	if err := c.BodyParser(&carRental); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request data",
		})
	}

	if err := database.DB.Create(&carRental).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create car rental",
		})
	}

	return c.Status(201).JSON(carRental)
}
