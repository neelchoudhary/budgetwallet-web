package plaidfinances

import (
	context "context"
	fmt "fmt"
	"time"

	"github.com/plaid/plaid-go/plaid"
	log "github.com/sirupsen/logrus"

	"github.com/neelchoudhary/budgetwallet-api-server/models"
	"github.com/neelchoudhary/budgetwallet-api-server/postgresql"
	"github.com/neelchoudhary/budgetwallet-api-server/utils"
)

var logger = func(methodName string, err error) *log.Entry {
	if err != nil {
		return log.WithFields(log.Fields{"service": "PlaidFinancesService", "method": methodName, "error": err.Error()})
	}
	return log.WithFields(log.Fields{"service": "PlaidFinancesService", "method": methodName})
}

// Service PlaidFinancesService struct
type Service struct {
	txRepo                   postgresql.TxRepository
	financialItemRepo        models.FinancialItemRepository
	financialAccountRepo     models.FinancialAccountRepository
	financialTransactionRepo models.FinancialTransactionRepository
	financialCategoryRepo    models.FinancialCategoryRepository
	plaidClient              *plaid.Client
}

// NewPlaidFinancesServer contructor to assign repo
func NewPlaidFinancesServer(
	txRepo *postgresql.TxRepository,
	itemRepo *models.FinancialItemRepository,
	accountRepo *models.FinancialAccountRepository,
	transactionRepo *models.FinancialTransactionRepository,
	financialCategoryRepo *models.FinancialCategoryRepository,
	plaidClient *plaid.Client) PlaidFinancesServiceServer {
	return &Service{txRepo: *txRepo, financialItemRepo: *itemRepo, financialAccountRepo: *accountRepo, financialTransactionRepo: *transactionRepo, financialCategoryRepo: *financialCategoryRepo, plaidClient: plaidClient}
}

// LinkFinancialInstitution link a new financial institution from Plaid and add item and accounts to DB
func (s *Service) LinkFinancialInstitution(ctx context.Context, req *LinkFinancialInstitutionRequest) (*LinkFinancialInstitutionResponse, error) {
	tx, err := s.txRepo.StartTx(ctx)
	if err != nil {
		logger("LinkFinancialInstitution", err).Error(utils.StartTxErrorMsg)
		return nil, utils.InternalServerError
	}

	userID, err := utils.GetUserIDMetadata(ctx)
	if err != nil {
		logger("LinkFinancialInstitution", err).Error(fmt.Sprintf("GetUserIDMetadata failed"))
		return nil, utils.InternalServerError
	}

	item, err := models.NewFinancialItemFromPlaid(userID, req.GetPublicToken(), req.GetPlaidInstitutionId(), s.plaidClient)
	if err != nil {
		logger("LinkFinancialInstitution", err).Error(fmt.Sprintf("Item call to NewFinancialItemFromPlaid failed"))
		return nil, utils.InternalServerError
	}
	err = s.financialItemRepo.AddItem(tx, item)
	if err != nil {
		logger("LinkFinancialInstitution", err).Error(fmt.Sprintf("Repo call to AddItem failed"))
		return nil, utils.InternalServerError
	}
	accounts, err := item.GetFinancialAccountsFromPlaid(userID, s.plaidClient)
	if err != nil {
		logger("LinkFinancialInstitution", err).Error(fmt.Sprintf("Item call to GetFinancialAccountsFromPlaid failed"))
		return nil, utils.InternalServerError
	}
	for _, account := range accounts {
		// Surround in db commit
		err := s.financialAccountRepo.AddAccount(tx, &account)
		if err != nil {
			logger("LinkFinancialInstitution", err).Error(fmt.Sprintf("Repo call to AddAccount failed"))
			return nil, utils.InternalServerError
		}
	}

	err = s.txRepo.CommitTx(tx)
	if err != nil {
		logger("LinkFinancialInstitution", err).Error(utils.CommitTxErrorMsg)
		return nil, utils.InternalServerError
	}

	res := &LinkFinancialInstitutionResponse{
		Success: true,
	}
	return res, nil
}

// UpdateFinancialInstitution update financial institution (item) from Plaid in DB
func (s *Service) UpdateFinancialInstitution(ctx context.Context, req *UpdateFinancialInstitutionRequest) (*UpdateFinancialInstitutionResponse, error) {
	tx, err := s.txRepo.StartTx(ctx)
	if err != nil {
		logger("UpdateFinancialInstitution", err).Error(utils.StartTxErrorMsg)
		return nil, utils.InternalServerError
	}

	userID, err := utils.GetUserIDMetadata(ctx)
	if err != nil {
		logger("UpdateFinancialInstitution", err).Error(fmt.Sprintf("GetUserIDMetadata failed"))
		return nil, utils.InternalServerError
	}

	item, err := s.financialItemRepo.GetItemByID(tx, userID, req.GetItemId())
	if err != nil {
		logger("UpdateFinancialInstitution", err).Error(fmt.Sprintf("Repo call to GetItemByID failed"))
		return nil, utils.InternalServerError
	}
	err = item.UpdateItemFromPlaid(s.plaidClient)
	if err != nil {
		logger("UpdateFinancialInstitution", err).Error(fmt.Sprintf("Item call to UpdateItemFromPlaid failed"))
		return nil, utils.InternalServerError
	}
	err = s.financialItemRepo.UpdateItem(tx, userID, req.GetItemId(), item)
	if err != nil {
		logger("UpdateFinancialInstitution", err).Error(fmt.Sprintf("Repo call to UpdateItem failed"))
		return nil, utils.InternalServerError
	}

	err = s.txRepo.CommitTx(tx)
	if err != nil {
		logger("UpdateFinancialInstitution", err).Error(utils.CommitTxErrorMsg)
		return nil, utils.InternalServerError
	}

	res := &UpdateFinancialInstitutionResponse{
		Success: true,
	}
	return res, nil
}

// UpdateFinancialAccounts update financial accounts from Plaid in DB
func (s *Service) UpdateFinancialAccounts(ctx context.Context, req *UpdateFinancialAccountsRequest) (*UpdateFinancialAccountsResponse, error) {
	tx, err := s.txRepo.StartTx(ctx)
	if err != nil {
		logger("UpdateFinancialAccounts", err).Error(utils.StartTxErrorMsg)
		return nil, utils.InternalServerError
	}

	userID, err := utils.GetUserIDMetadata(ctx)
	if err != nil {
		logger("UpdateFinancialAccounts", err).Error(fmt.Sprintf("GetUserIDMetadata failed"))
		return nil, utils.InternalServerError
	}

	item, err := s.financialItemRepo.GetItemByID(tx, userID, req.GetItemId())
	if err != nil {
		logger("UpdateFinancialAccounts", err).Error(fmt.Sprintf("Repo call to GetItemByID failed"))
		return nil, utils.InternalServerError
	}
	plaidResponse, err := s.plaidClient.GetBalances(item.PlaidAccessToken)
	if err != nil {
		logger("UpdateFinancialAccounts", err).Error(fmt.Sprintf("Plaid call to GetBalances failed"))
		return nil, utils.InternalServerError
	}
	for _, plaidAccount := range plaidResponse.Accounts {
		account, err := s.financialAccountRepo.GetAccountByPlaidID(tx, userID, plaidAccount.AccountID)
		if err != nil {
			logger("UpdateFinancialAccounts", err).Error(fmt.Sprintf("Repo call to GetAccountByPlaidID failed"))
			return nil, utils.InternalServerError
		}
		account.UpdateAccountFromPlaid(&plaidAccount)
		err = s.financialAccountRepo.UpdateAccount(tx, userID, account.GetAccountID(), account)
		if err != nil {
			logger("UpdateFinancialAccounts", err).Error(fmt.Sprintf("Repo call to UpdateAccount failed"))
			return nil, utils.InternalServerError
		}
	}

	err = s.txRepo.CommitTx(tx)
	if err != nil {
		logger("UpdateFinancialAccounts", err).Error(utils.CommitTxErrorMsg)
		return nil, utils.InternalServerError
	}

	res := &UpdateFinancialAccountsResponse{
		Success: true,
	}
	return res, nil
}

// RemoveFinancialInstitution remove financial institution (item) from Plaid and the DB
func (s *Service) RemoveFinancialInstitution(ctx context.Context, req *RemoveFinancialInstitutionRequest) (*RemoveFinancialInstitutionResponse, error) {
	tx, err := s.txRepo.StartTx(ctx)
	if err != nil {
		logger("RemoveFinancialInstitution", err).Error(utils.StartTxErrorMsg)
		return nil, utils.InternalServerError
	}

	userID, err := utils.GetUserIDMetadata(ctx)
	if err != nil {
		logger("RemoveFinancialInstitution", err).Error(fmt.Sprintf("GetUserIDMetadata failed"))
		return nil, utils.InternalServerError
	}

	item, err := s.financialItemRepo.GetItemByID(tx, userID, req.GetItemId())
	if err != nil {
		logger("RemoveFinancialInstitution", err).Error(fmt.Sprintf("Repo call to GetItemByID failed"))
		return nil, utils.InternalServerError
	}
	err = item.RemoveItemFromPlaid(s.plaidClient)
	if err != nil {
		logger("RemoveFinancialInstitution", err).Error(fmt.Sprintf("Item call to RemoveItemFromPlaid failed"))
		return nil, utils.InternalServerError
	}
	err = s.financialTransactionRepo.RemoveItemTransactions(tx, userID, req.GetItemId())
	if err != nil {
		logger("RemoveFinancialInstitution", err).Error(fmt.Sprintf("Repo call to RemoveItemTransactions failed"))
		return nil, utils.InternalServerError
	}
	err = s.financialAccountRepo.RemoveItemAccounts(tx, userID, req.GetItemId())
	if err != nil {
		logger("RemoveFinancialInstitution", err).Error(fmt.Sprintf("Repo call to RemoveItemAccounts failed"))
		return nil, utils.InternalServerError
	}
	err = s.financialItemRepo.RemoveItem(tx, userID, req.GetItemId())
	if err != nil {
		logger("RemoveFinancialInstitution", err).Error(fmt.Sprintf("Repo call to RemoveItem failed"))
		return nil, utils.InternalServerError
	}

	err = s.txRepo.CommitTx(tx)
	if err != nil {
		logger("RemoveFinancialInstitution", err).Error(utils.CommitTxErrorMsg)
		return nil, utils.InternalServerError
	}

	res := &RemoveFinancialInstitutionResponse{
		Success: true,
	}
	return res, nil
}

// AddHistoricalFinancialTransactions add all transactions since 2015 to the DB from plaid for a user's item
func (s *Service) AddHistoricalFinancialTransactions(ctx context.Context, req *AddHistoricalFinancialTransactionsRequest) (*AddHistoricalFinancialTransactionsResponse, error) {
	// Start new db transaction
	tx, err := s.txRepo.StartTx(ctx)
	if err != nil {
		logger("AddHistoricalFinancialTransactions", err).Error(utils.StartTxErrorMsg)
		return nil, utils.InternalServerError
	}

	userID, err := utils.GetUserIDMetadata(ctx)
	if err != nil {
		logger("AddHistoricalFinancialTransactions", err).Error(fmt.Sprintf("GetUserIDMetadata failed"))
		return nil, utils.InternalServerError
	}
	if req.GetUserId() != 0 {
		userID = req.GetUserId()
	}

	// Get item by id
	var item *models.FinancialItem
	if req.GetItemId() != 0 {
		item, err = s.financialItemRepo.GetItemByID(tx, userID, req.GetItemId())
		if err != nil {
			logger("AddHistoricalFinancialTransactions", err).Error(fmt.Sprintf("Repo call to GetItemByID failed"))
			return nil, utils.InternalServerError
		}
	} else {
		item, err = s.financialItemRepo.GetItemByPlaidID(tx, userID, req.GetPlaidItemId())
		if err != nil {
			logger("AddHistoricalFinancialTransactions", err).Error(fmt.Sprintf("Repo call to GetItemByPlaidID failed"))
			return nil, utils.InternalServerError
		}
	}
	// Remove all transactions for this item
	err = s.financialTransactionRepo.RemoveItemTransactions(tx, userID, item.ID)
	if err != nil {
		logger("AddHistoricalFinancialTransactions", err).Error(fmt.Sprintf("Repo call to RemoveItemTransactions failed"))
		return nil, utils.InternalServerError
	}

	// Get financial transactions for the given item from Plaid datinig back to 2015.
	allTransactions, err := item.GetFinancialTransactionsFromPlaid("2015-01-01", s.plaidClient)
	if err != nil {
		logger("AddHistoricalFinancialTransactions", err).Error(fmt.Sprintf("Item call to GetFinancialTransactionsFromPlaid failed"))
		return nil, utils.InternalServerError
	}
	for _, transaction := range allTransactions {
		// Set the account id and category id for this transaction
		account, err := s.financialAccountRepo.GetAccountByPlaidID(tx, userID, transaction.PlaidAccountID)
		if err != nil {
			logger("AddHistoricalFinancialTransactions", err).Error(fmt.Sprintf("Repo call to GetAccountByPlaidID failed"))
			return nil, utils.InternalServerError
		}
		transaction.AccountID = account.ID

		categoryID, err := s.financialCategoryRepo.GetFinancialCategoryIDByPlaidID(tx, transaction.PlaidCategoryID)
		if err != nil {
			logger("AddHistoricalFinancialTransactions", err).Error(fmt.Sprintf("Repo call to GetFinancialCategoryIDByPlaidID failed"))
			return nil, utils.InternalServerError
		}
		transaction.CategoryID = categoryID

		// Add transaction to db
		s.financialTransactionRepo.AddTransaction(tx, &transaction)
	}

	// Commit db changes
	err = s.txRepo.CommitTx(tx)
	if err != nil {
		logger("AddHistoricalFinancialTransactions", err).Error(utils.CommitTxErrorMsg)
		return nil, utils.InternalServerError
	}

	// Return response
	res := &AddHistoricalFinancialTransactionsResponse{
		NewTransactions: int64(len(allTransactions)),
	}

	return res, nil
}

// AddFinancialTransactions add new transactions from the last 10 days to the DB from plaid for a user's item
func (s *Service) AddFinancialTransactions(ctx context.Context, req *AddFinancialTransactionsRequest) (*AddFinancialTransactionsResponse, error) {
	tx, err := s.txRepo.StartTx(ctx)
	if err != nil {
		logger("AddFinancialTransactions", err).Error(utils.StartTxErrorMsg)
		return nil, utils.InternalServerError
	}

	userID, err := utils.GetUserIDMetadata(ctx)
	if err != nil {
		logger("AddFinancialTransactions", err).Error(fmt.Sprintf("GetUserIDMetadata failed"))
		return nil, utils.InternalServerError
	}
	if req.GetUserId() != 0 {
		userID = req.GetUserId()
	}

	// Get item by id
	var item *models.FinancialItem
	if req.GetItemId() != 0 {
		item, err = s.financialItemRepo.GetItemByID(tx, userID, req.GetItemId())
		if err != nil {
			logger("AddFinancialTransactions", err).Error(fmt.Sprintf("Repo call to GetItemByID failed"))
			return nil, utils.InternalServerError
		}
	} else {
		item, err = s.financialItemRepo.GetItemByPlaidID(tx, userID, req.GetPlaidItemId())
		if err != nil {
			logger("AddFinancialTransactions", err).Error(fmt.Sprintf("Repo call to GetItemByPlaidID failed"))
			return nil, utils.InternalServerError
		}
	}

	startDate := time.Now().Local().Add(time.Duration(240*3) * time.Hour * -1).Format("2006-01-02") // 10 days back
	allTransactions, err := item.GetFinancialTransactionsFromPlaid(startDate, s.plaidClient)
	if err != nil {
		logger("AddFinancialTransactions", err).Error(fmt.Sprintf("Item call to GetFinancialTransactionsFromPlaid failed"))
		return nil, utils.InternalServerError
	}
	filteredTransactions := models.FilterTransactions(allTransactions, func(t models.FinancialTransaction) bool {
		exists, err := s.financialTransactionRepo.DoesTransactionExist(tx, userID, t.PlaidTransactionID)
		if err != nil {
			logger("AddFinancialTransactions", err).Error(fmt.Sprintf("Repo call to DoesTransactionExist failed"))
			return false
		}
		return !exists
	})
	for _, transaction := range filteredTransactions {
		account, err := s.financialAccountRepo.GetAccountByPlaidID(tx, userID, transaction.PlaidAccountID)
		if err != nil {
			logger("AddFinancialTransactions", err).Error(fmt.Sprintf("Repo call to GetAccountByPlaidID failed"))
			return nil, utils.InternalServerError
		}
		transaction.AccountID = account.ID

		categoryID, err := s.financialCategoryRepo.GetFinancialCategoryIDByPlaidID(tx, transaction.PlaidCategoryID)
		if err != nil {
			logger("AddFinancialTransactions", err).Error(fmt.Sprintf("Repo call to GetFinancialCategoryIDByPlaidID failed"))
			return nil, utils.InternalServerError
		}
		transaction.CategoryID = categoryID

		s.financialTransactionRepo.AddTransaction(tx, &transaction)
	}

	err = s.txRepo.CommitTx(tx)
	if err != nil {
		logger("AddFinancialTransactions", err).Error(utils.CommitTxErrorMsg)
		return nil, utils.InternalServerError
	}

	res := &AddFinancialTransactionsResponse{
		NewTransactions: int64(len(filteredTransactions)),
	}

	return res, nil
}

// RemoveFinancialTransactions remove financial transactions from the db
func (s *Service) RemoveFinancialTransactions(ctx context.Context, req *RemoveFinancialTransactionsRequest) (*Empty, error) {
	tx, err := s.txRepo.StartTx(ctx)
	if err != nil {
		logger("RemoveFinancialTransactions", err).Error(utils.StartTxErrorMsg)
		return nil, utils.InternalServerError
	}

	userID, err := utils.GetUserIDMetadata(ctx)
	if err != nil {
		logger("RemoveFinancialTransactions", err).Error(fmt.Sprintf("GetUserIDMetadata failed"))
		return nil, utils.InternalServerError
	}
	if req.GetUserId() != 0 {
		userID = req.GetUserId()
	}

	for _, transactionID := range req.GetTransactionIds() {
		err := s.financialTransactionRepo.RemoveTransactionByID(tx, userID, transactionID)
		if err != nil {
			logger("RemoveFinancialTransactions", err).Error(fmt.Sprintf("Repo call to RemoveTransactionByID failed"))
		}
	}

	for _, plaidTransactionID := range req.GetPlaidTransactionIds() {
		transaction, err := s.financialTransactionRepo.GetTransactionByPlaidID(tx, userID, plaidTransactionID)
		if err != nil {
			logger("RemoveFinancialTransactions", err).Error(fmt.Sprintf("Repo call to GetTransactionByPlaidID failed"))
		}
		err = s.financialTransactionRepo.RemoveTransactionByID(tx, userID, transaction.ID)
		if err != nil {
			logger("RemoveFinancialTransactions", err).Error(fmt.Sprintf("Repo call to RemoveTransactionByID failed"))
		}
	}

	err = s.txRepo.CommitTx(tx)
	if err != nil {
		logger("RemoveFinancialTransactions", err).Error(utils.CommitTxErrorMsg)
		return nil, utils.InternalServerError
	}
	return &Empty{}, nil
}
