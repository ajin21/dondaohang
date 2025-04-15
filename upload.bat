@echo off
setlocal

REM 检查是否安装了Git
where git >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo 未检测到Git，请先安装Git
    pause
    exit /b 1
)

REM 设置GitHub仓库URL
set REPO_URL=https://github.com/ajin21/dondaohang.git

REM 初始化Git仓库
git init

REM 添加所有文件
git add .

REM 提交更改
git commit -m "自动提交"

REM 添加远程仓库
git remote add origin %REPO_URL%

REM 推送代码
git push -u origin master

if %ERRORLEVEL% equ 0 (
    echo 代码已成功上传到GitHub仓库
) else (
    echo 上传失败，请检查错误信息
)

pause