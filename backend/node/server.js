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

// Karbon salınımı hesaplama ve kayıt
app.post("/calculate", async (req, res) => {
  const { url, method, repeat, payload } = req.body;

  try {
    console.log("Gelen istek:", { url, method, repeat, payload });
    
    let totalBytes = 0;
    const { hostname } = new URL(url);
    const isGreen = await isGreenHost(hostname);

    console.log("Hostname:", hostname, "Yeşil:", isGreen);

    for (let i = 0; i < repeat; i++) {
      const options = {
        method,
        headers: { "Content-Type": "application/json" }
      };

      if (method === "POST" && payload) {
        options.body = JSON.stringify(payload);
      }

      console.log(`${i + 1}. istek gönderiliyor...`);
      const response = await fetch(url, options);
      const body = await response.text();
      const responseBytes = Buffer.byteLength(body);
      totalBytes += responseBytes;
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
      totalBytes,
      estimatedCO2: estimatedCO2Grams,
      repeat,
      isGreen
    });
  } catch (error) {
    console.error("Hata:", error);
    res.status(500).json({ error: "İstek başarısız: " + error.message });
  }
});

// Geçmiş verileri al
app.get("/history", (req, res) => {
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
});