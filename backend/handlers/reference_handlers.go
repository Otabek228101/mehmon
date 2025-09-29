package handlers

import (
	"encoding/base64"
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"github.com/Otabek228101/mehmon/database"
	"github.com/Otabek228101/mehmon/models"
	"github.com/gofiber/fiber/v2"
)

func GetHotels(c *fiber.Ctx) error {
	city := c.Query("city")
	var hotels []models.Hotel
	query := database.DB
	if city != "" {
		query = query.Where("city ILIKE ?", "%"+city+"%")
	}
	if err := query.Preload("Images").Find(&hotels).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch hotels"})
	}
	return c.JSON(hotels)
}

func GetHotelByID(c *fiber.Ctx) error {
	id := c.Params("id")
	var hotel models.Hotel
	if err := database.DB.Preload("Images").First(&hotel, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Hotel not found"})
	}
	return c.JSON(hotel)
}

func CreateHotel(c *fiber.Ctx) error {
	var req models.CreateHotelRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request data"})
	}
	if req.Name == "" || req.Address == "" || req.City == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Name, Address, and City are required"})
	}
	if req.Stars < 1 || req.Stars > 5 {
		return c.Status(400).JSON(fiber.Map{"error": "Stars must be between 1 and 5"})
	}
	if req.Type != "hotel" && req.Type != "apartment" {
		return c.Status(400).JSON(fiber.Map{"error": "Type must be 'hotel' or 'apartment'"})
	}
	hotel := models.Hotel{
		Name:         req.Name,
		City:         req.City,
		GroupName:    req.GroupName,
		Type:         req.Type,
		Stars:        req.Stars,
		Address:      req.Address,
		LocationLink: req.LocationLink,
		WebsiteLink:  req.WebsiteLink,
		Breakfast:    req.Breakfast,
	}
	if err := database.DB.Create(&hotel).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create hotel"})
	}
	return c.Status(201).JSON(hotel)
}

func UpdateHotel(c *fiber.Ctx) error {
	id := c.Params("id")
	var hotel models.Hotel
	if err := database.DB.First(&hotel, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Hotel not found"})
	}
	var req models.CreateHotelRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request data"})
	}
	hotel.Name = req.Name
	hotel.City = req.City
	hotel.GroupName = req.GroupName
	hotel.Type = req.Type
	hotel.Stars = req.Stars
	hotel.Address = req.Address
	hotel.LocationLink = req.LocationLink
	hotel.WebsiteLink = req.WebsiteLink
	hotel.Breakfast = req.Breakfast
	if err := database.DB.Save(&hotel).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update hotel"})
	}
	return c.JSON(hotel)
}

func DeleteHotel(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := database.DB.Delete(&models.Hotel{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete hotel"})
	}
	return c.JSON(fiber.Map{"message": "Hotel deleted successfully"})
}

func GetCarRentals(c *fiber.Ctx) error {
	var carRentals []models.CarRental
	if err := database.DB.Find(&carRentals).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch car rentals"})
	}
	return c.JSON(carRentals)
}

func CreateCarRental(c *fiber.Ctx) error {
	var carRental models.CarRental
	if err := c.BodyParser(&carRental); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request data"})
	}
	if carRental.Name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Name is required"})
	}
	if err := database.DB.Create(&carRental).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create car rental"})
	}
	return c.Status(201).JSON(carRental)
}

func DeleteCarRental(c *fiber.Ctx) error {
	id := c.Params("id")
	var carRental models.CarRental
	if err := database.DB.First(&carRental, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Car rental not found"})
	}
	if err := database.DB.Delete(&carRental).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete car rental"})
	}
	return c.JSON(fiber.Map{"message": "Car rental deleted successfully"})
}

func UploadHotelImages(c *fiber.Ctx) error {
	id := c.Params("id")
	var hotel models.Hotel
	if err := database.DB.First(&hotel, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Hotel not found"})
	}
	form, err := c.MultipartForm()
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid multipart form"})
	}
	files := []*multipart.FileHeader{}
	if v, ok := form.File["files"]; ok {
		files = append(files, v...)
	}
	if v, ok := form.File["file"]; ok {
		files = append(files, v...)
	}
	if len(files) == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "No files"})
	}
	dir := filepath.Join("uploads", "hotels", id)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "mkdir failed"})
	}
	var maxSort int
	database.DB.Model(&models.HotelImage{}).Where("hotel_id = ?", hotel.ID).Select("COALESCE(MAX(sort_order),0)").Scan(&maxSort)
	created := []models.HotelImage{}
	for _, fh := range files {
		ext := strings.ToLower(filepath.Ext(fh.Filename))
		if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
			ext = ".jpg"
		}
		nextSort := maxSort + 1
		maxSort = nextSort
		filename := fmt.Sprintf("%s_%d%s", id, nextSort, ext)
		path := filepath.Join(dir, filename)
		if err := c.SaveFile(fh, path); err != nil {
			continue
		}
		mime := "image/jpeg"
		if ext == ".png" {
			mime = "image/png"
		}
		if ext == ".webp" {
			mime = "image/webp"
		}
		img := models.HotelImage{HotelID: hotel.ID, Path: path, Mime: mime, SortOrder: nextSort}
		if err := database.DB.Create(&img).Error; err == nil {
			created = append(created, img)
		}
	}
	sort.Slice(created, func(i, j int) bool { return created[i].SortOrder < created[j].SortOrder })
	out := []fiber.Map{}
	for _, v := range created {
		out = append(out, fiber.Map{
			"id":        v.ID,
			"path":      "/uploads/hotels/" + id + "/" + filepath.Base(v.Path),
			"mime":      v.Mime,
			"sortOrder": v.SortOrder,
		})
	}
	return c.JSON(fiber.Map{"uploaded": out})
}

func GetHotelImages(c *fiber.Ctx) error {
	id := c.Params("id")
	var hotel models.Hotel
	if err := database.DB.First(&hotel, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Hotel not found"})
	}
	var imgs []models.HotelImage
	if err := database.DB.Where("hotel_id = ?", hotel.ID).Order("sort_order asc, id asc").Find(&imgs).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch images"})
	}
	out := []fiber.Map{}
	for _, v := range imgs {
		out = append(out, fiber.Map{
			"id":        v.ID,
			"path":      "/uploads/hotels/" + id + "/" + filepath.Base(v.Path),
			"mime":      v.Mime,
			"sortOrder": v.SortOrder,
		})
	}
	return c.JSON(fiber.Map{"images": out})
}

func GetHotelImagesBase64(c *fiber.Ctx) error {
	id := c.Params("id")
	limitStr := c.Query("limit")
	limit := 0
	if limitStr != "" {
		if n, err := strconv.Atoi(limitStr); err == nil && n > 0 {
			limit = n
		}
	}
	var hotel models.Hotel
	if err := database.DB.First(&hotel, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Hotel not found"})
	}
	var imgs []models.HotelImage
	tx := database.DB.Where("hotel_id = ?", hotel.ID).Order("sort_order asc, id asc")
	if limit > 0 {
		tx = tx.Limit(limit)
	}
	if err := tx.Find(&imgs).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch images"})
	}
	out := []string{}
	for _, v := range imgs {
		b, err := os.ReadFile(v.Path)
		if err != nil {
			continue
		}
		dataURL := fmt.Sprintf("data:%s;base64,%s", v.Mime, base64.StdEncoding.EncodeToString(b))
		out = append(out, dataURL)
	}
	return c.JSON(fiber.Map{"images": out})
}
