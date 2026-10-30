@echo off
chcp 65001 > nul
echo ======================================================
echo    SUBIR PROJETO FARMA GENTE PARA O GITHUB
echo ======================================================
echo.

git --version > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Git nao esta instalado no sistema.
    pause
    exit /b
)

echo Inicializando repositorio Git...
git init
git add .
git commit -m "Site Rede Farma Gente Drogaria Itajai completo"
git branch -M main

echo.
set /p REPO_URL="Cole a URL do seu repositorio GitHub (ex: https://github.com/seu-user/farma.git): "

if "%REPO_URL%"=="" (
    echo [AVISO] Nenhuma URL informada. Commit local realizado.
    pause
    exit /b
)

git remote remove origin > nul 2>&1
git remote add origin %REPO_URL%
echo.
echo Enviando arquivos para o GitHub...
git push -u origin main --force

echo.
echo [SUCESSO] Arquivos enviados com sucesso para o GitHub!
pause
