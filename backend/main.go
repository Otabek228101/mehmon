package main

import (
	"flag"
	"log"

	"github.com/Otabek228101/mehmon/database"
	"github.com/Otabek228101/mehmon/handlers"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	// seedDB := flag.Bool("seed", false, "Seed the database with test data")
	flag.Parse()

	database.Connect()
	database.Migrate()
	database.SeedData()

	// if *seedDB {
	// 	database.SeedData()
	// 	return
	// }

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
	api.Get("/car-rentals", handlers.GetCarRentals)
	api.Post("/hotels", handlers.CreateHotel)
	api.Post("/car-rentals", handlers.CreateCarRental)
}
