const express = require("express");
const cors = require("cors");
const { co2 } = require("@tgwf/co2");
const fs = require("fs");
const path = require("path");
const dns = require("dns").promises;

// node-fetch'i dinamik olarak import et
let fetch;
(async () => {
  const { default: nodeFetch } = await import('node-fetch');
  fetch = nodeFetch;
})();

const app = express();
const port = 3000;
const emission = new co2();
const historyPath = path.join(__dirname, "data", "history.json");

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Yeşil sunucu kontrolü
async function isGreenHost(hostname) {
  try {
    const response = await fetch(`https://api.thegreenwebfoundation.org/greencheck/${hostname}`);
    const data = await response.json();
    return data.green;
  } catch (error) {
    console.log("Yeşil sunucu kontrolü hatası:", error.message);
    return false;
  }
}

// İstatistikleri getir
app.get("/httpculate/stats", (req, res) => {
  try {
    const data = fs.readFileSync(historyPath);
    const history = JSON.parse(data);
    
    // Kütüphane bazlı istatistikler
    const stats = history.reduce((acc, entry) => {
      if (!acc[entry.library]) {
        acc[entry.library] = {
          library: entry.library,
          total_requests: 0,
          total_emissions: 0,
          green_requests: 0,
          total_bytes: 0
        };
      }
      
      acc[entry.library].total_requests += entry.repeat;
      acc[entry.library].total_emissions += entry.estimatedCO2;
      acc[entry.library].total_bytes += entry.totalBytes;
      if (entry.isGreen) acc[entry.library].green_requests += entry.repeat;
      
      return acc;
    }, {});
    
    // İstatistikleri dizi formatına çevir ve yüzdeleri hesapla
    const by_library = Object.values(stats).map(stat => ({
      ...stat,
      avg_emissions: stat.total_emissions / stat.total_requests,
      green_server_percentage: ((stat.green_requests / stat.total_requests) * 100).toFixed(1),
      avg_response_time: 0 // Bu veriyi henüz toplamıyoruz
    }));
    
    res.json({ by_library });
  } catch (error) {
    console.error("İstatistik hatası:", error);
    res.json({ by_library: [] });
  }
});

// Karbon salınımı hesaplama ve kayıt
app.post("/httpculate/execute", async (req, res) => {
  const { url, method, headers, body, library = 'axios', repeat = 1 } = req.body;

  try {
    console.log("Gelen istek:", { url, method, headers, body, library, repeat });
    
    let totalBytes = 0;
    let lastResponseText = '';
    let lastResponseHeaders = {};
    const { hostname } = new URL(url);
    const isGreen = await isGreenHost(hostname);

    console.log("Hostname:", hostname, "Yeşil:", isGreen);

    for (let i = 0; i < repeat; i++) {
      const options = {
        method,
        headers: headers || { "Content-Type": "application/json" }
      };

      if (body) {
        options.body = typeof body === 'string' ? body : JSON.stringify(body);
      }

      console.log(`${i + 1}. istek gönderiliyor...`);
      const response = await fetch(url, options);
      const responseText = await response.text();
      const responseBytes = Buffer.byteLength(responseText);
      totalBytes += responseBytes;

      // Son yanıtı sakla
      if (i === repeat - 1) {
        lastResponseText = responseText;
        lastResponseHeaders = Object.fromEntries(response.headers.entries());
      }

      console.log(`${i + 1}. istek tamamlandı, boyut: ${responseBytes} bytes`);
    }

    // CO2 hesaplama - daha detaylı
    const estimatedCO2 = emission.perByte(totalBytes, isGreen);
    const estimatedCO2Grams = estimatedCO2 * 1000; // gram'a çevir
    
    console.log("CO2 hesaplama detayları:", {
      totalBytes,
      estimatedCO2,
      estimatedCO2Grams,
      isGreen,
      repeat,
      bytesPerRequest: totalBytes / repeat
    });

    // LOG YAZ
    fs.appendFileSync(
      "logs.txt",
      `${new Date().toISOString()} | ${method} ${url} | Green: ${isGreen} | ${repeat} req | ${totalBytes} bytes | ${estimatedCO2Grams.toFixed(6)} g CO₂\n`
    );

    // JSON KAYIT
    const entry = {
      timestamp: new Date().toISOString(),
      url,
      method,
      library,
      repeat,
      isGreen,
      totalBytes,
      estimatedCO2: Number(estimatedCO2Grams.toFixed(6)),
    };

    let history = [];
    try {
      const raw = fs.readFileSync(historyPath);
      history = JSON.parse(raw);
    } catch {
      // dosya yoksa boş başla
    }

    history.push(entry);
    fs.writeFileSync(historyPath, JSON.stringify(history.slice(-50), null, 2));

    res.json({
      success: true,
      status: 200,
      execution_time: 0, // Bu veriyi henüz ölçmüyoruz
      emissions: estimatedCO2Grams,
      total_bytes: totalBytes,
      is_green_hosting: isGreen,
      headers: lastResponseHeaders,
      body: lastResponseText
    });
  } catch (error) {
    console.error("Hata:", error);
    res.status(500).json({ error: "İstek başarısız: " + error.message });
  }
});

// Geçmiş verileri al
app.get("/httpculate/history", (req, res) => {
  try {
    const data = fs.readFileSync(historyPath);
    res.json(JSON.parse(data));
  } catch {
    res.json([]);
  }
});

// Sunucuyu başlat
app.listen(port, () => {
  console.log(`🚀 Sunucu çalışıyor: http://localhost:${port}`);
  
  // Data dizinini oluştur
  const dataDir = path.join(__dirname, "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
    console.log("📁 Data dizini oluşturuldu");
  }
});