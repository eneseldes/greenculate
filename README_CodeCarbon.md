# CodeCarbon Backend Server

Bu proje, kullanıcıların yazdığı kodun karbon emisyonunu ölçen bir Python Flask backend sunucusudur. CodeCarbon kütüphanesi kullanılarak gerçek zamanlı emisyon ölçümü yapılır.

## Özellikler

- 🐍 **Çoklu Dil Desteği**: Python, JavaScript, Java, C++, C
- 📊 **Gerçek Zamanlı Ölçüm**: CodeCarbon ile hassas emisyon hesaplama
- 🔄 **Tekrarlı Test**: Belirtilen sayıda kod çalıştırma
- 📈 **Detaylı Raporlama**: Toplam emisyon, ortalama emisyon, çalışma süresi
- 💾 **Geçmiş Kayıt**: Hesaplama geçmişini JSON formatında saklama
- 🛡️ **Güvenli Çalıştırma**: Timeout ve hata yönetimi

## Kurulum

### 1. Python Bağımlılıklarını Yükleyin

```bash
pip install -r requirements.txt
```

### 2. Gerekli Sistem Araçları

Aşağıdaki araçların sisteminizde kurulu olduğundan emin olun:

- **Python 3.7+**
- **Node.js** (JavaScript kodları için)
- **Java JDK** (Java kodları için)
- **GCC/G++** (C/C++ kodları için)

### 3. Sunucuyu Başlatın

```bash
python app.py
```

Sunucu `http://localhost:5000` adresinde çalışmaya başlayacaktır.

## API Endpoints

### POST /calculate
Kod emisyonunu hesaplar.

**Request Body:**
```json
{
  "code": "print('Hello World')",
  "language": "python",
  "repeat": 5
}
```

**Response:**
```json
{
  "total_emissions": 0.000123,
  "avg_emissions": 0.0000246,
  "total_execution_time": 2.5,
  "avg_execution_time": 0.5,
  "repeat": 5,
  "successful_runs": 5,
  "failed_runs": 0,
  "language": "python",
  "last_result": {
    "success": true,
    "stdout": "Hello World\n",
    "stderr": "",
    "execution_time": 0.5,
    "emissions": 0.0000246,
    "return_code": 0
  }
}
```

### GET /history
Hesaplama geçmişini döndürür.

### GET /health
Sunucu sağlık kontrolü.

## Desteklenen Diller

### Python
```python
import time
import math

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(f"Fibonacci({i}) = {fibonacci(i)}")
    time.sleep(0.1)
```

### JavaScript
```javascript
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}

for (let i = 0; i < 10; i++) {
    console.log(`Fibonacci(${i}) = ${fibonacci(i)}`);
}
```

### Java
```java
public class Main {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n-1) + fibonacci(n-2);
    }
    
    public static void main(String[] args) {
        for (int i = 0; i < 10; i++) {
            System.out.println("Fibonacci(" + i + ") = " + fibonacci(i));
        }
    }
}
```

### C++
```cpp
#include <iostream>
#include <chrono>
#include <thread>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}

int main() {
    for (int i = 0; i < 10; i++) {
        std::cout << "Fibonacci(" << i << ") = " << fibonacci(i) << std::endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }
    return 0;
}
```

### C
```c
#include <stdio.h>
#include <unistd.h>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}

int main() {
    for (int i = 0; i < 10; i++) {
        printf("Fibonacci(%d) = %d\n", i, fibonacci(i));
        usleep(100000); // 100ms
    }
    return 0;
}
```

## Frontend Entegrasyonu

React uygulamasında kullanmak için `CodeCarbonTracker.jsx` bileşenini kullanabilirsiniz:

```jsx
import CodeCarbonTracker from './CodeCarbonTracker';

function App() {
  return (
    <div>
      <CodeCarbonTracker />
    </div>
  );
}
```

## Güvenlik Önlemleri

- **Timeout**: Kod çalıştırma 30 saniye ile sınırlandırılmıştır
- **Geçici Dosyalar**: Tüm geçici dosyalar otomatik olarak temizlenir
- **Hata Yönetimi**: Tüm hatalar yakalanır ve raporlanır
- **Dosya Sistemi**: Sadece geçici dizinlerde dosya oluşturulur

## Loglama

Sunucu tüm işlemleri detaylı olarak loglar:
- Kod çalıştırma başlangıcı ve bitişi
- Emisyon hesaplama sonuçları
- Hata durumları

## Veri Saklama

Hesaplama geçmişi `data/code_history.json` dosyasında saklanır. Son 50 kayıt tutulur.

## Sorun Giderme

### Kod Çalışmıyor
- Dil seçiminin doğru olduğundan emin olun
- Kodun sözdizimi hatasının olmadığını kontrol edin
- Gerekli sistem araçlarının kurulu olduğunu kontrol edin

### Emisyon Değeri 0
- CodeCarbon kütüphanesinin doğru kurulduğunu kontrol edin
- Sistem kaynaklarının yeterli olduğunu kontrol edin

### Timeout Hatası
- Kodun çok uzun sürdüğünü kontrol edin
- Sonsuz döngü olup olmadığını kontrol edin

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
