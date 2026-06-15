param(
    [switch]$Desktop,
    [switch]$Silent
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$iconPath = Join-Path $root "assets\app-icon.ico"
$targetBat = Join-Path $root "start.bat"
$shortcutName = "AssetManager.lnk"

if (-not (Test-Path $iconPath)) {
    Write-Host "[ERROR] Icon not found: $iconPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $targetBat)) {
    Write-Host "[ERROR] start.bat not found: $targetBat" -ForegroundColor Red
    exit 1
}

function New-LauncherShortcut {
    param([string]$ShortcutPath)

    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut($ShortcutPath)
    $shortcut.TargetPath = $targetBat
    $shortcut.WorkingDirectory = $root
    $shortcut.IconLocation = "$iconPath,0"
    $shortcut.Description = "Asset Manager Tools"
    $shortcut.Save()
}

$localShortcut = Join-Path $root $shortcutName
New-LauncherShortcut $localShortcut

if ($Desktop) {
    $desktopShortcut = Join-Path ([Environment]::GetFolderPath("Desktop")) $shortcutName
    New-LauncherShortcut $desktopShortcut
    if (-not $Silent) {
        Write-Host "Desktop shortcut: $desktopShortcut" -ForegroundColor Green
    }
}

if (-not $Silent) {
    Write-Host "Project shortcut: $localShortcut" -ForegroundColor Green
    Write-Host "Use AssetManager.lnk to launch with custom icon." -ForegroundColor Cyan
}
