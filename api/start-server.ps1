Set-Location "c:\Users\henri\BoardSync\api"
$env:DB_TYPE = "sqlite"
$env:JWT_SECRET = "your-super-secret-jwt-key-change-this-in-production"
$env:NODE_ENV = "development"
$env:PORT = "3001"
node src/server.js
