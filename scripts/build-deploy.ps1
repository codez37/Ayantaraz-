# Build production deploy package
# Produces: deploy/bootstrap.tar.gz + deploy/ayantaraz-deploy.tar.gz
param(
    [string]$Version = "20260627"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
$BuildDir = Join-Path $Root "deploy"
$ScriptsDir = Join-Path $Root "scripts"

if (Test-Path $BuildDir) { Remove-Item $BuildDir -Recurse -Force }
New-Item -ItemType Directory -Path $BuildDir -Force | Out-Null

function To-LF($content) {
    $content -replace "`r`n", "`n" -replace "`r", "`n"
}

# --- 1. Assemble ayan-deploy ---
Write-Host "Assembling ayan-deploy..."
$parts = @()
foreach ($i in 1..4) {
    $p = Join-Path $ScriptsDir "helper-part${i}.sh"
    if (-not (Test-Path $p)) { throw "Missing $p" }
    $parts += To-LF (Get-Content $p -Raw -Encoding UTF8)
}
$deployBin = $parts -join "`n"
$deployBinPath = Join-Path $BuildDir "ayan-deploy"
[System.IO.File]::WriteAllText($deployBinPath, $deployBin, [System.Text.UTF8Encoding]::new($false))

# --- 2. Copy bootstrap.sh ---
Write-Host "Copying bootstrap.sh..."
$bs = To-LF (Get-Content (Join-Path $ScriptsDir "bootstrap.sh") -Raw -Encoding UTF8)
$bsPath = Join-Path $BuildDir "bootstrap.sh"
[System.IO.File]::WriteAllText($bsPath, $bs, [System.Text.UTF8Encoding]::new($false))

# --- 3. Copy helper parts (for reference / manual re-assembly) ---
foreach ($i in 1..4) {
    Copy-Item (Join-Path $ScriptsDir "helper-part${i}.sh") $BuildDir
}

# --- 4. Create deploy tar.gz (application code) ---
Write-Host "Creating deploy tar.gz for version $Version..."

$versionFile = Join-Path $BuildDir "VERSION"
Set-Content -Path $versionFile -Value $Version -NoNewline

# Files to include in deploy tar.gz
$includePatterns = @(
    "docker-compose.yml",
    "pnpm-workspace.yaml",
    "package.json",
    "pnpm-lock.yaml",
    ".npmrc",
    "turbo.json",
    "tsconfig.base.json"
)

$includeDirs = @(
    "apps\api",
    "apps\web",
    "packages\shared",
    "prisma",
    "infra\docker",
    "infra\nginx",
    "infra\db",
    "scripts\validate-build.ts"
)

# Create staging area
$staging = Join-Path $BuildDir "staging"
New-Item -ItemType Directory -Path $staging -Force | Out-Null

# Copy files
foreach ($f in $includePatterns) {
    $src = Join-Path $Root $f
    if (Test-Path $src) { Copy-Item $src $staging }
}

foreach ($d in $includeDirs) {
    $src = Join-Path $Root $d
    $dst = Join-Path $staging $d
    if (Test-Path $src) {
        $parent = Split-Path $dst -Parent
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
        Copy-Item $src $dst -Recurse
    }
}

# Convert all .sh files in staging to LF
Get-ChildItem $staging -Filter "*.sh" -Recurse | ForEach-Object {
    $c = To-LF (Get-Content $_.FullName -Raw -Encoding UTF8)
    [System.IO.File]::WriteAllText($_.FullName, $c, [System.Text.UTF8Encoding]::new($false))
}

# Convert Dockerfiles to LF (they have COPY/RUN commands)
Get-ChildItem $staging -Filter "Dockerfile*" -Recurse | ForEach-Object {
    $c = To-LF (Get-Content $_.FullName -Raw -Encoding UTF8)
    [System.IO.File]::WriteAllText($_.FullName, $c, [System.Text.UTF8Encoding]::new($false))
}

# Convert nginx conf to LF
Get-ChildItem $staging -Filter "*.conf" -Recurse | ForEach-Object {
    $c = To-LF (Get-Content $_.FullName -Raw -Encoding UTF8)
    [System.IO.File]::WriteAllText($_.FullName, $c, [System.Text.UTF8Encoding]::new($false))
}

# Convert .sql files to LF
Get-ChildItem $staging -Filter "*.sql" -Recurse | ForEach-Object {
    $c = To-LF (Get-Content $_.FullName -Raw -Encoding UTF8)
    [System.IO.File]::WriteAllText($_.FullName, $c, [System.Text.UTF8Encoding]::new($false))
}

# Convert .ts files to LF
Get-ChildItem $staging -Filter "*.ts" -Recurse | ForEach-Object {
    $c = To-LF (Get-Content $_.FullName -Raw -Encoding UTF8)
    [System.IO.File]::WriteAllText($_.FullName, $c, [System.Text.UTF8Encoding]::new($false))
}

# Create tar.gz
$targz = Join-Path $BuildDir "ayantaraz-deploy.tar.gz"
if (Test-Path $targz) { Remove-Item $targz }

# Use Python for reliable tar creation with LF
$pyScript = @"
import tarfile, os, sys

staging = sys.argv[1]
output = sys.argv[2]

with tarfile.open(output, 'w:gz') as tar:
    for root, dirs, files in os.walk(staging):
        for f in files:
            fp = os.path.join(root, f)
            arcname = os.path.relpath(fp, staging)
            tar.add(fp, arcname=arcname)

print(f'Created: {output}')
"@

$pyScriptPath = Join-Path $BuildDir "_build_tar.py"
[System.IO.File]::WriteAllText($pyScriptPath, $pyScript, [System.Text.UTF8Encoding]::new($false))
python $pyScriptPath $staging $targz
Remove-Item $pyScriptPath

# --- 5. Package bootstrap bundle ---
Write-Host "Creating bootstrap bundle..."
$bootstrapDir = Join-Path $BuildDir "bootstrap"
New-Item -ItemType Directory -Path $bootstrapDir -Force | Out-Null
Copy-Item $bsPath $bootstrapDir
foreach ($i in 1..4) {
    $src = Join-Path $ScriptsDir "helper-part${i}.sh"
    $dst = Join-Path $bootstrapDir "helper-part${i}.sh"
    $c = To-LF (Get-Content $src -Raw -Encoding UTF8)
    [System.IO.File]::WriteAllText($dst, $c, [System.Text.UTF8Encoding]::new($false))
}

$bootstrapTargz = Join-Path $BuildDir "bootstrap.tar.gz"
$pyBootstrapTar = @"
import tarfile, os, sys

staging = sys.argv[1]
output = sys.argv[2]

with tarfile.open(output, 'w:gz') as tar:
    for root, dirs, files in os.walk(staging):
        for f in files:
            fp = os.path.join(root, f)
            arcname = os.path.relpath(fp, staging)
            tar.add(fp, arcname=arcname)

print(f'Created: {output}')
"@
$pyBootstrapPath = Join-Path $BuildDir "_build_bootstrap_tar.py"
[System.IO.File]::WriteAllText($pyBootstrapPath, $pyBootstrapTar, [System.Text.UTF8Encoding]::new($false))
python $pyBootstrapPath $bootstrapDir $bootstrapTargz
Remove-Item $pyBootstrapPath

# Cleanup staging
Remove-Item $staging -Recurse -Force
Remove-Item $bootstrapDir -Recurse -Force
Remove-Item $versionFile -Force

# --- Summary ---
Write-Host ""
Write-Host "============================================"
Write-Host " Build Complete!"
Write-Host "============================================"
Write-Host ""
Write-Host "  $targz"
Write-Host "  $bootstrapTargz"
Write-Host ""
Write-Host "Deploy steps:"
Write-Host "  1. Upload bootstrap.tar.gz to server:"
Write-Host "     scp deploy/bootstrap.tar.gz root@202.133.91.13:/tmp/"
Write-Host "  2. Upload deploy tar.gz to server:"
Write-Host "     scp deploy/ayantaraz-deploy.tar.gz root@202.133.91.13:/tmp/"
Write-Host "  3. On server as root:"
Write-Host "     cd /tmp && tar xzf bootstrap.tar.gz && bash bootstrap.sh"
Write-Host "  4. Then deploy:"
Write-Host "     cp /tmp/ayantaraz-deploy.tar.gz /tmp/ayantaraz-deploy.tar.gz"
Write-Host "     ayan-deploy lock && ayan-deploy release $Version && ayan-deploy gate $Version && ayan-deploy activate $Version && ayan-deploy pass"
Write-Host ""
