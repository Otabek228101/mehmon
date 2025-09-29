package models

import (
	"time"
)

type Receipt struct {
	ID            uint       `json:"id" gorm:"primaryKey"`
	ReceiptNumber string     `json:"receiptNumber" gorm:"column:receipt_number"`
	ClientName    string     `json:"clientName" gorm:"column:client_name"`
	ClientEmail   string     `json:"clientEmail" gorm:"column:client_email"`
	ClientPhone   string     `json:"clientPhone" gorm:"column:client_phone"`
	ReceiptDate   time.Time  `json:"receiptDate" gorm:"column:receipt_date"`
	AmountPaid    float64    `json:"amountPaid" gorm:"column:amount_paid"`
	CreatedAt     time.Time  `json:"createdAt"`
	UpdatedAt     time.Time  `json:"updatedAt"`
	Activities    []Activity `json:"activities" gorm:"foreignKey:ReceiptID"`
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
	PickupLocation  string     `json:"pickupLocation" gorm:"column:pickup_location"`
	DropoffLocation string     `json:"dropoffLocation" gorm:"column:dropoff_location"`
	TransferType    string     `json:"transferType" gorm:"column:transfer_type"`
	Description     string     `json:"description" gorm:"column:description"`
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`
}

type Hotel struct {
	ID           uint         `json:"id" gorm:"primaryKey"`
	Name         string       `json:"name" gorm:"column:name;not null"`
	City         string       `json:"city" gorm:"column:city;not null"`
	GroupName    string       `json:"group_name" gorm:"column:group_name"`
	Type         string       `json:"type" gorm:"column:type"`
	Stars        int          `json:"stars" gorm:"column:stars"`
	Address      string       `json:"address" gorm:"column:address;not null"`
	LocationLink string       `json:"location_link" gorm:"column:location_link"`
	WebsiteLink  string       `json:"website_link" gorm:"column:website_link"`
	Breakfast    bool         `json:"breakfast" gorm:"column:breakfast;default:false"`
	Images       []HotelImage `json:"images" gorm:"foreignKey:HotelID"`
}

type HotelImage struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	HotelID   uint      `json:"hotelId" gorm:"column:hotel_id;index"`
	Path      string    `json:"path" gorm:"column:path"`
	Mime      string    `json:"mime" gorm:"column:mime"`
	SortOrder int       `json:"sortOrder" gorm:"column:sort_order;default:0"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type CarRental struct {
	ID   uint   `json:"id" gorm:"primaryKey"`
	Name string `json:"name" gorm:"column:name"`
}

type Proposal struct {
	ID             uint           `json:"id" gorm:"primaryKey"`
	ProposalNumber string         `json:"proposalNumber" gorm:"column:proposal_number"`
	ClientName     string         `json:"clientName" gorm:"column:client_name"`
	Guests         int            `json:"guests" gorm:"column:guests"`
	CheckIn        time.Time      `json:"checkIn" gorm:"column:check_in"`
	CheckOut       time.Time      `json:"checkOut" gorm:"column:check_out"`
	Price          float64        `json:"price" gorm:"column:price"`
	Breakfast      bool           `json:"breakfast" gorm:"column:breakfast;default:false"`
	FreeCancel     bool           `json:"freeCancel" gorm:"column:free_cancel;default:false"`
	HotelID        uint           `json:"hotelId" gorm:"column:hotel_id"`
	CreatedAt      time.Time      `json:"createdAt"`
	UpdatedAt      time.Time      `json:"updatedAt"`
	Hotel          *Hotel         `json:"hotel" gorm:"foreignKey:HotelID"`
	Rooms          []ProposalRoom `json:"rooms" gorm:"foreignKey:ProposalID"`
}

type ProposalRoom struct {
	ID         uint `json:"id" gorm:"primaryKey"`
	ProposalID uint `json:"proposalId" gorm:"column:proposal_id"`
	Count      int  `json:"count" gorm:"column:count"`
}

type CreateHotelRequest struct {
	Name         string `json:"name"`
	City         string `json:"city"`
	GroupName    string `json:"group_name"`
	Type         string `json:"type"`
	Stars        int    `json:"stars"`
	Address      string `json:"address"`
	LocationLink string `json:"location_link"`
	WebsiteLink  string `json:"website_link"`
	Breakfast    bool   `json:"breakfast"`
}

type ProposalRequest struct {
	ClientName string        `json:"clientName"`
	Guests     int           `json:"guests"`
	CheckIn    string        `json:"checkIn"`
	CheckOut   string        `json:"checkOut"`
	Price      float64       `json:"price"`
	Breakfast  bool          `json:"breakfast"`
	FreeCancel bool          `json:"freeCancel"`
	HotelID    uint          `json:"hotelId"`
	Rooms      []RoomRequest `json:"rooms"`
}

type RoomRequest struct {
	Count int `json:"count"`
}
