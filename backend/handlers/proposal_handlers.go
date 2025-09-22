package handlers

import (
	"fmt"
	"log"
	"time"

	"github.com/Otabek228101/mehmon/database"
	"github.com/Otabek228101/mehmon/models"
	"github.com/Otabek228101/mehmon/services"
	"github.com/gofiber/fiber/v2"
)

func CreateProposal(c *fiber.Ctx) error {
	var request models.HotelRequest

	if err := c.BodyParser(&request); err != nil {
		log.Printf("Error parsing proposal request: %v", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request data"})
	}

	checkIn, err := time.Parse("2006-01-02", request.CheckIn)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid check-in date format (YYYY-MM-DD)"})
	}

	checkOut, err := time.Parse("2006-01-02", request.CheckOut)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid check-out date format (YYYY-MM-DD)"})
	}

	if checkOut.Before(checkIn) {
		return c.Status(400).JSON(fiber.Map{"error": "Check-out date must be after check-in date"})
	}

	var hotel models.Hotel
	if err := database.DB.First(&hotel, request.HotelID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Hotel not found"})
	}

	if request.Guests > hotel.MaxGuests-hotel.CurrentGuests {
		return c.Status(400).JSON(fiber.Map{"error": fmt.Sprintf("Not enough places. Hotel has %d available spots", hotel.MaxGuests-hotel.CurrentGuests)})
	}

	proposal := models.Proposal{
		ProposalNumber: services.GenerateProposalNumber(),
		ClientName:     request.ClientName,
		Guests:         request.Guests,
		Level:          request.Level,
		CheckIn:        checkIn,
		CheckOut:       checkOut,
		Breakfast:      request.Breakfast,
		FreeCancel:     request.FreeCancel,
		Price:          request.Price,
		Location:       request.Location,
		Website:        request.Website,
		HotelID:        request.HotelID,
	}

	if err := database.DB.Create(&proposal).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create proposal"})
	}

	database.DB.Preload("Hotel").First(&proposal, proposal.ID)
	return c.Status(201).JSON(proposal)
}

func GetProposals(c *fiber.Ctx) error {
	var proposals []models.Proposal
	if err := database.DB.Preload("Hotel").Find(&proposals).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch proposals"})
	}
	return c.JSON(proposals)
}

func GetProposal(c *fiber.Ctx) error {
	id := c.Params("id")
	var proposal models.Proposal

	if err := database.DB.Preload("Hotel").First(&proposal, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Proposal not found"})
	}

	return c.JSON(proposal)
}

func UpdateProposal(c *fiber.Ctx) error {
	id := c.Params("id")
	var proposal models.Proposal

	if err := database.DB.First(&proposal, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Proposal not found"})
	}

	var request models.HotelRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request data"})
	}

	checkIn, err := time.Parse("2006-01-02", request.CheckIn)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid check-in date format (YYYY-MM-DD)"})
	}

	checkOut, err := time.Parse("2006-01-02", request.CheckOut)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid check-out date format (YYYY-MM-DD)"})
	}

	if checkOut.Before(checkIn) {
		return c.Status(400).JSON(fiber.Map{"error": "Check-out date must be after check-in date"})
	}

	var hotel models.Hotel
	if err := database.DB.First(&hotel, request.HotelID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Hotel not found"})
	}

	if request.Guests > hotel.MaxGuests-hotel.CurrentGuests {
		return c.Status(400).JSON(fiber.Map{"error": fmt.Sprintf("Not enough places. Hotel has %d available spots", hotel.MaxGuests-hotel.CurrentGuests)})
	}

	proposal.ClientName = request.ClientName
	proposal.Guests = request.Guests
	proposal.Level = request.Level
	proposal.CheckIn = checkIn
	proposal.CheckOut = checkOut
	proposal.Breakfast = request.Breakfast
	proposal.FreeCancel = request.FreeCancel
	proposal.Price = request.Price
	proposal.Location = request.Location
	proposal.Website = request.Website
	proposal.HotelID = request.HotelID

	if err := database.DB.Save(&proposal).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update proposal"})
	}

	database.DB.Preload("Hotel").First(&proposal, proposal.ID)
	return c.JSON(proposal)
}

func DeleteProposal(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := database.DB.Delete(&models.Proposal{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete proposal"})
	}

	return c.JSON(fiber.Map{"message": "Proposal deleted successfully"})
}
