# 🌱 Greenculate

**Karbon Emisyonu Hesaplama ve İzleme Platformu**

Greenculate, yazılım geliştirme süreçlerinde ve HTTP isteklerinde oluşan karbon emisyonlarını ölçen, analiz eden ve raporlayan kapsamlı bir platformdur. Proje, farklı programlama dilleri, JSON işlemleri ve HTTP istekleri için karbon ayak izini hesaplar ve kullanıcılara çevresel etkilerini anlamalarında yardımcı olur.

## 📋 İçindekiler

- [🚀 Hızlı Başlangıç](#-hızlı-başlangıç)
- [🎯 Proje Hakkında](#-proje-hakkında)
- [✨ Özellikler](#-özellikler)
- [🛠 Teknoloji Stack'i](#-teknoloji-stacki)
- [📁 Proje Yapısı](#-proje-yapısı)
- [🚀 Kurulum](#-kurulum)
- [🏃‍♂️ Çalıştırma](#-çalıştırma)
- [📖 Kullanım](#-kullanım)
- [🔌 API Dokümantasyonu](#-api-dokümantasyonu)
- [🗄️ Veritabanı Şeması](#-veritabanı-şeması)

## 🚀 Hızlı Başlangıç

Projeyi geliştirme modunda çalıştırmak için ana dizinde bulunan `start_greenculate.bat` dosyasını çalıştırın:

```bash
./start_greenculate.bat
```

Bu komut:
- Python Backend'i (Port 5000)
- Node.js Backend'i (Port 3000)
- Frontend'i (Port 5173)

otomatik olarak başlatacak ve kullanılabilir adresleri gösterecektir.

> ⚠️ Not: Projeyi çalıştırmadan önce [Kurulum](#kurulum) adımlarını tamamladığınızdan emin olun.

## 🎯 Proje Hakkında

Greenculate, sürdürülebilir yazılım geliştirme pratiklerini desteklemek amacıyla geliştirilmiş bir karbon emisyonu hesaplama platformudur. Proje üç ana modülden oluşur:

### 🌐 HTTPculate (EKSİK)
HTTP isteklerinin karbon emisyonunu hesaplar. Farklı HTTP kütüphaneleri (axios, node-fetch, http) kullanarak yapılan isteklerin çevresel etkisini ölçer ve yeşil hosting sağlayıcılarını tespit eder.

### 💻 Codeculate
Programlama dillerinde yazılan kodların karbon emisyonunu ölçer. Python, JavaScript, Java, C++ ve C dillerini destekler. Kodun çalışma süresi ve sistem kaynakları kullanımına göre emisyon hesaplaması yapar.

### 📝 JSONculate
JSON verilerinin farklı parser kütüphaneleri (json, orjson, ujson) ile işlenmesi sırasında oluşan karbon emisyonunu karşılaştırır ve en verimli parser'ı belirler.

## ✨ Özellikler

### 🔧 Teknik Özellikler
- **Çoklu Backend Desteği**: Python Flask ve Node.js Express backend'leri
    -> Codeculate ve JSONculate için Python Flask (Codecarbon)
    -> HTTPculate için Node.js Express (co2.js)
- **Gerçek Zamanlı Hesaplama**: CodeCarbon ve @tgwf/co2 kütüphaneleri ile hassas emisyon ölçümü
- **Veritabanı Entegrasyonu**: SQLite ile geçmiş kayıtların saklanması
- **Ölçeklendirme**: Büyük tekrarlar için akıllı ölçeklendirme algoritması
- **Cache Sistemi**: Benzer işlemler için önbellekleme
- **Yeşil Hosting Kontrolü**: The Green Web Foundation API entegrasyonu

### 🎨 Kullanıcı Deneyimi
- **Modern UI/UX**: React ve Framer Motion ile animasyonlu arayüz
- **Responsive Tasarım**: Tüm cihazlarda uyumlu görünüm
- **Gerçek Zamanlı Sonuçlar**: Anlık emisyon hesaplama ve görselleştirme
- **Geçmiş Kayıtları**: Tüm işlemlerin detaylı geçmişi
- **Karşılaştırmalı Analiz**: Farklı yöntemlerin performans karşılaştırması

### 📊 Analitik Özellikler
- **Toplam Emisyon Takibi**: Tüm modüllerin toplam karbon ayak izi
- **Eşdeğer Hesaplamalar**: Günlük hayattan karşılaştırmalar (araba kullanımı, hamburger tüketimi vb.)
- **Detaylı Raporlama**: Sistem bilgileri ve performans metrikleri
- **İstatistiksel Analiz**: Kütüphane bazlı performans karşılaştırmaları

## 🛠 Teknoloji Stack'i

### Frontend
- **React 19.1.0**: Modern UI framework
- **Vite 4.5.9**: Hızlı build tool
- **React Router DOM 7.8.0**: Sayfa yönlendirme
- **Framer Motion 12.23.12**: Animasyonlar
- **CodeMirror**: Kod editörü
- **Axios 1.11.0**: HTTP client
- **Sass 1.72.0**: CSS preprocessor
- **React Icons 5.5.0**: İkon kütüphanesi

### Backend (Python)
- **Flask 3.0.0**: Web framework
- **Flask-CORS 4.0.0**: Cross-origin resource sharing
- **CodeCarbon 2.3.2**: Karbon emisyonu hesaplama
- **orjson 3.9.10**: Hızlı JSON parser
- **ujson 5.9.0**: Ultra hızlı JSON parser
- **psutil 5.9.7**: Sistem bilgileri
- **SQLite3**: Veritabanı

### Backend (Node.js)
- **Express 5.1.0**: Web framework
- **@tgwf/co2 0.16.8**: HTTP karbon emisyonu hesaplama
- **node-fetch 3.3.2**: HTTP client
- **CORS 2.8.5**: Cross-origin resource sharing

### Geliştirme Araçları
- **ESLint 9.30.1**: Kod kalitesi
- **Nodemon**: Otomatik yeniden başlatma
- **Git**: Versiyon kontrolü

## 📁 Proje Yapısı

```
greenculate/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/              # React bileşenleri
│   │   │   ├── HTTPculate/         # HTTP emisyon hesaplama
│   │   │   ├── Codeculate/         # Kod emisyon hesaplama
│   │   │   ├── JSONculate/         # JSON emisyon hesaplama
│   │   │   ├── ModeSelector/       # Mod seçici
│   │   │   ├── SubmodeSelector/    # Alt mod seçici
│   │   │   ├── Editors/            # Kod ve JSON editörleri
│   │   │   └── SubmitButton/       # Gönder butonu
│   │   ├── pages/                  # Sayfa bileşenleri
│   │   │   ├── HomePage/           # Ana sayfa
│   │   │   └── TotalEmissionsPage/ # Toplam emisyon sayfası
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── styles/                 # Global stiller
│   │   ├── App.jsx                 # Ana uygulama bileşeni
│   │   └── main.jsx                # Uygulama giriş noktası
│   ├── package.json                # Frontend bağımlılıkları
│   ├── vite.config.js              # Vite konfigürasyonu
│   └── index.html                  # HTML template
├── backend/
│   ├── python/                     # Python Backend
│   │   ├── app.py                  # Flask ana uygulaması
│   │   ├── codeculate/             # Kod emisyon hesaplama modülü
│   │   │   ├── code_executor.py    # Kod yürütücü
│   │   │   ├── codeculate_db_manager.py # Veritabanı yöneticisi
│   │   │   └── normalize_and_compare.py # Normalizasyon
│   │   ├── jsonculate/             # JSON emisyon hesaplama modülü
│   │   │   ├── json_parser.py      # JSON parser
│   │   │   └── jsonculate_db_manager.py # Veritabanı yöneticisi
│   │   ├── config/                 # Konfigürasyon dosyaları
│   │   ├── logs/                   # Log dosyaları
│   │   ├── emissions.csv           # Emisyon verileri
│   │   └── requirements.txt        # Python bağımlılıkları
│   ├── node/                       # Node.js Backend
│   │   ├── server.js               # Express ana uygulaması
│   │   ├── data/                   # Veri dosyaları
│   │   ├── public/                 # Statik dosyalar
│   │   ├── package.json            # Node.js bağımlılıkları
│   │   └── logs.txt                # Log dosyaları
│   └── data/                       # Veritabanı dosyaları
│       ├── codeculate-reports.db   # Kod emisyon veritabanı
│       ├── jsonculate-reports.db   # JSON emisyon veritabanı
│       └── http-request-reports.db # HTTP emisyon veritabanı
└── README.md                       # Bu dosya
```

## 🚀 Kurulum

### Gereksinimler
- **Node.js** 18.0.0 veya üzeri
- **Python** 3.8 veya üzeri
- **Git**
- **Java**: JDK 8 veya üzeri (javac ve java komutları)
- **C++**: GCC compiler (g++ komutu)
- **C**: GCC compiler (gcc komutu)

#### Sistem Gereksinimleri
- **Windows**: MinGW veya Visual Studio Build Tools (C/C++ için)
- **macOS**: Xcode Command Line Tools (C/C++ için)
- **Linux**: build-essential paketi (C/C++ için)

### Adım 1: Projeyi Klonlayın
```bash
git clone https://github.com/your-username/greenculate.git
cd greenculate
```

### Adım 2: Frontend Kurulumu
```bash
cd client
npm install
```

### Adım 3: Python Backend Kurulumu
```bash
cd ../backend/python
pip install -r requirements.txt
```

### Adım 4: Node.js Backend Kurulumu
```bash
cd ../node
npm install
```

## 🏃‍♂️ Çalıştırma

### Geliştirme Modunda Çalıştırma

1. **Python Backend'i Başlatın** (Terminal 1):
```bash
cd backend/python
python app.py
```
Python backend http://localhost:5000 adresinde çalışacak.

2. **Node.js Backend'i Başlatın** (Terminal 2):
```bash
cd backend/node
npm run dev
```
Node.js backend http://localhost:3000 adresinde çalışacak.

3. **Frontend'i Başlatın** (Terminal 3):
```bash
cd client
npm run dev
```
Frontend http://localhost:5173 adresinde çalışacak.

## 📖 Kullanım

### 🏠 Ana Sayfa (HomePage) Yapısı ve Kullanımı

Ana sayfa, kullanıcıyı karşılayan interaktif bir arayüze sahiptir. Sayfa üç ana bölümden oluşur:

#### 1. Karşılama Ekranı
- **Tıklanabilir Başlık**: Sayfanın ortasında kısmında Greenculate logosu ve başlığı
    - Başlığa tıklandığında emisyon hesabının yapıldığı ana yapıya geçiş yapılır:
    - 🌐 **HTTPculate**: HTTP isteklerinin emisyonunu hesaplar
    - 💻 **Codeculate**: Kod çalıştırma emisyonunu hesaplar
    - 📝 **JSONculate**: JSON işleme emisyonunu hesaplar
    - Butona tekrar tıklandığında ana sayfaya geri dönülür

#### 2. Ok Butonu
- Kullanıcıyı toplam emisyon bölümüne yönlendirir
- Tekrar oka basarak ana sayfaya geri dönülür

#### 3. Toplam Emisyon Bölümü
- Ok butonuna tıklandığında görüntülenen bölüm
- İçerik:
  - Toplam karbon ayak izi değeri
  - Her modun (HTTP, Code, JSON) ayrı emisyon değerleri
  - Günlük hayattan eşdeğer karşılaştırmalar

### 🌐 HTTPculate Kullanımı

1. Ana sayfada "🌐 HTTPculate" modunu seçin
2. HTTP kütüphanesini seçin (axios, node-fetch, http)
3. HTTP metodunu belirleyin (GET, POST, PUT, DELETE, vb.)
4. Hedef URL'yi girin
5. "🌐 İşlem Yap" butonuna tıklayın
6. Sonuçları görüntüleyin:
   - Karbon emisyonu (gram CO₂)
   - Toplam byte miktarı
   - Yeşil hosting durumu
   - Yanıt detayları

### 💻 Codeculate Kullanımı

1. Ana sayfada "💻 Codeculate" modunu seçin
2. Programlama dilini seçin (Python, JavaScript, Java, C++, C)
3. Kodunuzu editöre yazın
4. Tekrar sayısını belirleyin
5. "🌐 İşlem Yap" butonuna tıklayın
6. Sonuçları görüntüleyin:
   - Toplam karbon emisyonu
   - Ortalama emisyon
   - Çalışma süresi
   - Kod çıktısı

### 📝 JSONculate Kullanımı

1. Ana sayfada "📝 JSONculate" modunu seçin
2. JSON verinizi editöre yazın
3. Tekrar sayısını belirleyin
4. "🌐 İşlem Yap" butonuna tıklayın
5. Sonuçları görüntüleyin:
   - Her parser için emisyon değerleri
   - Performans karşılaştırması
   - En verimli parser önerisi

### 📊 Toplam Emisyon Takibi

1. Üst menüden "Toplam Emisyon" sayfasına gidin
2. Tüm modüllerin toplam karbon ayak izini görün
3. Günlük hayattan eşdeğer karşılaştırmaları inceleyin:
   - Araba kullanımı eşdeğeri
   - Hamburger tüketimi eşdeğeri
   - Ampul kullanımı eşdeğeri
   - Sıcak duş eşdeğeri
   - Uçak yolculuğu eşdeğeri

## 🔌 API Dokümantasyonu

### Python Backend API (Port 5000)

#### Codeculate Endpoints

**POST /codeculate/execute**
Farklı yazılım dillerinden kodları çalıştırır ve emisyonlarını hesaplar.
Çalıştırma sonuçlarını veritabanına kaydeder ve ayrıca React'a gönderir.

**GET /codeculate/history**
Geçmiş kod emisyon kayıtlarını döndürür.

#### JSONculate Endpoints

**POST /jsonculate/execute**
JSON parse eder ve emisyonlarını hesaplar. 
Parse sonuçlarını veritabanına kaydeder ve ayrıca React'a gönderir.

**GET /jsonculate/history**
Geçmiş JSON emisyon kayıtlarını döndürür.

#### Toplam Emisyon Endpoint

**GET /total-emission**
Kullanıcıya sunulmak üzere sitede kullanılan toplam karbon ayak
izini döndürür.

### Node.js Backend API (Port 3000)

#### HTTPculate Endpoints

**POST /httpculate/execute**
HTTP isteği gönderir ve emisyonlarını hesaplar.
Çalıştırma sonuçlarını veritabanına kaydeder ve ayrıca React'a gönderir.

**GET /httpculate/history**
Geçmiş HTTP emisyon kayıtlarını döndürür.

???
**GET /httpculate/stats**
Kütüphane bazlı istatistikleri döndürür.

**GET /total-emission**
```json
{
  "http_emissions": 0.000234
}
```
???

## 🗄️ Veritabanı Şeması

### Codeculate Veritabanı (codeculate-reports.db)

```sql
CREATE TABLE codeculate_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    code_hash TEXT NOT NULL,
    language TEXT NOT NULL,
    execution_count INTEGER NOT NULL,
    execution_duration_seconds REAL NOT NULL,
    carbon_per_execution REAL NOT NULL,
    total_carbon_emission REAL NOT NULL,
    cpu_model TEXT,
    cpu_count INTEGER,
    total_memory INTEGER,
    os_info TEXT,
    is_scaled BOOLEAN DEFAULT FALSE,
    scale_threshold INTEGER DEFAULT 10000
);
```

### JSONculate Veritabanı (jsonculate-reports.db)

```sql
CREATE TABLE jsonculate_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    json_hash TEXT NOT NULL,
    repeat INTEGER NOT NULL,
    json_emissions REAL NOT NULL,
    json_duration REAL NOT NULL,
    orjson_emissions REAL NOT NULL,
    orjson_duration REAL NOT NULL,
    ujson_emissions REAL NOT NULL,
    ujson_duration REAL NOT NULL,
    cpu_model TEXT,
    cpu_count INTEGER,
    total_memory INTEGER,
    os_info TEXT,
    is_scaled BOOLEAN DEFAULT FALSE,
    scale_threshold INTEGER DEFAULT 10000
);
```

### HTTP Request Veritabanı (http-request-reports.db)

```sql
CREATE TABLE http_request_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    url TEXT NOT NULL,
    method TEXT NOT NULL,
    library TEXT NOT NULL,
    repeat INTEGER NOT NULL,
    is_green BOOLEAN NOT NULL,
    total_bytes INTEGER NOT NULL,
    estimated_co2 REAL NOT NULL
);
```

## 🔮 Gelecek Planları
...


## 🙏 Teşekkürler

- [CodeCarbon](https://github.com/mlco2/codecarbon) - Karbon emisyonu hesaplama kütüphanesi
- [@tgwf/co2](https://github.com/thegreenwebfoundation/co2.js) - HTTP karbon emisyonu hesaplama
- [The Green Web Foundation](https://www.thegreenwebfoundation.org/) - Yeşil hosting verileri
- [React](https://reactjs.org/) - UI framework
- [Flask](https://flask.palletsprojects.com/) - Python web framework
- [Express](https://expressjs.com/) - Node.js web framework
