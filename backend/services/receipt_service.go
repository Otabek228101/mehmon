package services

import (
	"fmt"
	"strconv"

	"github.com/Otabek228101/mehmon/database"
	"github.com/Otabek228101/mehmon/models"
)

func GenerateReceiptNumber() string {
	var maxNumber string
	database.DB.Model(&models.Receipt{}).
		Where("receipt_number LIKE 'M%'").
		Select("receipt_number").
		Order("receipt_number DESC").
		First(&maxNumber)

	nextNum := 1
	if maxNumber != "" {
		numStr := maxNumber[1:]
		num, err := strconv.Atoi(numStr)
		if err == nil {
			nextNum = num + 1
		}
	}

	return "M" + fmt.Sprintf("%05d", nextNum)
}
