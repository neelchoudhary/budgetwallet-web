package dataprocessing

import (
	context "context"
	fmt "fmt"
	math "math"
	"strings"
	"time"

	"github.com/neelchoudhary/budgetwallet-api-server/models"
	"github.com/neelchoudhary/budgetwallet-api-server/postgresql"
	"github.com/neelchoudhary/budgetwallet-api-server/utils"
	log "github.com/sirupsen/logrus"
)

var logger = func(methodName string, err error) *log.Entry {
	if err != nil {
		return log.WithFields(log.Fields{"service": "DataProcessingService", "method": methodName, "error": err.Error()})
	}
	return log.WithFields(log.Fields{"service": "DataProcessingService", "method": methodName})
}

// Service DataProcessingService struct
type Service struct {
	txRepo                   postgresql.TxRepository
	financialAccountRepo     models.FinancialAccountRepository
	financialTransactionRepo models.FinancialTransactionRepository
}

// NewDataProcessingServer contructor to assign repo
func NewDataProcessingServer(txRepo *postgresql.TxRepository, accountRepo *models.FinancialAccountRepository, transactionRepo *models.FinancialTransactionRepository) DataProcessingServiceServer {
	return &Service{txRepo: *txRepo, financialAccountRepo: *accountRepo, financialTransactionRepo: *transactionRepo}
}

// GetAccountDailySnapshots get daily snapshots for an account
func (s *Service) GetAccountDailySnapshots(ctx context.Context, req *GetAccountDailySnapshotsRequest) (*GetAccountDailySnapshotsResponse, error) {
	tx, err := s.txRepo.StartTx(ctx)
	if err != nil {
		logger("GetAccountDailySnapshots", err).Error(utils.StartTxErrorMsg)
		return nil, utils.InternalServerError
	}

	userID, err := utils.GetUserIDMetadata(ctx)
	if err != nil {
		logger("GetAccountDailySnapshots", err).Error(fmt.Sprintf("GetUserIDMetadata failed"))
		return nil, utils.InternalServerError
	}

	transactions, err := s.financialTransactionRepo.GetAccountTransactions(tx, userID, req.GetAccountId())
	if err != nil {
		logger("GetAccountDailySnapshots", err).Error(fmt.Sprintf("Repo call to GetAccountTransactions failed"))
		return nil, utils.InternalServerError
	}

	// Get oldest date
	oldestDate := transactions[len(transactions)-1].Date

	// Find current date
	currentDate := time.Now().Format("2006-01-02")

	// Get account to find current balance
	account, err := s.financialAccountRepo.GetAccountByID(tx, userID, req.GetAccountId())
	if err != nil {
		logger("GetAccountDailySnapshots", err).Error(fmt.Sprintf("Repo call to GetAccountByID failed"))
		return nil, utils.InternalServerError
	}
	availableBalance := account.AvailableBalance

	accountDailySnapshots := make([]*AccountDailySnapshot, 0)

	// Loop through dates starting from current date to oldest date
	for date := currentDate; DateComparator(date, oldestDate); date = DateDecrementer(date) {
		// Get all transactions on that date => list of transactions on date
		transactionsOnDate := make([]models.FinancialTransaction, 0)
		for _, transaction := range transactions {
			if transaction.Date == date {
				transactionsOnDate = append(transactionsOnDate, transaction)
			}
		}

		// Loop through list of transactions on date and find balance, cash in, and cash out
		dailyCashOut := 0.0
		dailyCashIn := 0.0
		for _, transaction := range transactionsOnDate {
			if transaction.Amount > 0 {
				dailyCashOut += transaction.Amount
			} else {
				dailyCashIn += (transaction.Amount * -1)
			}
		}
		endBalance := availableBalance
		availableBalance = availableBalance + dailyCashOut - dailyCashIn

		// Insert new daily_account record with the above info for the date.
		accountDailySnapshot := &AccountDailySnapshot{
			ItemId:          req.GetItemId(),
			AccountId:       req.GetAccountId(),
			Date:            date,
			StartDayBalance: math.Round(availableBalance*100) / 100,
			EndDayBalance:   math.Round(endBalance*100) / 100,
			CashOut:         math.Round(dailyCashOut*100) / 100,
			CashIn:          math.Round(dailyCashIn*100) / 100,
		}
		accountDailySnapshots = append(accountDailySnapshots, accountDailySnapshot)
	}

	err = s.txRepo.CommitTx(tx)
	if err != nil {
		logger("GetAccountDailySnapshots", err).Error(utils.CommitTxErrorMsg)
		return nil, err
	}

	res := &GetAccountDailySnapshotsResponse{
		AccountDailySnapshots: accountDailySnapshots,
	}
	return res, nil
}

// GetAccountMonthlySnapshots get monthly snapshots for an account
func (s *Service) GetAccountMonthlySnapshots(ctx context.Context, req *GetAccountMonthlySnapshotsRequest) (*GetAccountMonthlySnapshotsResponse, error) {
	tx, err := s.txRepo.StartTx(ctx)
	if err != nil {
		logger("GetAccountMonthlySnapshots", err).Error(utils.StartTxErrorMsg)
		return nil, utils.InternalServerError
	}

	userID, err := utils.GetUserIDMetadata(ctx)
	if err != nil {
		logger("GetAccountMonthlySnapshots", err).Error(fmt.Sprintf("GetUserIDMetadata failed"))
		return nil, utils.InternalServerError
	}

	transactions, err := s.financialTransactionRepo.GetAccountTransactions(tx, userID, req.GetAccountId())
	if err != nil {
		logger("GetAccountMonthlySnapshots", err).Error(fmt.Sprintf("Repo call to GetAccountTransactions failed"))
		return nil, utils.InternalServerError
	}

	// Get oldest date
	oldestDate := transactions[len(transactions)-1].Date
	oldestDateTime, _ := time.Parse("2006-01-02", oldestDate)
	oldestDate = oldestDateTime.AddDate(0, 0, 1+(-1*oldestDateTime.Day())).Format("2006-01-02")

	// Find current date
	currentDate := time.Now().AddDate(0, 0, 1+(-1*time.Now().Day())).Format("2006-01-02")

	// Get account to find current balance
	account, err := s.financialAccountRepo.GetAccountByID(tx, userID, req.GetAccountId())
	if err != nil {
		logger("GetAccountMonthlySnapshots", err).Error(fmt.Sprintf("Repo call to GetAccountByID failed"))
		return nil, utils.InternalServerError
	}
	availableBalance := account.AvailableBalance

	accountMonthlySnapshots := make([]*AccountMonthlySnapshot, 0)

	// Loop through dates starting from current date to oldest date
	for date := currentDate; DateComparator(date, oldestDate); date = MonthDecrementer(date) {
		// Get all transactions on that date => list of transactions on date
		transactionsInMonth := make([]models.FinancialTransaction, 0)
		for _, transaction := range transactions {
			if WithinMonth(transaction.Date, date) {
				transactionsInMonth = append(transactionsInMonth, transaction)
			}
		}

		// Loop through list of transactions on date and find balance, cash in, and cash out
		monthlyCashOut := 0.0
		monthlyCashIn := 0.0
		for _, transaction := range transactionsInMonth {
			if transaction.Amount > 0 {
				monthlyCashOut += transaction.Amount
			} else {
				monthlyCashIn += (transaction.Amount * -1)
			}
		}
		endBalance := availableBalance
		availableBalance = availableBalance + monthlyCashOut - monthlyCashIn

		// Insert new daily_account record with the above info for the date.
		accountMonthlySnapshot := &AccountMonthlySnapshot{
			ItemId:            req.GetItemId(),
			AccountId:         req.GetAccountId(),
			Date:              date,
			StartMonthBalance: math.Round(availableBalance*100) / 100,
			EndMonthBalance:   math.Round(endBalance*100) / 100,
			CashOut:           math.Round(monthlyCashOut*100) / 100,
			CashIn:            math.Round(monthlyCashIn*100) / 100,
		}
		accountMonthlySnapshots = append(accountMonthlySnapshots, accountMonthlySnapshot)
	}

	err = s.txRepo.CommitTx(tx)
	if err != nil {
		logger("GetAccountMonthlySnapshots", err).Error(utils.CommitTxErrorMsg)
		return nil, err
	}

	res := &GetAccountMonthlySnapshotsResponse{
		AccountMonthlySnapshots: accountMonthlySnapshots,
	}
	return res, nil
}

// DateComparator returns true if date1 is greater than or equal to date2
func DateComparator(date1 string, date2 string) bool {
	// Date format: YYYY-MM-DD
	date1Slice := strings.Split(date1, "-")
	date2Slice := strings.Split(date2, "-")
	// Year comparison
	if date1Slice[0] > date2Slice[0] {
		return true
	} else if date1Slice[0] < date2Slice[0] {
		return false
	}
	// Month comparison
	if date1Slice[1] > date2Slice[1] {
		return true
	} else if date1Slice[1] < date2Slice[1] {
		return false
	}

	// Day comparison
	if date1Slice[2] >= date2Slice[2] {
		return true
	} else if date1Slice[2] < date2Slice[2] {
		return false
	}
	return false
}

// DateDecrementer decrements the given date and returns it
func DateDecrementer(date string) string {
	// Date format: YYYY-MM-DD
	d, _ := time.Parse("2006-01-02", date)
	decrementedDate := d.AddDate(0, 0, -1)
	return decrementedDate.Format("2006-01-02")
}

// WithinMonth returns true if date is within the given month and year
func WithinMonth(date string, monthYear string) bool {
	// Date format: YYYY-MM-DD
	date1Slice := strings.Split(date, "-")
	date2Slice := strings.Split(monthYear, "-")
	// Year comparison
	if date1Slice[0] != date2Slice[0] {
		return false
	}
	// Month comparison
	if date1Slice[1] != date2Slice[1] {
		return false
	}
	return true
}

// MonthDecrementer decrements the given date by a month and returns it
func MonthDecrementer(date string) string {
	// Date format: YYYY-MM-DD
	d, _ := time.Parse("2006-01-02", date)
	decrementedDate := d.AddDate(0, -1, 0)
	return decrementedDate.Format("2006-01-02")
}
