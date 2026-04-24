# Refreshing Environment Variables for the current session
Write-Host "==> Refreshing Environment Variables..." -ForegroundColor Cyan
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Install the Gemini CLI
Write-Host "==> Installing Gemini CLI globally via npm..." -ForegroundColor Cyan
npm install -g @google/gemini-cli

# Verify and get path
Write-Host "==> Verifying installation..." -ForegroundColor Cyan
$geminiCmd = Get-Command gemini -ErrorAction SilentlyContinue

if ($geminiCmd) {
    Write-Host "`n[SUCCESS] Gemini CLI is installed and ready to use!" -ForegroundColor Green
    Write-Host "[INFO] File path: $($geminiCmd.Source)" -ForegroundColor Yellow
    Write-Host "`nYou can start using it by typing 'gemini' in your terminal." -ForegroundColor White
} else {
    Write-Host "`n[ERROR] Installation failed or Gemini CLI could not be found." -ForegroundColor Red
}
