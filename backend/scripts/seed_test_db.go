package main

import (
	"os"

	"github.com/Otabek228101/mehmon/database"
)

func main() {
	os.Setenv("APP_ENV", "test")
	database.Connect()
	database.SeedData()
}
