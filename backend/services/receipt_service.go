package services

import (
	"fmt"
	"strconv"

	"github.com/Otabek228101/mehmon/database"
	"github.com/Otabek228101/mehmon/models"
)

func GenerateReceiptNumber() string {
	var lastReceipt models.Receipt
	result := database.DB.Order("created_at desc").First(&lastReceipt)

	nextNumber := 1
	if result.Error == nil && lastReceipt.ReceiptNumber != "" {
		numStr := lastReceipt.ReceiptNumber[1:]
		num, err := strconv.Atoi(numStr)
		if err == nil {
			nextNumber = num + 1
		}
	}

	return fmt.Sprintf("M%05d", nextNumber)
}
