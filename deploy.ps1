# --- CONFIGURATION ---
$SERVER_IP = "YOUR_AWS_IP_HERE"
$PEM_FILE = "C:\path\to\your\key.pem"
$USER = "ubuntu"

# --- 1. BUILD FRONTEND ---
Write-Host "🚀 Building Frontend..." -ForegroundColor Cyan
cd erp-frontend
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Frontend Build Failed"; exit }

# --- 2. BUILD BACKEND ---
Write-Host "🚀 Building Backend..." -ForegroundColor Cyan
cd ../erp-backend
.\mvnw.cmd clean package -DskipTests
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Backend Build Failed"; exit }

# --- 3. UPLOAD FRONTEND ---
Write-Host "📤 Uploading Frontend..." -ForegroundColor Cyan
# Clear old files on server
ssh -i $PEM_FILE $USER@$SERVER_IP "sudo rm -rf /var/www/html/*"
# Upload new files
scp -i $PEM_FILE -r ../erp-frontend/dist/* $USER@$SERVER_IP:/tmp/
ssh -i $PEM_FILE $USER@$SERVER_IP "sudo mv /tmp/* /var/www/html/"

# --- 4. UPLOAD BACKEND ---
Write-Host "📤 Uploading Backend..." -ForegroundColor Cyan
scp -i $PEM_FILE target/erp-backend-0.0.1-SNAPSHOT.jar $USER@$SERVER_IP:/home/ubuntu/

# --- 5. RESTART BACKEND ---
Write-Host "🔄 Restarting Backend on Server..." -ForegroundColor Cyan
ssh -i $PEM_FILE $USER@$SERVER_IP "pkill -f java; nohup java -Xmx1024m -jar /home/ubuntu/erp-backend-0.0.1-SNAPSHOT.jar --spring.datasource.url=jdbc:postgresql://localhost:5432/erp_db --spring.datasource.username=erp_user --spring.datasource.password=1234 > /home/ubuntu/nohup.out 2>&1 &"

Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
