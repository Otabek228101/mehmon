package handlers

import (
	"github.com/Otabek228101/mehmon/database"
	"github.com/Otabek228101/mehmon/models"
	"github.com/gofiber/fiber/v2"
)

func GetHotels(c *fiber.Ctx) error {
	var hotels []models.Hotel
	if err := database.DB.Find(&hotels).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch hotels"})
	}
	return c.JSON(hotels)
}

func GetCarRentals(c *fiber.Ctx) error {
	var carRentals []models.CarRental
	if err := database.DB.Find(&carRentals).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch car rentals"})
	}
	return c.JSON(carRentals)
}

func CreateHotel(c *fiber.Ctx) error {
	var hotel models.Hotel
	if err := c.BodyParser(&hotel); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request data"})
	}

	if hotel.Name == "" || hotel.Address == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Name and Address are required"})
	}

	if err := database.DB.Create(&hotel).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create hotel"})
	}

	return c.Status(201).JSON(hotel)
}

func CreateCarRental(c *fiber.Ctx) error {
	var carRental models.CarRental
	if err := c.BodyParser(&carRental); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request data"})
	}

	if carRental.Name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Name and Address are required"})
	}

	if err := database.DB.Create(&carRental).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create car rental"})
	}

	return c.Status(201).JSON(carRental)
}

func DeleteHotel(c *fiber.Ctx) error {
	id := c.Params("id")
	var hotel models.Hotel

	if err := database.DB.First(&hotel, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Hotel not found"})
	}

	if err := database.DB.Delete(&hotel).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete hotel"})
	}

	return c.JSON(fiber.Map{"message": "Hotel deleted successfully"})
}

func DeleteCarRental(c *fiber.Ctx) error {
	id := c.Params("id")
	var carRental models.CarRental

	if err := database.DB.First(&carRental, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Car rental not found"})
	}

	if err := database.DB.Delete(&carRental).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete car rental"})
	}

	return c.JSON(fiber.Map{"message": "Car rental deleted successfully"})
}
