# ===================================
# 📁 scripts/deploy_production.ps1 - DÉPLOIEMENT PRODUCTION
# ===================================

<#
.SYNOPSIS
    Script de déploiement production pour CBM Product Explorer
.DESCRIPTION
    Déploie le backend FastAPI et le frontend React sur Windows Server
    sans Docker, avec vérifications de santé et rollback automatique
.PARAMETER Environment
    Environnement cible (staging/production)
.PARAMETER SkipTests
    Sauter les tests de validation
.EXAMPLE
    .\deploy_production.ps1 -Environment production
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("staging", "production")]
    [string]$Environment = "production",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipTests = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$RollbackOnError = $true
)

# ========================================
# CONFIGURATION
# ========================================

$ErrorActionPreference = "Stop"
$PROJECT_ROOT = "D:\Projet\CBM_Product_Explorer"
$BACKUP_DIR = "D:\Backups\CBM_Product_Explorer"
$LOG_FILE = "$PROJECT_ROOT\logs\deploy_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

# Ports
$BACKEND_PORT = if ($Environment -eq "production") { 5180 } else { 5280 }
$FRONTEND_PORT = if ($Environment -eq "production") { 5181 } else { 5281 }

# URLs
$BACKEND_URL = "http://localhost:$BACKEND_PORT"
$FRONTEND_URL = "http://localhost:$FRONTEND_PORT"
$HEALTHCHECK_URL = "$BACKEND_URL/healthcheck"

# ========================================
# FONCTIONS UTILITAIRES
# ========================================

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Host $logMessage
    Add-Content -Path $LOG_FILE -Value $logMessage
}

function Test-ServiceHealth {
    param([string]$Url, [string]$ServiceName)
    
    Write-Log "Testing $ServiceName health at $Url..." "INFO"
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Log "$ServiceName is healthy" "SUCCESS"
            return $true
        }
    } catch {
        Write-Log "$ServiceName health check failed: $_" "ERROR"
        return $false
    }
    
    return $false
}

function Stop-Service-Gracefully {
    param([string]$ProcessName, [string]$ServiceName)
    
    Write-Log "Stopping $ServiceName..." "INFO"
    
    $processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    if ($processes) {
        $processes | ForEach-Object {
            Write-Log "Stopping process $($_.Id)..." "INFO"
            Stop-Process -Id $_.Id -Force
        }
        Start-Sleep -Seconds 2
        Write-Log "$ServiceName stopped" "SUCCESS"
    } else {
        Write-Log "No $ServiceName process running" "INFO"
    }
}

function Create-Backup {
    Write-Log "Creating backup..." "INFO"
    
    $backupPath = "$BACKUP_DIR\backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
    
    # Backup backend
    if (Test-Path "$PROJECT_ROOT\backend") {
        Copy-Item -Path "$PROJECT_ROOT\backend" -Destination "$backupPath\backend" -Recurse -Force
        Write-Log "Backend backed up" "SUCCESS"
    }
    
    # Backup frontend build
    if (Test-Path "$PROJECT_ROOT\frontend\dist") {
        Copy-Item -Path "$PROJECT_ROOT\frontend\dist" -Destination "$backupPath\frontend_dist" -Recurse -Force
        Write-Log "Frontend build backed up" "SUCCESS"
    }
    
    # Cleanup old backups (keep last 5)
    Get-ChildItem -Path $BACKUP_DIR -Directory | 
        Sort-Object CreationTime -Descending | 
        Select-Object -Skip 5 | 
        Remove-Item -Recurse -Force
    
    Write-Log "Backup created at $backupPath" "SUCCESS"
    return $backupPath
}

function Restore-Backup {
    param([string]$BackupPath)
    
    Write-Log "Restoring from backup $BackupPath..." "WARNING"
    
    if (Test-Path $BackupPath) {
        # Restore backend
        if (Test-Path "$BackupPath\backend") {
            Remove-Item -Path "$PROJECT_ROOT\backend" -Recurse -Force -ErrorAction SilentlyContinue
            Copy-Item -Path "$BackupPath\backend" -Destination "$PROJECT_ROOT\backend" -Recurse -Force
            Write-Log "Backend restored" "SUCCESS"
        }
        
        # Restore frontend
        if (Test-Path "$BackupPath\frontend_dist") {
            Remove-Item -Path "$PROJECT_ROOT\frontend\dist" -Recurse -Force -ErrorAction SilentlyContinue
            Copy-Item -Path "$BackupPath\frontend_dist" -Destination "$PROJECT_ROOT\frontend\dist" -Recurse -Force
            Write-Log "Frontend restored" "SUCCESS"
        }
        
        Write-Log "Restore completed" "SUCCESS"
    } else {
        Write-Log "Backup path not found: $BackupPath" "ERROR"
    }
}

# ========================================
# DÉPLOIEMENT PRINCIPAL
# ========================================

try {
    Write-Log "========================================" "INFO"
    Write-Log "CBM PRODUCT EXPLORER - DEPLOYMENT" "INFO"
    Write-Log "Environment: $Environment" "INFO"
    Write-Log "========================================" "INFO"
    
    # Vérifier le répertoire projet
    if (-not (Test-Path $PROJECT_ROOT)) {
        throw "Project directory not found: $PROJECT_ROOT"
    }
    
    Set-Location $PROJECT_ROOT
    
    # ========================================
    # 1. CRÉER BACKUP
    # ========================================
    
    $backupPath = Create-Backup
    
    # ========================================
    # 2. ARRÊTER LES SERVICES EXISTANTS
    # ========================================
    
    Write-Log "Stopping existing services..." "INFO"
    
    Stop-Service-Gracefully -ProcessName "python" -ServiceName "Backend"
    Stop-Service-Gracefully -ProcessName "node" -ServiceName "Frontend"
    
    Start-Sleep -Seconds 3
    
    # ========================================
    # 3. DÉPLOYER LE BACKEND
    # ========================================
    
    Write-Log "Deploying backend..." "INFO"
    
    Set-Location "$PROJECT_ROOT\backend"
    
    # Vérifier environnement virtuel
    if (-not (Test-Path "venv")) {
        Write-Log "Creating Python virtual environment..." "INFO"
        python -m venv venv
    }
    
    # Activer venv et installer dépendances
    Write-Log "Installing Python dependencies..." "INFO"
    & "$PROJECT_ROOT\backend\venv\Scripts\python.exe" -m pip install --upgrade pip
    & "$PROJECT_ROOT\backend\venv\Scripts\pip.exe" install -r requirements.txt
    
    Write-Log "Backend dependencies installed" "SUCCESS"
    
    # ========================================
    # 4. DÉPLOYER LE FRONTEND
    # ========================================
    
    Write-Log "Deploying frontend..." "INFO"
    
    Set-Location "$PROJECT_ROOT\frontend"
    
    # Copier le bon .env
    $envFile = if ($Environment -eq "production") { ".env.production" } else { ".env.staging" }
    if (Test-Path $envFile) {
        Copy-Item -Path $envFile -Destination ".env.production" -Force
        Write-Log "Environment file copied: $envFile" "SUCCESS"
    }
    
    # Installer dépendances et build
    Write-Log "Installing Node dependencies..." "INFO"
    npm ci --production
    
    Write-Log "Building frontend..." "INFO"
    npm run build
    
    if (-not (Test-Path "dist")) {
        throw "Frontend build failed - dist directory not found"
    }
    
    Write-Log "Frontend built successfully" "SUCCESS"
    
    # ========================================
    # 5. TESTS DE VALIDATION (si non skippé)
    # ========================================
    
    if (-not $SkipTests) {
        Write-Log "Running validation tests..." "INFO"
        
        # Vérifier fichiers critiques backend
        $criticalBackendFiles = @(
            "$PROJECT_ROOT\backend\app\main.py",
            "$PROJECT_ROOT\backend\app\settings.py",
            "$PROJECT_ROOT\backend\requirements.txt"
        )
        
        foreach ($file in $criticalBackendFiles) {
            if (-not (Test-Path $file)) {
                throw "Critical backend file missing: $file"
            }
        }
        
        # Vérifier fichiers critiques frontend
        $criticalFrontendFiles = @(
            "$PROJECT_ROOT\frontend\dist\index.html",
            "$PROJECT_ROOT\frontend\dist\assets"
        )
        
        foreach ($file in $criticalFrontendFiles) {
            if (-not (Test-Path $file)) {
                throw "Critical frontend file missing: $file"
            }
        }
        
        Write-Log "Validation tests passed" "SUCCESS"
    }
    
    # ========================================
    # 6. DÉMARRER LES SERVICES
    # ========================================
    
    Write-Log "Starting services..." "INFO"
    
    # Démarrer Backend
    Write-Log "Starting backend on port $BACKEND_PORT..." "INFO"
    
    $backendLogFile = "$PROJECT_ROOT\logs\backend_$Environment.log"
    
    Start-Process -FilePath "$PROJECT_ROOT\backend\venv\Scripts\python.exe" `
        -ArgumentList "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "$BACKEND_PORT" `
        -WorkingDirectory "$PROJECT_ROOT\backend" `
        -RedirectStandardOutput $backendLogFile `
        -RedirectStandardError "$PROJECT_ROOT\logs\backend_$Environment.error.log" `
        -WindowStyle Hidden
    
    Start-Sleep -Seconds 5
    
    # Vérifier backend health
    $backendHealthy = Test-ServiceHealth -Url $HEALTHCHECK_URL -ServiceName "Backend"
    if (-not $backendHealthy) {
        throw "Backend health check failed"
    }
    
    # Démarrer Frontend (serve static)
    Write-Log "Starting frontend on port $FRONTEND_PORT..." "INFO"
    
    $frontendLogFile = "$PROJECT_ROOT\logs\frontend_$Environment.log"
    
    Start-Process -FilePath "npx" `
        -ArgumentList "serve", "-s", "dist", "-l", "$FRONTEND_PORT" `
        -WorkingDirectory "$PROJECT_ROOT\frontend" `
        -RedirectStandardOutput $frontendLogFile `
        -RedirectStandardError "$PROJECT_ROOT\logs\frontend_$Environment.error.log" `
        -WindowStyle Hidden
    
    Start-Sleep -Seconds 3
    
    # Vérifier frontend
    $frontendHealthy = Test-ServiceHealth -Url "$FRONTEND_URL" -ServiceName "Frontend"
    if (-not $frontendHealthy) {
        throw "Frontend health check failed"
    }
    
    # ========================================
    # 7. VÉRIFICATIONS POST-DÉPLOIEMENT
    # ========================================
    
    Write-Log "Running post-deployment checks..." "INFO"
    
    # Vérifier Redis
    try {
        redis-cli ping | Out-Null
        Write-Log "Redis is accessible" "SUCCESS"
    } catch {
        Write-Log "Redis not accessible - cache will be disabled" "WARNING"
    }
    
    # Vérifier SQL Server (via healthcheck)
    try {
        $healthResponse = Invoke-RestMethod -Uri $HEALTHCHECK_URL -Method GET
        if ($healthResponse.database -eq "ok") {
            Write-Log "Database connection verified" "SUCCESS"
        } else {
            Write-Log "Database connection issue detected" "WARNING"
        }
    } catch {
        Write-Log "Could not verify database connection" "WARNING"
    }
    
    # ========================================
    # 8. DÉPLOIEMENT RÉUSSI
    # ========================================
    
    Write-Log "========================================" "SUCCESS"
    Write-Log "DEPLOYMENT SUCCESSFUL!" "SUCCESS"
    Write-Log "========================================" "SUCCESS"
    Write-Log "Backend:  $BACKEND_URL" "INFO"
    Write-Log "Frontend: $FRONTEND_URL" "INFO"
    Write-Log "Health:   $HEALTHCHECK_URL" "INFO"
    Write-Log "Logs:     $PROJECT_ROOT\logs\" "INFO"
    Write-Log "========================================" "SUCCESS"
    
    exit 0
    
} catch {
    Write-Log "========================================" "ERROR"
    Write-Log "DEPLOYMENT FAILED!" "ERROR"
    Write-Log "Error: $_" "ERROR"
    Write-Log "========================================" "ERROR"
    
    # Rollback si activé
    if ($RollbackOnError -and $backupPath) {
        Write-Log "Initiating rollback..." "WARNING"
        
        Stop-Service-Gracefully -ProcessName "python" -ServiceName "Backend"
        Stop-Service-Gracefully -ProcessName "node" -ServiceName "Frontend"
        
        Restore-Backup -BackupPath $backupPath
        
        Write-Log "Rollback completed - system restored to previous state" "WARNING"
    }
    
    exit 1
}