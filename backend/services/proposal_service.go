package services

import (
	"fmt"
	"strconv"

	"github.com/Otabek228101/mehmon/database"
	"github.com/Otabek228101/mehmon/models"
)

func GenerateProposalNumber() string {
	var lastProposal models.Proposal
	result := database.DB.Order("created_at desc").First(&lastProposal)

	nextNumber := 1
	if result.Error == nil && lastProposal.ProposalNumber != "" {
		numStr := lastProposal.ProposalNumber[1:]
		num, err := strconv.Atoi(numStr)
		if err == nil {
			nextNumber = num + 1
		}
	}

	return fmt.Sprintf("P%05d", nextNumber)
}
