@echo off
REM =============================================
REM Génère la liste des articles (index.json)
REM Usage: double-clic sur generer-liste.bat
REM =============================================

cd /d "%~dp0"

echo Recherche des articles...

REM Créer le fichier JSON
echo [ > articles\index.json

setlocal enabledelayedexpansion
set first=1

for %%f in (articles\*.html) do (
    set "filename=%%~nxf"
    REM Exclure les templates
    echo !filename! | findstr /i "template" >nul
    if errorlevel 1 (
        if !first!==1 (
            set first=0
        ) else (
            echo , >> articles\index.json
        )
        echo   "!filename!" >> articles\index.json
    )
)

echo ] >> articles\index.json

echo.
echo Liste generee dans articles\index.json
echo.
type articles\index.json
echo.
pause
