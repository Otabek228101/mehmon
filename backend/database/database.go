package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/Otabek228101/mehmon/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect() {
	var err error
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"))

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Database connected successfully")
}

func Migrate() {
	if err := DB.AutoMigrate(&models.Receipt{}, &models.Activity{}, &models.Hotel{}, &models.CarRental{}); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Println("Database migrated successfully")
}

func SeedData() {
	var hotelCount, rentalCount, receiptCount int64

	DB.Model(&models.Hotel{}).Count(&hotelCount)
	DB.Model(&models.CarRental{}).Count(&rentalCount)
	DB.Model(&models.Receipt{}).Count(&receiptCount)

	if hotelCount == 0 {
		hotels := []models.Hotel{
			{Name: "Hilton Tashkent City", Address: "Amir Temur Square 107/B", City: "Tashkent"},
			{Name: "Hyatt Regency Tashkent", Address: "Navoi Street 1A", City: "Tashkent"},
			{Name: "InterContinental Tashkent", Address: "Shakhrisabz Street 2", City: "Tashkent"},
			{Name: "Wyndham Tashkent", Address: "Amir Temur Avenue 56", City: "Tashkent"},
			{Name: "Lotte City Hotel Tashkent Palace", Address: "Buyuk Turon Street 56", City: "Tashkent"},
		}

		for _, hotel := range hotels {
			if err := DB.Create(&hotel).Error; err != nil {
				log.Printf("Failed to create hotel %s: %v", hotel.Name, err)
			}
		}
		log.Println("Hotels seeded successfully")
	}

	if rentalCount == 0 {
		carRentals := []models.CarRental{
			{Name: "Uzbekistan Airways Car Rental"},
			{Name: "Avis Uzbekistan"},
			{Name: "Local Car Rent"},
			{Name: "UzAuto Rent"},
			{Name: "Express Car Rental"},
		}

		for _, rental := range carRentals {
			if err := DB.Create(&rental).Error; err != nil {
				log.Printf("Failed to create car rental %s: %v", rental.Name, err)
			}
		}
		log.Println("Car rentals seeded successfully")
	}

	if receiptCount == 0 {
		now := time.Now()
		tomorrow := now.Add(24 * time.Hour)
		yesterday := now.AddDate(0, 0, -1)

		receipts := []models.Receipt{
			{
				ReceiptNumber: "M00001",
				ClientName:    "John Smith",
				ClientEmail:   "john.smith@example.com",
				ClientPhone:   "+1234567890",
				ReceiptDate:   now,
				AmountPaid:    250.0,
			},
			{
				ReceiptNumber: "M00002",
				ClientName:    "Alice Johnson",
				ClientEmail:   "alice.j@example.com",
				ClientPhone:   "+0987654321",
				ReceiptDate:   yesterday,
				AmountPaid:    300.0,
			},
		}

		for i, receipt := range receipts {
			if err := DB.Create(&receipt).Error; err != nil {
				log.Printf("Failed to create receipt %d: %v", i+1, err)
				continue
			}

			var activities []models.Activity

			if i == 0 {
				activities = []models.Activity{
					{
						ReceiptID:       receipt.ID,
						Type:            "hotel",
						PropertyName:    "Hilton Tashkent City",
						PropertyAddress: "Amir Temur Square 107/B",
						CheckIn:         &now,
						CheckOut:        &tomorrow,
						Amount:          250.0,
					},
				}
			} else {
				activities = []models.Activity{
					{
						ReceiptID:       receipt.ID,
						Type:            "hotel",
						PropertyName:    "Hyatt Regency Tashkent",
						PropertyAddress: "Navoi Street 1A",
						CheckIn:         &yesterday,
						CheckOut:        &tomorrow,
						Amount:          200.0,
					},
					{
						ReceiptID:       receipt.ID,
						Type:            "car_rental",
						PropertyName:    "Avis Uzbekistan",
						PropertyAddress: "Downtown Tashkent",
						CheckIn:         &now,
						CheckOut:        &tomorrow,
						Amount:          100.0,
					},
				}
			}

			for _, activity := range activities {
				if err := DB.Create(&activity).Error; err != nil {
					log.Printf("Failed to create activity for receipt %d: %v", receipt.ID, err)
				}
			}
		}

		log.Println("Test receipts and activities seeded successfully")
	}

	log.Println("Database seeding completed")
}
