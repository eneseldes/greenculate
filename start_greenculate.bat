@echo off
echo [92m===========================================[0m
echo [92m        GREENCULATE STARTER[0m
echo [92m===========================================[0m
echo.

:: Python backend'i başlat
echo [94mPython Backend başlatılıyor...[0m
start cmd /k "cd backend\python && python app.py"
echo [92m✓[0m Python Backend başlatıldı (Port: 5000)
echo.

:: Node.js backend'i başlat
echo [94mNode.js Backend başlatılıyor...[0m
start cmd /k "cd backend\node && npm run dev"
echo [92m✓[0m Node.js Backend başlatıldı (Port: 3000)
echo.

:: Frontend'i başlat
echo [94mFrontend başlatılıyor...[0m
start cmd /k "cd client && npm run dev"
echo [92m✓[0m Frontend başlatıldı (Port: 5173)
echo.

echo [92m===========================================[0m
echo [92m        TÜM SERVİSLER BAŞLATILDI[0m
echo [92m===========================================[0m
echo.
echo [93mKullanılabilir Adresler:[0m
echo [96m• Frontend:[0m http://localhost:5173
echo [96m• Python Backend:[0m http://localhost:5000
echo [96m• Node.js Backend:[0m http://localhost:3000
echo.
echo [91mKapatmak için tüm terminal pencerelerini kapatın.[0m
echo.
