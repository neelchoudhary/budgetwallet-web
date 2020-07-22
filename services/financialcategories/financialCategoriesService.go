package financialcategories

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
		return log.WithFields(log.Fields{"service": "FinancialCategoriesService", "method": methodName, "error": err.Error()})
	}
	return log.WithFields(log.Fields{"service": "FinancialCategoriesService", "method": methodName})
}

// Service FinancialCategoriesService struct
type Service struct {
	txRepo                postgresql.TxRepository
	financialCategoryRepo models.FinancialCategoryRepository
	plaidClient           *plaid.Client
}

// NewFinancialCategoriesServer contructor to assign repo
func NewFinancialCategoriesServer(txRepo *postgresql.TxRepository, categoryRepo *models.FinancialCategoryRepository, plaidClient *plaid.Client) FinancialCategoryServiceServer {
	return &Service{txRepo: *txRepo, financialCategoryRepo: *categoryRepo, plaidClient: plaidClient}
}

// GetFinancialCategories get all financial categories
func (s *Service) GetFinancialCategories(ctx context.Context, req *Empty) (*GetFinancialCategoriesResponse, error) {
	tx, err := s.txRepo.StartTx(ctx)
	if err != nil {
		logger("GetFinancialCategories", err).Error(utils.StartTxErrorMsg)
		return nil, utils.InternalServerError
	}

	categories, err := s.financialCategoryRepo.GetFinancialCategories(tx)
	if err != nil {
		logger("GetFinancialCategories", err).Error(fmt.Sprintf("Repo call to GetFinancialCategories failed"))
		return nil, utils.InternalServerError
	}
	var pbCategories []*FinancialCategory
	for _, category := range categories {
		pbCategories = append(pbCategories, dataToCategoryPb(category))
	}

	err = s.txRepo.CommitTx(tx)
	if err != nil {
		logger("GetFinancialCategories", err).Error(utils.CommitTxErrorMsg)
		return nil, err
	}

	res := &GetFinancialCategoriesResponse{
		FinancialCategories: pbCategories,
	}
	return res, nil
}

func dataToCategoryPb(data models.FinancialCategory) *FinancialCategory {
	return &FinancialCategory{
		Id:    data.ID,
		Name:  data.Name,
		Group: data.Group,
	}
}
