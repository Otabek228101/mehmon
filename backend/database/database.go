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
	if err := DB.AutoMigrate(&models.Receipt{}, &models.Activity{}, &models.Hotel{}, &models.CarRental{}, &models.Proposal{}); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Println("Database migrated successfully")
}

func SeedData() {
	var hotelCount, rentalCount, receiptCount, proposalCount int64

	DB.Model(&models.Hotel{}).Count(&hotelCount)
	DB.Model(&models.CarRental{}).Count(&rentalCount)
	DB.Model(&models.Receipt{}).Count(&receiptCount)
	DB.Model(&models.Proposal{}).Count(&proposalCount)

	if hotelCount == 0 {
		hotels := []models.Hotel{
			{Name: "Violino d'Oro", City: "Venezia", Type: "Luxury", Address: "P.za San Marco, 2091, 30124 Venezia VE", Stars: 5, Breakfast: true},
			{Name: "UNA Hotels Regina Bari", City: "BARI", GroupName: "UNA Hotels", Type: "Business", Address: "SP57 Torre a Mare / Noicattaro, Noicattaro (BA)", Stars: 4, Breakfast: true},
			{Name: "UNA Hotels Bologna Centro", City: "BOLOGNA", GroupName: "UNA Hotels", Type: "Business", Address: "Viale Pietro Pietramellara, 41, Bologna", Stars: 4, Breakfast: true},
			{Name: "L'HERMITAGE", City: "LA BAULE", GroupName: "Barriere Group", Type: "Luxury", Address: "5 Espl. Lucien Barrière, 44500 La Baule-Escoublac, France", Stars: 5, Breakfast: true},
			{Name: "Principi di Piemonte | UNA Esperienze", City: "TORINO", GroupName: "UNA Hotels", Type: "Luxury", Address: "Via Piero Gobetti, 15, 10123 Torino TO", Stars: 5, Breakfast: true},
			{Name: "Le Majestic", City: "CANNES", GroupName: "Barriere Group", Type: "Luxury", Address: "10 Bd de la Croisette, Cannes", Stars: 5, Breakfast: true},
			{Name: "Le Gray D'Albion", City: "CANNES", GroupName: "Barriere Group", Type: "Business", Address: "38 Rue des Serbes, Cannes", Stars: 4, Breakfast: true},
			{Name: "Grand Hotel Minerva", City: "FLORENCE", GroupName: "Collezione EM", Type: "Boutique", Address: "P.za di Santa Maria Novella, 16, 50123 Firenze FI", Stars: 4, Breakfast: true},
			{Name: "Brunelleschi Firenze", City: "FLORENCE", GroupName: "Collezione EM", Type: "Boutique", Address: "Piazza Sant'Elisabetta, 3, 50122 Firenze FI", Stars: 4, Breakfast: true},
			{Name: "Pensione America", City: "FORTE DEI MARMI", GroupName: "Collezione EM", Type: "Luxury", Address: "Via Colombo, 24, 55042 Forte dei Marmi LU, Italy", Stars: 5, Breakfast: true},
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
