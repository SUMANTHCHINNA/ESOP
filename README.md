# ESOP


## start-up
- docker-compose up --build
-- wait until it connects, then
- npm i
- npm run dev

## DataBase Credentials

-- Url -- http://localhost:8080  
System: PostgreSQL
Server: esop-db
Username: esop_admin
Password: secure_password_123
Database: esop_management

curl -X POST https://didactic-goggles-9v5rq6prr5x3p5r5-3000.app.github.dev/api/auth/BulkAddEmployees -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ5NWJiMWQzLTQ1NjItNDk2Zi1iYTM4LWI2YjU5OTYxNzkyMyIsImVtYWlsIjoicmF2aUBjdHMuY29tIiwiaWF0IjoxNzcyNTE1MzA4LCJleHAiOjE3NzI1MTg5MDh9.RMe0F_xVjJNfcVHEeCT4ypOhCKEqrRNz1jMJfIPcm8A" -F "file=@./SampleExcelData.csv"

#### docker-compose up --build --remove-orphans

