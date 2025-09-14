package handlers

import (
	"log"
	"time"

	"github.com/Otabek228101/mehmon/database"
	"github.com/Otabek228101/mehmon/models"
	"github.com/Otabek228101/mehmon/services"
	"github.com/gofiber/fiber/v2"
)

type ReceiptRequest struct {
	ReceiptNumber   string            `json:"receiptNumber"`
	ClientName      string            `json:"clientName"`
	ClientEmail     string            `json:"clientEmail"`
	ClientPhone     string            `json:"clientPhone"`
	ReceiptDate     string            `json:"receiptDate"`
	PropertyName    string            `json:"propertyName"`
	PropertyAddress string            `json:"propertyAddress"`
	CheckIn         *string           `json:"checkIn"`
	CheckOut        *string           `json:"checkOut"`
	AmountPaid      float64           `json:"amountPaid"`
	Activities      []ActivityRequest `json:"activities"`
}

type ActivityRequest struct {
	Type            string  `json:"type"`
	PropertyName    string  `json:"propertyName"`
	PropertyAddress string  `json:"propertyAddress"`
	CheckIn         *string `json:"checkIn"`
	CheckOut        *string `json:"checkOut"`
	Amount          float64 `json:"amount"`
	CarModel        string  `json:"carModel"`
	CarPlate        string  `json:"carPlate"`
	PickupLocation  string  `json:"pickupLocation"`
	DropoffLocation string  `json:"dropoffLocation"`
	TransferType    string  `json:"transferType"`
	Description     string  `json:"description"`
}

func parseTimeString(timeStr *string) *time.Time {
	if timeStr == nil || *timeStr == "" {
		return nil
	}

	if t, err := time.Parse(time.RFC3339Nano, *timeStr); err == nil {
		return &t
	}

	if t, err := time.Parse(time.RFC3339, *timeStr); err == nil {
		return &t
	}

	if t, err := time.Parse("2006-01-02", *timeStr); err == nil {
		return &t
	}

	if t, err := time.Parse("2006-01-02T15:04:05", *timeStr); err == nil {
		return &t
	}

	return nil
}

func CreateReceipt(c *fiber.Ctx) error {
	var request ReceiptRequest

	if err := c.BodyParser(&request); err != nil {
		log.Printf("Error parsing request body: %v", err)
		return c.Status(400).JSON(fiber.Map{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
	}

	log.Printf("Received request: %+v", request)

	request.ReceiptNumber = services.GenerateReceiptNumber()

	receiptDate, err := time.Parse(time.RFC3339Nano, request.ReceiptDate)
	if err != nil {
		receiptDate, err = time.Parse("2006-01-02", request.ReceiptDate)
		if err != nil {
			log.Printf("Error parsing receipt date: %v", err)
			return c.Status(400).JSON(fiber.Map{
				"error":   "Invalid receipt date format",
				"details": "Expected format: YYYY-MM-DD or ISO 8601 (with or without milliseconds)",
			})
		}
	}

	receipt := models.Receipt{
		ReceiptNumber:   request.ReceiptNumber,
		ClientName:      request.ClientName,
		ClientEmail:     request.ClientEmail,
		ClientPhone:     request.ClientPhone,
		ReceiptDate:     receiptDate,
		PropertyName:    request.PropertyName,
		PropertyAddress: request.PropertyAddress,
		CheckIn:         parseTimeString(request.CheckIn),
		CheckOut:        parseTimeString(request.CheckOut),
		AmountPaid:      request.AmountPaid,
	}

	log.Printf("Receipt before save: %+v", receipt)

	if err := database.DB.Create(&receipt).Error; err != nil {
		log.Printf("Error creating receipt: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error":   "Failed to create receipt",
			"details": err.Error(),
		})
	}

	log.Printf("Receipt created with ID: %d", receipt.ID)

	var activities []models.Activity
	for _, actReq := range request.Activities {
		activity := models.Activity{
			ReceiptID:       receipt.ID,
			Type:            actReq.Type,
			PropertyName:    actReq.PropertyName,
			PropertyAddress: actReq.PropertyAddress,
			CheckIn:         parseTimeString(actReq.CheckIn),
			CheckOut:        parseTimeString(actReq.CheckOut),
			Amount:          actReq.Amount,
			CarModel:        actReq.CarModel,
			CarPlate:        actReq.CarPlate,
			PickupLocation:  actReq.PickupLocation,
			DropoffLocation: actReq.DropoffLocation,
			TransferType:    actReq.TransferType,
			Description:     actReq.Description,
		}

		if err := database.DB.Create(&activity).Error; err != nil {
			log.Printf("Error creating activity: %v", err)
			database.DB.Delete(&receipt)
			return c.Status(500).JSON(fiber.Map{
				"error":   "Failed to create activity",
				"details": err.Error(),
			})
		}
		activities = append(activities, activity)
	}

	database.DB.Preload("Activities").First(&receipt, receipt.ID)
	return c.Status(201).JSON(receipt)
}

func GetReceipts(c *fiber.Ctx) error {
	var receipts []models.Receipt
	if err := database.DB.Preload("Activities").Find(&receipts).Error; err != nil {
		log.Printf("Error fetching receipts: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch receipts",
		})
	}
	return c.JSON(receipts)
}

func GetReceipt(c *fiber.Ctx) error {
	id := c.Params("id")
	var receipt models.Receipt

	if err := database.DB.Preload("Activities").First(&receipt, id).Error; err != nil {
		log.Printf("Error fetching receipt: %v", err)
		return c.Status(404).JSON(fiber.Map{
			"error": "Receipt not found",
		})
	}

	return c.JSON(receipt)
}

func SearchReceipts(c *fiber.Ctx) error {
	query := c.Query("q")
	if query == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Search query is required",
		})
	}

	var receipts []models.Receipt

	searchPattern := "%" + query + "%"
	if err := database.DB.Preload("Activities").Where(
		"receipt_number ILIKE ? OR client_name ILIKE ? OR client_email ILIKE ? OR client_phone ILIKE ?",
		searchPattern, searchPattern, searchPattern, searchPattern,
	).Find(&receipts).Error; err != nil {
		log.Printf("Error searching receipts: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to search receipts",
		})
	}

	return c.JSON(receipts)
}

func UpdateReceipt(c *fiber.Ctx) error {
	id := c.Params("id")
	var receipt models.Receipt

	if err := database.DB.First(&receipt, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Receipt not found",
		})
	}

	var request ReceiptRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request data",
		})
	}

	receiptDate, err := time.Parse(time.RFC3339Nano, request.ReceiptDate)
	if err != nil {
		receiptDate, err = time.Parse("2006-01-02", request.ReceiptDate)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{
				"error": "Invalid receipt date format",
			})
		}
	}

	receipt.ClientName = request.ClientName
	receipt.ClientEmail = request.ClientEmail
	receipt.ClientPhone = request.ClientPhone
	receipt.ReceiptDate = receiptDate
	receipt.PropertyName = request.PropertyName
	receipt.PropertyAddress = request.PropertyAddress
	receipt.CheckIn = parseTimeString(request.CheckIn)
	receipt.CheckOut = parseTimeString(request.CheckOut)
	receipt.AmountPaid = request.AmountPaid

	database.DB.Where("receipt_id = ?", receipt.ID).Delete(&models.Activity{})

	for _, actReq := range request.Activities {
		activity := models.Activity{
			ReceiptID:       receipt.ID,
			Type:            actReq.Type,
			PropertyName:    actReq.PropertyName,
			PropertyAddress: actReq.PropertyAddress,
			CheckIn:         parseTimeString(actReq.CheckIn),
			CheckOut:        parseTimeString(actReq.CheckOut),
			Amount:          actReq.Amount,
			CarModel:        actReq.CarModel,
			CarPlate:        actReq.CarPlate,
			PickupLocation:  actReq.PickupLocation,
			DropoffLocation: actReq.DropoffLocation,
			TransferType:    actReq.TransferType,
			Description:     actReq.Description,
		}

		database.DB.Create(&activity)
	}

	if err := database.DB.Save(&receipt).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to update receipt",
		})
	}

	database.DB.Preload("Activities").First(&receipt, receipt.ID)

	return c.JSON(receipt)
}

func DeleteReceipt(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := database.DB.Where("receipt_id = ?", id).Delete(&models.Activity{}).Error; err != nil {
		log.Printf("Error deleting activities: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete activities",
		})
	}

	if err := database.DB.Delete(&models.Receipt{}, id).Error; err != nil {
		log.Printf("Error deleting receipt: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete receipt",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Receipt deleted successfully",
	})
}
