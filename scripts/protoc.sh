protoc services/auth/auth.proto -I=. --js_out=import_style=commonjs:. --grpc-web_out=import_style=commonjs,mode=grpcwebtext:.

# protoc services/auth/auth.proto -I=. --go_opt=paths=source_relative --go_out=plugins=grpc:.
# protoc services/shared/shared.proto -I=. --go_opt=paths=source_relative --go_out=plugins=grpc:.
# protoc services/plaidfinances/plaidFinances.proto -I=. --go_opt=paths=source_relative --go_out=plugins=grpc:.
# protoc services/userfinances/userFinances.proto -I=. --go_opt=paths=source_relative --go_out=plugins=grpc:. 
# protoc services/financialcategories/financialCategories.proto -I=. --go_opt=paths=source_relative --go_out=plugins=grpc:. 
# protoc services/dataprocessing/dataProcessing.proto -I=. --go_opt=paths=source_relative --go_out=plugins=grpc:.
# protoc services/webhooks/webhooks.proto -I=. --go_opt=paths=source_relative --go_out=plugins=grpc:.