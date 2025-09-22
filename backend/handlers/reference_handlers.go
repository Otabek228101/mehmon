package handlers

import (
	"github.com/Otabek228101/mehmon/database"
	"github.com/Otabek228101/mehmon/models"
	"github.com/gofiber/fiber/v2"
)

func GetHotels(c *fiber.Ctx) error {
	city := c.Query("city")
	var hotels []models.Hotel

	query := database.DB
	if city != "" {
		query = query.Where("city ILIKE ?", "%"+city+"%")
	}

	if err := query.Find(&hotels).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch hotels"})
	}

	return c.JSON(hotels)
}

func GetHotelByID(c *fiber.Ctx) error {
	id := c.Params("id")
	var hotel models.Hotel

	if err := database.DB.First(&hotel, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Hotel not found"})
	}

	return c.JSON(hotel)
}

func CreateHotel(c *fiber.Ctx) error {
	var req models.CreateHotelRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request data"})
	}

	// Валидация обязательных полей
	if req.Name == "" || req.Address == "" || req.City == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Name, Address, and City are required"})
	}

	// Проверка диапазона звезд
	if req.Stars < 1 || req.Stars > 5 {
		return c.Status(400).JSON(fiber.Map{"error": "Stars must be between 1 and 5"})
	}

	// Проверка что текущие гости не превышают максимум
	if req.CurrentGuests > req.MaxGuests {
		return c.Status(400).JSON(fiber.Map{"error": "Current guests cannot exceed max guests"})
	}

	hotel := models.Hotel{
		Name:          req.Name,
		City:          req.City,
		GroupName:     req.GroupName,
		Type:          req.Type,
		Stars:         req.Stars,
		Address:       req.Address,
		LocationLink:  req.LocationLink,
		WebsiteLink:   req.WebsiteLink,
		Breakfast:     req.Breakfast,
		Price:         req.Price,
		MaxGuests:     req.MaxGuests,
		CurrentGuests: req.CurrentGuests,
	}

	if err := database.DB.Create(&hotel).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create hotel", "details": err.Error()})
	}

	return c.Status(201).JSON(hotel)
}

func UpdateHotel(c *fiber.Ctx) error {
	id := c.Params("id")
	var req models.CreateHotelRequest
	var hotel models.Hotel

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request data"})
	}

	if err := database.DB.First(&hotel, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Hotel not found"})
	}

	if req.Name == "" || req.Address == "" || req.City == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Name, Address, and City are required"})
	}

	if req.Stars < 1 || req.Stars > 5 {
		return c.Status(400).JSON(fiber.Map{"error": "Stars must be between 1 and 5"})
	}

	if req.CurrentGuests > req.MaxGuests {
		return c.Status(400).JSON(fiber.Map{"error": "Current guests cannot exceed max guests"})
	}

	hotel.Name = req.Name
	hotel.City = req.City
	hotel.GroupName = req.GroupName
	hotel.Type = req.Type
	hotel.Stars = req.Stars
	hotel.Address = req.Address
	hotel.LocationLink = req.LocationLink
	hotel.WebsiteLink = req.WebsiteLink
	hotel.Breakfast = req.Breakfast
	hotel.Price = req.Price
	hotel.MaxGuests = req.MaxGuests
	hotel.CurrentGuests = req.CurrentGuests

	if err := database.DB.Save(&hotel).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update hotel", "details": err.Error()})
	}

	return c.JSON(hotel)
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

func GetCarRentals(c *fiber.Ctx) error {
	var carRentals []models.CarRental
	if err := database.DB.Find(&carRentals).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch car rentals"})
	}
	return c.JSON(carRentals)
}

func CreateCarRental(c *fiber.Ctx) error {
	var carRental models.CarRental
	if err := c.BodyParser(&carRental); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request data"})
	}

	if carRental.Name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Name is required"})
	}

	if err := database.DB.Create(&carRental).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create car rental"})
	}

	return c.Status(201).JSON(carRental)
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
