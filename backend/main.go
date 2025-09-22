package main

import (
	"log"

	"github.com/Otabek228101/mehmon/database"
	"github.com/Otabek228101/mehmon/handlers"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	database.Connect()
	database.Migrate()
	database.SeedData()

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	setupRoutes(app)

	log.Printf("Server starting on port 8080")
	log.Fatal(app.Listen(":8080"))
}

func setupRoutes(app *fiber.App) {
	api := app.Group("/api")

	api.Post("/receipts", handlers.CreateReceipt)
	api.Get("/receipts", handlers.GetReceipts)
	api.Get("/receipts/search", handlers.SearchReceipts)
	api.Get("/receipts/:id", handlers.GetReceipt)
	api.Put("/receipts/:id", handlers.UpdateReceipt)
	api.Delete("/receipts/:id", handlers.DeleteReceipt)

	api.Get("/hotels", handlers.GetHotels)
	api.Get("/hotels/:id", handlers.GetHotelByID)
	api.Post("/hotels", handlers.CreateHotel)
	api.Put("/hotels/:id", handlers.UpdateHotel)
	api.Delete("/hotels/:id", handlers.DeleteHotel)

	api.Post("/proposals", handlers.CreateProposal)
	api.Get("/proposals", handlers.GetProposals)
	api.Get("/proposals/:id", handlers.GetProposal)
	api.Put("/proposals/:id", handlers.UpdateProposal)
	api.Delete("/proposals/:id", handlers.DeleteProposal)

	api.Get("/car-rentals", handlers.GetCarRentals)
	api.Post("/car-rentals", handlers.CreateCarRental)
	api.Delete("/car-rentals/:id", handlers.DeleteCarRental)
}
