package webhooks

import (
	context "context"
	fmt "fmt"

	"github.com/neelchoudhary/budgetwallet-api-server/models"
	"github.com/neelchoudhary/budgetwallet-api-server/postgresql"
	"github.com/neelchoudhary/budgetwallet-api-server/utils"
	"github.com/plaid/plaid-go/plaid"
	log "github.com/sirupsen/logrus"
)

var logger = func(methodName string, err error) *log.Entry {
	if err != nil {
		return log.WithFields(log.Fields{"service": "WebhooksService", "method": methodName, "error": err.Error()})
	}
	return log.WithFields(log.Fields{"service": "WebhooksService", "method": methodName})
}

// Service WebhooksService struct
type Service struct {
	txRepo            postgresql.TxRepository
	financialItemRepo models.FinancialItemRepository
	plaidClient       *plaid.Client
}

// NewWebhooksServer contructor to assign repo
func NewWebhooksServer(txRepo *postgresql.TxRepository, itemRepo *models.FinancialItemRepository, plaidClient *plaid.Client) WebhooksServiceServer {
	return &Service{txRepo: *txRepo, financialItemRepo: *itemRepo, plaidClient: plaidClient}
}

// GetPlaidWebhook get plaid webhook for item
func (s *Service) GetPlaidWebhook(ctx context.Context, req *GetPlaidWebhookRequest) (*GetPlaidWebhookResponse, error) {
	tx, err := s.txRepo.StartTx(ctx)
	if err != nil {
		logger("GetPlaidWebhook", err).Error(utils.StartTxErrorMsg)
		return nil, utils.InternalServerError
	}

	userID, err := utils.GetUserIDMetadata(ctx)
	if err != nil {
		logger("GetPlaidWebhook", err).Error(fmt.Sprintf("GetUserIDMetadata failed"))
		return nil, utils.InternalServerError
	}

	item, err := s.financialItemRepo.GetItemByID(tx, userID, req.GetItemId())
	if err != nil {
		logger("UpdatePlaidWebhook", err).Error(fmt.Sprintf("Repo call to GetItemByID failed"))
		return nil, utils.InternalServerError
	}

	webhook, err := item.GetItemWebhookFromPlaid(s.plaidClient)
	if err != nil {
		logger("UpdatePlaidWebhook", err).Error(fmt.Sprintf("Item call to GetItemWebhookFromPlaid failed"))
		return nil, utils.InternalServerError
	}

	// Commit db changes
	err = s.txRepo.CommitTx(tx)
	if err != nil {
		logger("GetPlaidWebhook", err).Error(utils.CommitTxErrorMsg)
		return nil, utils.InternalServerError
	}

	res := &GetPlaidWebhookResponse{
		Webhook: webhook,
	}

	return res, nil
}

// UpdatePlaidWebhook update plaid webhook for item
func (s *Service) UpdatePlaidWebhook(ctx context.Context, req *UpdatePlaidWebhookRequest) (*UpdatePlaidWebhookResponse, error) {
	tx, err := s.txRepo.StartTx(ctx)
	if err != nil {
		logger("UpdatePlaidWebhook", err).Error(utils.StartTxErrorMsg)
		return nil, utils.InternalServerError
	}

	userID, err := utils.GetUserIDMetadata(ctx)
	if err != nil {
		logger("UpdatePlaidWebhook", err).Error(fmt.Sprintf("GetUserIDMetadata failed"))
		return nil, utils.InternalServerError
	}

	item, err := s.financialItemRepo.GetItemByID(tx, userID, req.GetItemId())
	if err != nil {
		logger("UpdatePlaidWebhook", err).Error(fmt.Sprintf("Repo call to GetItemByID failed"))
		return nil, utils.InternalServerError
	}

	err = item.UpdateItemWebhookFromPlaid(s.plaidClient, req.GetWebhook())
	if err != nil {
		logger("UpdatePlaidWebhook", err).Error(fmt.Sprintf("Item call to UpdateItemWebhookFromPlaid failed"))
		return nil, utils.InternalServerError
	}

	// Commit db changes
	err = s.txRepo.CommitTx(tx)
	if err != nil {
		logger("UpdatePlaidWebhook", err).Error(utils.CommitTxErrorMsg)
		return nil, utils.InternalServerError
	}

	res := &UpdatePlaidWebhookResponse{
		Success: true,
	}
	return res, nil
}
