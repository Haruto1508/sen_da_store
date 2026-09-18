@echo off
title Khoi dong Ngrok - Sen Xinh Garden
echo =======================================================
echo    DANG KET NOI NGROK VOI SPRING BOOT (PORT 8080)...
echo    Domain: https://autograph-delusion-pacifist.ngrok-free.dev
echo =======================================================
echo.
.\ngrok.exe http --url=autograph-delusion-pacifist.ngrok-free.dev 8080
pause
