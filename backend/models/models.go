package models

import (
	"time"
)

type Receipt struct {
	ID              uint       `json:"id" gorm:"primaryKey"`
	ReceiptNumber   string     `json:"receiptNumber" gorm:"column:receipt_number"`
	ClientName      string     `json:"clientName" gorm:"column:client_name"`
	ClientEmail     string     `json:"clientEmail" gorm:"column:client_email"`
	ClientPhone     string     `json:"clientPhone" gorm:"column:client_phone"`
	ReceiptDate     time.Time  `json:"receiptDate" gorm:"column:receipt_date"`
	PropertyName    string     `json:"propertyName" gorm:"column:property_name"`
	PropertyAddress string     `json:"propertyAddress" gorm:"column:property_address"`
	CheckIn         *time.Time `json:"checkIn" gorm:"column:check_in"`
	CheckOut        *time.Time `json:"checkOut" gorm:"column:check_out"`
	AmountPaid      float64    `json:"amountPaid" gorm:"column:amount_paid"`
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`

	Activities []Activity `json:"activities" gorm:"foreignKey:ReceiptID"`
}

type Activity struct {
	ID              uint       `json:"id" gorm:"primaryKey"`
	ReceiptID       uint       `json:"receiptId" gorm:"column:receipt_id"`
	Type            string     `json:"type" gorm:"column:type"`
	PropertyName    string     `json:"propertyName" gorm:"column:property_name"`
	PropertyAddress string     `json:"propertyAddress" gorm:"column:property_address"`
	CheckIn         *time.Time `json:"checkIn" gorm:"column:check_in"`
	CheckOut        *time.Time `json:"checkOut" gorm:"column:check_out"`
	Amount          float64    `json:"amount" gorm:"column:amount"`

	CarModel        string `json:"carModel" gorm:"column:car_model"`
	CarPlate        string `json:"carPlate" gorm:"column:car_plate"`
	PickupLocation  string `json:"pickupLocation" gorm:"column:pickup_location"`
	DropoffLocation string `json:"dropoffLocation" gorm:"column:dropoff_location"`
	TransferType    string `json:"transferType" gorm:"column:transfer_type"`
	Description     string `json:"description" gorm:"column:description"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type Hotel struct {
	ID      uint   `json:"id" gorm:"primaryKey"`
	Name    string `json:"name" gorm:"column:name"`
	Address string `json:"address" gorm:"column:address"`
	City    string `json:"city" gorm:"column:city"`
}

type CarRental struct {
	ID      uint   `json:"id" gorm:"primaryKey"`
	Name    string `json:"name" gorm:"column:name"`
	Address string `json:"address" gorm:"column:address"`
}
