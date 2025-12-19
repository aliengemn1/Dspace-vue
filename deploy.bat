@echo off
echo ========================================
echo  DSpace Vue Deployment Script
echo ========================================
echo.

echo Step 1: Building Vue application...
call npm run build
if errorlevel 1 (
    echo Build failed!
    exit /b 1
)
echo Build completed successfully!
echo.

echo Step 2: Copying files to server...
echo Password: P@ssw0rd
scp -r dist/* dspace@192.168.2.129:/opt/dspace-vue/
if errorlevel 1 (
    echo SCP failed! Make sure the server is accessible.
    exit /b 1
)
echo Files copied successfully!
echo.

echo Step 3: Connect to server and start the app...
echo Run these commands on the server:
echo.
echo   ssh dspace@192.168.2.129
echo   cd /opt/dspace-vue
echo   pm2 serve . 4000 --spa --name dspace-vue
echo.
echo Or for first-time setup:
echo   sudo npm install -g serve pm2
echo   pm2 serve /opt/dspace-vue 4000 --spa --name dspace-vue
echo   pm2 save
echo.
echo ========================================
echo  Deployment Complete!
echo  Access: http://192.168.2.129:4000
echo ========================================
