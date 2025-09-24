package handlers

import (
	"bytes"
	"io/ioutil"
	"log"
	"time"

	"github.com/Otabek228101/mehmon/database"
	"github.com/Otabek228101/mehmon/models"
	"github.com/Otabek228101/mehmon/services"
	"github.com/gofiber/fiber/v2"
)

func CreateProposal(c *fiber.Ctx) error {
	bodyBytes := c.Body()
	bodyReader := bytes.NewReader(bodyBytes)
	body, err := ioutil.ReadAll(bodyReader)
	if err != nil {
		log.Printf("Failed to read request body: %v", err)
		return c.Status(400).JSON(fiber.Map{"error": "Unable to read request data"})
	}
	log.Printf("Received request body: %s", string(body))

	var request models.ProposalRequest
	if err := c.BodyParser(&request); err != nil {
		log.Printf("Error parsing proposal request: %v, Body: %s", err, string(body))
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request data"})
	}

	checkIn, err := time.Parse("2006-01-02", request.CheckIn)
	if err != nil {
		log.Printf("Invalid check-in date format: %v", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid check-in date format (YYYY-MM-DD)"})
	}

	checkOut, err := time.Parse("2006-01-02", request.CheckOut)
	if err != nil {
		log.Printf("Invalid check-out date format: %v", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid check-out date format (YYYY-MM-DD)"})
	}

	if checkOut.Before(checkIn) {
		log.Printf("Check-out %v is before check-in %v", checkOut, checkIn)
		return c.Status(400).JSON(fiber.Map{"error": "Check-out date must be after check-in date"})
	}

	if len(request.Rooms) == 0 {
		log.Printf("No rooms provided in request")
		return c.Status(400).JSON(fiber.Map{"error": "At least one room is required"})
	}
	for i, room := range request.Rooms {
		if room.Count <= 0 {
			log.Printf("Invalid room count at index %d: %v", i, room.Count)
			return c.Status(400).JSON(fiber.Map{"error": "Room count must be greater than 0"})
		}
	}

	var hotel models.Hotel
	if err := database.DB.First(&hotel, request.HotelID).Error; err != nil {
		log.Printf("Hotel with ID %d not found: %v", request.HotelID, err)
		return c.Status(404).JSON(fiber.Map{"error": "Hotel not found"})
	}

	proposal := models.Proposal{
		ProposalNumber: services.GenerateProposalNumber(),
		ClientName:     request.ClientName,
		Guests:         request.Guests,
		CheckIn:        checkIn,
		CheckOut:       checkOut,
		Price:          request.Price,
		Breakfast:      request.Breakfast,
		FreeCancel:     request.FreeCancel,
		HotelID:        request.HotelID,
	}

	if err := database.DB.Create(&proposal).Error; err != nil {
		log.Printf("Failed to create proposal in DB: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create proposal"})
	}

	for _, reqRoom := range request.Rooms {
		room := models.ProposalRoom{
			ProposalID: proposal.ID,
			Count:      reqRoom.Count,
		}
		if err := database.DB.Create(&room).Error; err != nil {
			log.Printf("Failed to create room for proposal %d: %v", proposal.ID, err)
		}
	}

	database.DB.Preload("Hotel").Preload("Rooms").First(&proposal, proposal.ID)
	return c.Status(201).JSON(proposal)
}

func GetProposals(c *fiber.Ctx) error {
	var proposals []models.Proposal
	if err := database.DB.Preload("Hotel").Preload("Rooms").Find(&proposals).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch proposals"})
	}
	return c.JSON(proposals)
}

func GetProposal(c *fiber.Ctx) error {
	id := c.Params("id")
	var proposal models.Proposal

	if err := database.DB.Preload("Hotel").Preload("Rooms").First(&proposal, id).Error; err != nil {
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

	var request models.ProposalRequest
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

	if len(request.Rooms) == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "At least one room is required"})
	}
	for _, room := range request.Rooms {
		if room.Count <= 0 {
			return c.Status(400).JSON(fiber.Map{"error": "Room count must be greater than 0"})
		}
	}

	var hotel models.Hotel
	if err := database.DB.First(&hotel, request.HotelID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Hotel not found"})
	}

	proposal.ClientName = request.ClientName
	proposal.Guests = request.Guests
	proposal.CheckIn = checkIn
	proposal.CheckOut = checkOut
	proposal.Price = request.Price
	proposal.Breakfast = request.Breakfast
	proposal.FreeCancel = request.FreeCancel
	proposal.HotelID = request.HotelID

	if err := database.DB.Save(&proposal).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update proposal"})
	}

	database.DB.Where("proposal_id = ?", proposal.ID).Delete(&models.ProposalRoom{})

	for _, reqRoom := range request.Rooms {
		room := models.ProposalRoom{
			ProposalID: proposal.ID,
			Count:      reqRoom.Count,
		}
		if err := database.DB.Create(&room).Error; err != nil {
			log.Printf("Failed to create room for proposal %d: %v", proposal.ID, err)
		}
	}

	database.DB.Preload("Hotel").Preload("Rooms").First(&proposal, proposal.ID)
	return c.JSON(proposal)
}

func DeleteProposal(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := database.DB.Where("proposal_id = ?", id).Delete(&models.ProposalRoom{}).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete rooms"})
	}

	if err := database.DB.Delete(&models.Proposal{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete proposal"})
	}

	return c.JSON(fiber.Map{"message": "Proposal deleted successfully"})
}
