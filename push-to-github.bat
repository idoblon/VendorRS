@echo off
title VRS - Push to GitHub
color 0A

echo.
echo ========================================
echo    VRS - Push to GitHub
echo ========================================
echo.

echo This script will help you push the VendorRS project to GitHub.

echo.
echo [1/6] Checking if Git is installed...
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo Git is not installed or not in your PATH. Please install Git and try again.
  pause
  exit /b 1
)
echo Git is installed.

echo.
echo [2/6] Checking if repository is initialized...
if not exist ".git" (
  echo Initializing Git repository...
  git init
  if %ERRORLEVEL% NEQ 0 (
    echo Failed to initialize Git repository.
    pause
    exit /b 1
  )
  echo Git repository initialized.
) else (
  echo Git repository already initialized.
)

echo.
echo [3/6] Creating .gitignore file if it doesn't exist...
if not exist ".gitignore" (
  echo Creating .gitignore file...
  (
    echo # Dependencies
    echo node_modules/
    echo .pnp
    echo .pnp.js
    echo 
    echo # Environment files
    echo .env
    echo .env.local
    echo .env.development.local
    echo .env.test.local
    echo .env.production.local
    echo backend/.env
    echo 
    echo # Build outputs
    echo dist/
    echo build/
    echo 
    echo # Logs
    echo logs
    echo *.log
    echo npm-debug.log*
    echo yarn-debug.log*
    echo yarn-error.log*
    echo 
    echo # Editor directories and files
    echo .idea/
    echo .vscode/
    echo *.suo
    echo *.ntvs*
    echo *.njsproj
    echo *.sln
    echo *.sw?
    echo 
    echo # OS files
    echo .DS_Store
    echo Thumbs.db
  ) > .gitignore
  echo .gitignore file created.
) else (
  echo .gitignore file already exists.
)

echo.
echo [4/6] Adding files to Git...
git add .
if %ERRORLEVEL% NEQ 0 (
  echo Failed to add files to Git.
  pause
  exit /b 1
)
echo Files added to Git.

echo.
echo [5/6] Committing changes...
set /p COMMIT_MESSAGE=Enter commit message (default: "Initial commit of VendorRS project"): 
if "%COMMIT_MESSAGE%"=="" set COMMIT_MESSAGE=Initial commit of VendorRS project
git commit -m "%COMMIT_MESSAGE%"
if %ERRORLEVEL% NEQ 0 (
  echo Failed to commit changes.
  pause
  exit /b 1
)
echo Changes committed.

echo.
echo [6/6] Pushing to GitHub...
echo.
echo Before pushing, you need to add a remote repository.
echo If you haven't created a repository on GitHub yet, please do so now.
echo.
set /p REPO_URL=Enter your GitHub repository URL (e.g., https://github.com/username/VendorRS.git): 
if "%REPO_URL%"=="" (
  echo No repository URL provided. Cannot push to GitHub.
  pause
  exit /b 1
)

git remote add origin %REPO_URL%
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo Remote 'origin' might already exist. Trying to set the URL instead...
  git remote set-url origin %REPO_URL%
  if %ERRORLEVEL% NEQ 0 (
    echo Failed to set remote URL.
    pause
    exit /b 1
  )
)

echo.
echo Pushing to GitHub...
git push -u origin master
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo Failed to push to master branch. Trying main branch instead...
  git push -u origin main
  if %ERRORLEVEL% NEQ 0 (
    echo Failed to push to GitHub. You might need to:
    echo 1. Check your internet connection
    echo 2. Verify your GitHub credentials
    echo 3. Ensure the repository exists on GitHub
    pause
    exit /b 1
  )
)

echo.
echo ========================================
echo    VRS Project pushed to GitHub!
echo ========================================
echo.
echo Your project is now available at: %REPO_URL%
echo.
echo Press any key to close this window...
pause >nul