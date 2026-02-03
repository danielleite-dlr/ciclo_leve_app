@echo off
echo Testando Rota Raiz...
curl -s -i http://localhost:3000/
echo.
echo.
echo Testando Registro com Dados Invalidos...
curl -s -X POST http://localhost:3000/api/v1/auth/register ^
-H "Content-Type: application/json" ^
-d "{\"nome\": \"A\", \"email\": \"errado\", \"senha\": \"123\"}"
echo.
echo.
echo Testando Registro com Sucesso...
set /a rand=%random%
echo Criando usuario teste%rand%@email.com
curl -s -X POST http://localhost:3000/api/v1/auth/register ^
-H "Content-Type: application/json" ^
-d "{\"nome\": \"Usuario Teste\", \"email\": \"teste%rand%@email.com\", \"senha\": \"senha123\", \"dataNascimento\": \"1990-01-01\"}"
echo.
pause
