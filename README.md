# ESOP
## DataBase Credentials
-- Url -- http://localhost:8080  
System: PostgreSQL
Server: esop-db
Username: esop_admin
Password: secure_password_123
Database: esop_management




curl -X POST https://didactic-goggles-9v5rq6prr5x3p5r5-3000.app.github.dev/api/auth/BulkAddEmployees   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijg5MDExZTFmLTIxZTgtNDNiMS1iNzkzLTNlYWI2NDQ4MTBlOCIsImVtYWlsIjoicmF2aUBjdHMuY29tIiwiaWF0IjoxNzcyNDQyMjMyLCJleHAiOjE3NzI0NDU4MzJ9.B7u7N6Vn00NS7dQKhwJ-WpKhExavlG8HKgh3z4tgWrk"   -F "file=@./SampleExcelData.csv"





#### docker-compose up --build --remove-orphans