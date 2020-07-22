package auth

import (
	"context"
	"fmt"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/neelchoudhary/budgetwallet-api-server/models"
	"github.com/neelchoudhary/budgetwallet-api-server/utils"
	"golang.org/x/crypto/bcrypt"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

var logger = func(methodName string, err error) *log.Entry {
	if err != nil {
		return log.WithFields(log.Fields{"service": "AuthService", "method": methodName, "error": err.Error()})
	}
	return log.WithFields(log.Fields{"service": "AuthService", "method": methodName})
}

// Service ...
type Service struct {
	userRepo   models.UserRepository
	jwtManager *utils.JWTManager
}

// NewAuthServiceServer contructor to assign repo
func NewAuthServiceServer(userRepo *models.UserRepository, jwtManager *utils.JWTManager) AuthServiceServer {
	return &Service{userRepo: *userRepo, jwtManager: jwtManager}
}

// Signup ...
func (s *Service) Signup(ctx context.Context, req *SignupRequest) (*SignupResponse, error) {
	// Check if email already exists in db
	signUpUser := req.GetSignUpUser()
	if signUpUser.GetFullname() == "" || signUpUser.GetEmail() == "" || signUpUser.GetPassword() == "" {
		logger("Signup", nil).Info("Invalid Arguments, all fields are required")
		return nil, status.Errorf(codes.InvalidArgument, fmt.Sprintf("All fields are required"))
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(signUpUser.GetPassword()), 10)
	if err != nil {
		logger("Signup", err).Info("Failed to generate hash from passsword")
		return nil, utils.InternalServerError
	}
	//uniqueID := uuid.NewV4()
	newUser := User{
		Email:     signUpUser.Email,
		Password:  string(hash),
		Fullname:  signUpUser.Fullname,
		CreatedOn: time.Now().Format("2006-01-02T15:04:05"),
	}
	err = s.userRepo.CreateUser(*signUpPbToData(newUser))
	if err != nil {
		logger("Signup", err).Info("Repo call to CreateUser failed")
		return nil, utils.InternalServerError
	}

	res := &SignupResponse{
		Success: true,
	}

	return res, nil
}

// Login ...
func (s *Service) Login(ctx context.Context, req *LoginRequest) (*LoginResponse, error) {
	loginUser := req.GetLoginUser()
	email := loginUser.GetEmail()
	password := loginUser.GetPassword()
	userToLogIn, err := s.userRepo.GetUserByEmail(email)
	if err != nil {
		logger("Login", err).Info("Repo call to GetUserByEmail failed")
		return nil, utils.InternalServerError
	}
	tokenString, err := userToLogIn.Login(password, s.jwtManager)
	// Returns grpc formatted error
	if err != nil {
		logger("Login", err).Info("User call to Login failed")
		return nil, err
	}

	res := &LoginResponse{
		Success: true,
		Token:   tokenString,
	}
	return res, nil
}

func signUpPbToData(data User) *models.User {
	return &models.User{
		Email:     data.Email,
		Password:  data.Password,
		FullName:  data.Fullname,
		CreatedOn: data.CreatedOn,
	}
}
