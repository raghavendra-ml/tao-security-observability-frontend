# PowerShell script to start React dev server
Set-Location $PSScriptRoot
Write-Host "Starting React Development Server..." -ForegroundColor Green
node "node_modules/react-scripts/bin/react-scripts.js" start
