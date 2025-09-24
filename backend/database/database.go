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
	if err := DB.AutoMigrate(&models.Receipt{}, &models.Activity{}, &models.Hotel{}, &models.CarRental{}, &models.Proposal{}, &models.ProposalRoom{}); err != nil {
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
			{Name: "UNA Hotels Regina Bari", City: "BARI", GroupName: "UNA Hotels", Type: "hotel", Address: "SP57 Torre a Mare / Noicattaro, Noicattaro (BA)", Stars: 4, Breakfast: true, WebsiteLink: "https://booking.unaitalianhospitality.com/?adult=1&arrive=2025-06-05&chain=33116&child=0&depart=2025-06-06&level=chain&locale=it-IT&rooms=1", LocationLink: "https://goo.gl/maps/example1"},
			{Name: "UNA Hotels Bologna Centro", City: "BOLOGNA", GroupName: "UNA Hotels", Type: "hotel", Address: "Viale Pietro Pietramellara, 41, Bologna", Stars: 4, Breakfast: true, WebsiteLink: "https://booking.unaitalianhospitality.com/?adult=1&arrive=2025-06-05&chain=33116&child=0&depart=2025-06-06&level=chain&locale=it-IT&rooms=1", LocationLink: "https://goo.gl/maps/example2"},
			{Name: "Principi di Piemonte | UNA Esperienze", City: "TORINO", GroupName: "UNA Hotels", Type: "hotel", Address: "Via Piero Gobetti, 15, 10123 Torino TO", Stars: 5, Breakfast: true, WebsiteLink: "https://booking.unaitalianhospitality.com/?adult=1&arrive=2025-06-05&chain=33116&child=0&depart=2025-06-06&level=chain&locale=it-IT&rooms=1", LocationLink: "https://goo.gl/maps/example3"},
		}
		for i, hotel := range hotels {
			if err := DB.Create(&hotel).Error; err != nil {
				log.Printf("Failed to create hotel %d: %v", i+1, err)
			}
		}
		log.Println("Hotels seeded successfully")
	}

	if rentalCount == 0 {
		carRentals := []models.CarRental{
			{Name: "Hertz"},
			{Name: "Avis"},
		}
		for i, rental := range carRentals {
			if err := DB.Create(&rental).Error; err != nil {
				log.Printf("Failed to create car rental %d: %v", i+1, err)
			}
		}
		log.Println("Car rentals seeded successfully")
	}

	if receiptCount == 0 {
		receipts := []models.Receipt{
			{ReceiptNumber: "R00001", ClientName: "John Doe", ClientEmail: "john@example.com", ClientPhone: "+1234567890", ReceiptDate: time.Now(), AmountPaid: 500.0},
		}
		for i, receipt := range receipts {
			if err := DB.Create(&receipt).Error; err != nil {
				log.Printf("Failed to create receipt %d: %v", i+1, err)
			}
		}
		log.Println("Receipts seeded successfully")
	}

	if proposalCount == 0 {
		proposals := []models.Proposal{
			{
				ProposalNumber: "P00001",
				ClientName:     "Test Client",
				Guests:         2,
				CheckIn:        time.Now(),
				CheckOut:       time.Now().Add(72 * time.Hour),
				Breakfast:      true,
				FreeCancel:     true,
				Price:          450.0,
				HotelID:        1,
			},
		}

		for _, proposal := range proposals {
			if err := DB.Create(&proposal).Error; err != nil {
				log.Printf("Failed to create proposal %s: %v", proposal.ProposalNumber, err)
				continue
			}

			rooms := []models.ProposalRoom{
				{ProposalID: proposal.ID, Count: 1},
			}
			for _, room := range rooms {
				if err := DB.Create(&room).Error; err != nil {
					log.Printf("Failed to create room for proposal %d: %v", proposal.ID, err)
				}
			}
		}
		log.Println("Proposals seeded successfully")
	}

	log.Println("Database seeding completed")
}
