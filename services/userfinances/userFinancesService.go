package userfinances

import (
	context "context"
	fmt "fmt"

	"github.com/neelchoudhary/budgetwallet-api-server/postgresql"
	"github.com/neelchoudhary/budgetwallet-api-server/utils"

	"github.com/neelchoudhary/budgetwallet-api-server/models"
	shared "github.com/neelchoudhary/budgetwallet-api-server/services/shared"
	log "github.com/sirupsen/logrus"
)

var logger = func(methodName string, err error) *log.Entry {
	if err != nil {
		return log.WithFields(log.Fields{"service": "UserFinancesService", "method": methodName, "error": err.Error()})
	}
	return log.WithFields(log.Fields{"service": "UserFinancesService", "method": methodName})
}

// Service UserFinancesService struct
type Service struct {
	txRepo                   postgresql.TxRepository
	financialItemRepo        models.FinancialItemRepository
	financialAccountRepo     models.FinancialAccountRepository
	financialTransactionRepo models.FinancialTransactionRepository
}

// NewUserFinancesServer contructor to assign repo
func NewUserFinancesServer(txRepo *postgresql.TxRepository, itemRepo *models.FinancialItemRepository, accountRepo *models.FinancialAccountRepository, financialTransactionRepo *models.FinancialTransactionRepository) UserFinancesServiceServer {
	return &Service{txRepo: *txRepo, financialItemRepo: *itemRepo, financialAccountRepo: *accountRepo, financialTransactionRepo: *financialTransactionRepo}
}

// GetFinancialInstitutions get financial institutions from DB for a user
func (s *Service) GetFinancialInstitutions(ctx context.Context, req *GetFinancialInstitutionsRequest) (*GetFinancialInstitutionsResponse, error) {
	tx, err := s.txRepo.StartTx(ctx)
	if err != nil {
		logger("GetFinancialInstitutions", err).Error(utils.StartTxErrorMsg)
		return nil, utils.InternalServerError
	}

	userID, err := utils.GetUserIDMetadata(ctx)
	if err != nil {
		logger("GetFinancialInstitutions", err).Error(fmt.Sprintf("GetUserIDMetadata failed"))
		return nil, utils.InternalServerError
	}

	items, err := s.financialItemRepo.GetUserItems(tx, userID)
	if err != nil {
		logger("GetFinancialInstitutions", err).Error(fmt.Sprintf("Repo call to GetUserItems failed"))
		return nil, utils.InternalServerError
	}

	var pbItems []*shared.FinancialInstitution
	for _, item := range items {
		pbItems = append(pbItems, dataToItemPb(item))
	}

	err = s.txRepo.CommitTx(tx)
	if err != nil {
		logger("GetFinancialInstitutions", err).Error(utils.CommitTxErrorMsg)
		return nil, err
	}

	res := &GetFinancialInstitutionsResponse{
		FinancialInstitutions: pbItems,
	}
	return res, nil
}

// GetFinancialAccounts get financial accounts from DB for a user's item
func (s *Service) GetFinancialAccounts(ctx context.Context, req *GetFinancialAccountsRequest) (*GetFinancialAccountsResponse, error) {
	tx, err := s.txRepo.StartTx(ctx)
	if err != nil {
		logger("GetFinancialAccounts", err).Error(utils.StartTxErrorMsg)
		return nil, utils.InternalServerError
	}

	userID, err := utils.GetUserIDMetadata(ctx)
	if err != nil {
		logger("GetFinancialAccounts", err).Error(fmt.Sprintf("GetUserIDMetadata failed"))
		return nil, utils.InternalServerError
	}

	accounts, err := s.financialAccountRepo.GetItemAccounts(tx, userID, req.ItemId)
	if err != nil {
		logger("GetFinancialAccounts", err).Error(fmt.Sprintf("Repo call to GetItemAccounts failed"))
		return nil, utils.InternalServerError
	}
	var pbAccounts []*shared.FinancialAccount
	for _, account := range accounts {
		pbAccounts = append(pbAccounts, dataToAccountPb(account))
	}

	err = s.txRepo.CommitTx(tx)
	if err != nil {
		logger("GetFinancialAccounts", err).Error(utils.CommitTxErrorMsg)
		return nil, err
	}

	res := &GetFinancialAccountsResponse{
		FinancialAccounts: pbAccounts,
	}
	return res, nil
}

// ToggleFinancialAccount toggle the selected property of a financial account for a user's item
func (s *Service) ToggleFinancialAccount(ctx context.Context, req *ToggleFinancialAccountRequest) (*ToggleFinancialAccountResponse, error) {
	tx, err := s.txRepo.StartTx(ctx)
	if err != nil {
		logger("ToggleFinancialAccount", err).Error(utils.StartTxErrorMsg)
		return nil, utils.InternalServerError
	}

	userID, err := utils.GetUserIDMetadata(ctx)
	if err != nil {
		logger("ToggleFinancialAccount", err).Error(fmt.Sprintf("GetUserIDMetadata failed"))
		return nil, utils.InternalServerError
	}

	account, err := s.financialAccountRepo.GetAccountByID(tx, userID, req.GetAccountId())
	if err != nil {
		logger("ToggleFinancialAccount", err).Error(fmt.Sprintf("Repo call to GetAccountByID failed"))
		return nil, utils.InternalServerError
	}
	account.SetSelected(req.GetSelected())
	err = s.financialAccountRepo.UpdateAccount(tx, userID, req.GetAccountId(), account)
	if err != nil {
		logger("ToggleFinancialAccount", err).Error(fmt.Sprintf("Repo call to UpdateAccount failed"))
		return nil, utils.InternalServerError
	}

	err = s.txRepo.CommitTx(tx)
	if err != nil {
		logger("ToggleFinancialAccount", err).Error(utils.CommitTxErrorMsg)
		return nil, err
	}

	res := &ToggleFinancialAccountResponse{
		Success: true,
	}
	return res, nil
}

// GetFinancialTransactions get all transactions for a user's item
func (s *Service) GetFinancialTransactions(ctx context.Context, req *GetFinancialTransactionsRequest) (*GetFinancialTransactionsResponse, error) {
	tx, err := s.txRepo.StartTx(ctx)
	if err != nil {
		logger("GetFinancialTransactions", err).Error(utils.StartTxErrorMsg)
		return nil, utils.InternalServerError
	}

	userID, err := utils.GetUserIDMetadata(ctx)
	if err != nil {
		logger("GetFinancialTransactions", err).Error(fmt.Sprintf("GetUserIDMetadata failed"))
		return nil, utils.InternalServerError
	}

	transactions, err := s.financialTransactionRepo.GetItemTransactions(tx, userID, req.ItemId)
	if err != nil {
		logger("GetFinancialTransactions", err).Error(fmt.Sprintf("Repo call to GetItemTransactions failed"))
		return nil, utils.InternalServerError
	}
	var pbTransactions []*shared.FinancialTransaction
	for _, transaction := range transactions {
		pbTransactions = append(pbTransactions, dataToTransactionPb(transaction))
	}

	err = s.txRepo.CommitTx(tx)
	if err != nil {
		logger("GetFinancialTransactions", err).Error(utils.CommitTxErrorMsg)
		return nil, err
	}

	res := &GetFinancialTransactionsResponse{
		FinancialTransactions: pbTransactions,
	}
	return res, nil
}

func dataToItemPb(data models.FinancialItem) *shared.FinancialInstitution {
	return &shared.FinancialInstitution{
		Id:               data.ID,
		InstitutionName:  data.InstitutionName,
		InstitutionColor: data.InstitutionColor,
		InstitutionLogo:  data.InstitutionLogo,
		ErrorCode:        data.ErrorCode,
		ErrorDevMsg:      data.ErrorDevMessage,
		ErrorUserMsg:     data.ErrorUserMessage,
	}
}

func dataToAccountPb(data models.FinancialAccount) *shared.FinancialAccount {
	return &shared.FinancialAccount{
		Id:               data.ID,
		UserId:           data.UserID,
		ItemId:           data.ItemID,
		PlaidAccountId:   data.PlaidAccountID,
		CurrentBalance:   data.CurrentBalance,
		AvailableBalance: data.AvailableBalance,
		AccountName:      data.AccountName,
		OfficialName:     data.OfficialName,
		AccountType:      data.AccountType,
		AccountSubtype:   data.AccountSubType,
		AccountMask:      data.AccountMask,
		Selected:         data.Selected,
	}
}

func dataToTransactionPb(data models.FinancialTransaction) *shared.FinancialTransaction {
	return &shared.FinancialTransaction{
		Id:                 data.ID,
		UserId:             data.UserID,
		ItemId:             data.ItemID,
		AccountId:          data.AccountID,
		CategoryId:         data.CategoryID,
		PlaidAccountId:     data.PlaidAccountID,
		PlaidCategoryId:    data.PlaidCategoryID,
		PlaidTransactionId: data.PlaidTransactionID,
		Name:               data.Name,
		Amount:             data.Amount,
		Date:               data.Date,
		Pending:            data.Pending,
	}
}
