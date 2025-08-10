# Carbon Tracker Setup Guide

Bu proje iki farklı backend sunucusu içerir:
1. **Node.js HTTP Tracker** - HTTP isteklerinin karbon emisyonunu hesaplar
2. **Python CodeCarbon** - Kullanıcı kodlarının karbon emisyonunu ölçer

## 🚀 Hızlı Başlangıç

### 1. Gereksinimler

Aşağıdaki araçların kurulu olduğundan emin olun:

- **Node.js** (v14+)
- **Python** (3.7+)
- **npm** veya **yarn**

### 2. Kurulum

```bash
# 1. Node.js bağımlılıklarını yükleyin
npm install

# 2. Python bağımlılıklarını yükleyin
pip install -r requirements.txt

# 3. Client bağımlılıklarını yükleyin
cd client
npm install
cd ..
```

### 3. Sunucuları Başlatın

#### Otomatik Başlatma (Önerilen)
```bash
# Windows PowerShell
.\start_servers.ps1

# Windows Command Prompt
start_servers.bat
```

#### Manuel Başlatma
```bash
# Terminal 1: Node.js HTTP Tracker
node server.js

# Terminal 2: Python CodeCarbon
python app.py

# Terminal 3: React Frontend
cd client
npm run dev
```

## 📊 Sunucu Detayları

### Node.js HTTP Tracker (Port 3000)
- **Endpoint**: `http://localhost:3000`
- **Amaç**: HTTP isteklerinin karbon emisyonunu hesaplar
- **Özellikler**:
  - Yeşil sunucu kontrolü
  - Çoklu HTTP metodları (GET, POST, PUT, DELETE)
  - Tekrarlı istek testi
  - Detaylı emisyon raporlama

### Python CodeCarbon (Port 5000)
- **Endpoint**: `http://localhost:5000`
- **Amaç**: Kullanıcı kodlarının karbon emisyonunu ölçer
- **Özellikler**:
  - Çoklu programlama dili desteği
  - Gerçek zamanlı emisyon ölçümü
  - CodeCarbon kütüphanesi entegrasyonu
  - Güvenli kod çalıştırma

### React Frontend (Port 5173)
- **Endpoint**: `http://localhost:5173`
- **Amaç**: Kullanıcı arayüzü
- **Özellikler**:
  - Modern ve responsive tasarım
  - İki backend ile entegrasyon
  - Gerçek zamanlı sonuç gösterimi

## 🔧 API Endpoints

### Node.js HTTP Tracker

#### POST /calculate
HTTP isteklerinin emisyonunu hesaplar.

```json
{
  "url": "https://api.example.com/endpoint",
  "method": "GET",
  "repeat": 10,
  "payload": {"key": "value"}
}
```

#### GET /history
Hesaplama geçmişini döndürür.

### Python CodeCarbon

#### POST /calculate
Kod emisyonunu hesaplar.

```json
{
  "code": "print('Hello World')",
  "language": "python",
  "repeat": 5
}
```

#### GET /history
Kod hesaplama geçmişini döndürür.

#### GET /health
Sunucu sağlık kontrolü.

## 🛠️ Desteklenen Diller

### Python CodeCarbon Backend
- **Python** - Yerleşik destek
- **JavaScript** - Node.js gerektirir
- **Java** - JDK gerektirir
- **C++** - GCC/G++ gerektirir
- **C** - GCC gerektirir

## 📁 Proje Yapısı

```
carbon-tracker-eski/
├── server.js                 # Node.js HTTP Tracker
├── app.py                    # Python CodeCarbon Backend
├── requirements.txt          # Python bağımlılıkları
├── package.json             # Node.js bağımlılıkları
├── data/                    # Veri dosyaları
│   ├── history.json        # HTTP tracker geçmişi
│   └── code_history.json   # CodeCarbon geçmişi
├── client/                  # React frontend
│   ├── src/
│   │   ├── App.jsx         # Ana uygulama
│   │   └── CodeCarbonTracker.jsx  # CodeCarbon bileşeni
│   └── package.json
├── start_servers.ps1        # PowerShell başlatma scripti
├── start_servers.bat        # Batch başlatma scripti
├── test_backend.py          # Backend test scripti
└── README_CodeCarbon.md     # CodeCarbon dokümantasyonu
```

## 🧪 Test Etme

### Backend Testleri
```bash
# Python backend testi
python test_backend.py

# Node.js backend testi (curl ile)
curl -X POST http://localhost:3000/calculate \
  -H "Content-Type: application/json" \
  -d '{"url":"https://jsonplaceholder.typicode.com/posts/1","method":"GET","repeat":1}'
```

### Frontend Testleri
```bash
cd client
npm test
```

## 🔍 Sorun Giderme

### Sunucu Başlamıyor
1. Port çakışması kontrol edin
2. Bağımlılıkların kurulu olduğunu kontrol edin
3. Firewall ayarlarını kontrol edin

### CodeCarbon Emisyon 0
1. CodeCarbon kütüphanesinin kurulu olduğunu kontrol edin
2. Sistem kaynaklarının yeterli olduğunu kontrol edin
3. Kodun çalıştığını kontrol edin

### Frontend Bağlantı Hatası
1. Backend sunucularının çalıştığını kontrol edin
2. CORS ayarlarını kontrol edin
3. Port numaralarını kontrol edin

## 📈 Kullanım Örnekleri

### HTTP Tracker Kullanımı
1. Frontend'i açın: `http://localhost:5173`
2. URL, method ve tekrar sayısını girin
3. "CO2 Hesapla" butonuna tıklayın
4. Sonuçları görüntüleyin

### CodeCarbon Kullanımı
1. Frontend'de CodeCarbonTracker bileşenini kullanın
2. Programlama dilini seçin
3. Kodunuzu yazın
4. Tekrar sayısını belirleyin
5. "Emisyon Hesapla" butonuna tıklayın

## 🔒 Güvenlik

- Kod çalıştırma 30 saniye ile sınırlandırılmıştır
- Tüm geçici dosyalar otomatik temizlenir
- Sadece güvenli dizinlerde dosya oluşturulur
- Hata durumları yakalanır ve loglanır

## 📝 Loglar

- Node.js logları: `logs.txt`
- Python logları: Console çıktısı
- Veri dosyaları: `data/` dizini

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Pull request gönderin

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
