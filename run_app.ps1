# run_app.ps1 - Launcher for Smart Expense Tracker

$ErrorActionPreference = "Stop"

$localNodeDir = Join-Path $PSScriptRoot "nodejs"
$localNodeExe = Join-Path $localNodeDir "node.exe"

# 1. Check if node is installed globally
$nodeInPath = $false
try {
    $null = Get-Command node -ErrorAction Stop
    $nodeInPath = $true
    Write-Host "Found global Node.js installation." -ForegroundColor Green
} catch {
    Write-Host "Node.js not found in system PATH. Checking local nodejs folder..." -ForegroundColor Yellow
}

if (-not $nodeInPath) {
    if (-not (Test-Path $localNodeExe)) {
        Write-Host "Local Node.js not found. Downloading portable Node.js LTS v20..." -ForegroundColor Cyan
        $zipPath = Join-Path $PSScriptRoot "node.zip"
        $downloadUrl = "https://nodejs.org/dist/v20.11.1/node-v20.11.1-win-x64.zip"
        
        # Download Node.js zip
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath -UseBasicParsing
        
        Write-Host "Extracting Node.js..." -ForegroundColor Cyan
        $tempDir = Join-Path $PSScriptRoot "node_temp"
        if (Test-Path $tempDir) {
            Remove-Item $tempDir -Recurse -Force
        }
        Expand-Archive -Path $zipPath -DestinationPath $tempDir -Force
        
        # Move extracted files to nodejs
        $extractedDir = Join-Path $tempDir "node-v20.11.1-win-x64"
        if (Test-Path $localNodeDir) {
            Remove-Item $localNodeDir -Recurse -Force
        }
        Move-Item -Path $extractedDir -Destination $localNodeDir -Force
        
        # Cleanup
        Remove-Item $zipPath -Force
        Remove-Item $tempDir -Recurse -Force
        Write-Host "Node.js successfully configured locally in 'nodejs/' folder." -ForegroundColor Green
    } else {
        Write-Host "Found local Node.js installation in 'nodejs/' folder." -ForegroundColor Green
    }
    
    # Add local nodejs directory to PATH for the current process
    $env:PATH = "$localNodeDir;" + $env:PATH
    Write-Host "Local Node.js added to active process PATH." -ForegroundColor Cyan
}

# 2. Check if node_modules exists in root, frontend, and backend
$rootModules = Join-Path $PSScriptRoot "node_modules"
$frontendModules = Join-Path (Join-Path $PSScriptRoot "frontend") "node_modules"
$backendModules = Join-Path (Join-Path $PSScriptRoot "backend") "node_modules"

if (-not (Test-Path $rootModules) -or -not (Test-Path $frontendModules) -or -not (Test-Path $backendModules)) {
    Write-Host "Installing dependencies... This may take a minute." -ForegroundColor Cyan
    npm run install-all
    Write-Host "All dependencies installed successfully." -ForegroundColor Green
}

# 3. Start the application
Write-Host "Launching Smart Expense Tracker concurrently..." -ForegroundColor Green
npm run dev
