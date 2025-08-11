const { co2, hosting, emissions } = require('@tgwf/co2');
const { axios } = require('axios');
const { fetch } = require('node-fetch');
const http = require('http');
const https = require('https');

class CO2HTTPTracker {
    constructor(library = 'axios') {
        const supportedLibraries = ['axios', 'node-fetch', 'http'];
        if (!supportedLibraries.includes(library)) {
            throw new Error(`Unsupported library: ${library}. Use one of: ${supportedLibraries.join(', ')}`);
        }
        this.library = library;
        this.co2Estimator = new co2();
    }

    async sendRequest(method, url, headers = {}, body = null, repeat = 1) {
        const startTime = Date.now();
        const results = [];

        try {
            // İstekleri gönder ve emisyonları ölç
            for (let i = 0; i < repeat; i++) {
                const result = await this._makeRequest(method, url, headers, body);
                results.push(result);
            }

            // Toplam ve ortalama değerleri hesapla
            const totalBytes = results.reduce((sum, r) => sum + r.bytes, 0);
            const totalEmissions = results.reduce((sum, r) => sum + r.emissions, 0);
            const avgEmissions = totalEmissions / repeat;
            const executionTime = (Date.now() - startTime) / 1000; // saniyeye çevir

            // Sunucu yeşil enerji kullanıyor mu?
            const isGreen = await hosting.check(url);

            return {
                success: true,
                total_emissions: totalEmissions,
                avg_emissions: avgEmissions,
                total_bytes: totalBytes,
                execution_time: executionTime,
                request_count: repeat,
                is_green_hosting: isGreen,
                results: results.map(r => ({
                    status: r.status,
                    headers: r.headers,
                    body: r.body,
                    bytes: r.bytes,
                    emissions: r.emissions
                }))
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                execution_time: (Date.now() - startTime) / 1000
            };
        }
    }

    async _makeRequest(method, url, headers, body) {
        let response;
        let responseBody;
        let responseHeaders;
        let status;

        // İsteği seçilen kütüphane ile gönder
        if (this.library === 'axios') {
            response = await axios({
                method,
                url,
                headers,
                data: body,
                timeout: 30000
            });
            responseBody = response.data;
            responseHeaders = response.headers;
            status = response.status;

        } else if (this.library === 'node-fetch') {
            response = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : null,
                timeout: 30000
            });
            responseBody = await response.text();
            responseHeaders = Object.fromEntries(response.headers);
            status = response.status;

        } else if (this.library === 'http') {
            response = await this._makeHttpRequest(method, url, headers, body);
            responseBody = response.body;
            responseHeaders = response.headers;
            status = response.status;
        }

        // İstek ve yanıt boyutlarını hesapla
        const requestSize = this._calculateRequestSize(headers, body);
        const responseSize = this._calculateResponseSize(responseHeaders, responseBody);
        const totalBytes = requestSize + responseSize;

        // Karbon emisyonunu hesapla
        const emissions = await this.co2Estimator.perByte(totalBytes, {
            dataReloadRatio: 0.01,  // Verilerin tekrar yüklenme oranı
            firstVisitPercentage: 0.75,  // İlk ziyaret yüzdesi
            returnVisitPercentage: 0.25,  // Tekrar ziyaret yüzdesi
            gridIntensity: 442  // g/kWh cinsinden şebeke yoğunluğu
        });

        return {
            status,
            headers: responseHeaders,
            body: responseBody,
            bytes: totalBytes,
            emissions
        };
    }

    _calculateRequestSize(headers, body) {
        const headerSize = Buffer.byteLength(JSON.stringify(headers));
        const bodySize = body ? Buffer.byteLength(JSON.stringify(body)) : 0;
        return headerSize + bodySize;
    }

    _calculateResponseSize(headers, body) {
        const headerSize = Buffer.byteLength(JSON.stringify(headers));
        const bodySize = body ? Buffer.byteLength(body) : 0;
        return headerSize + bodySize;
    }

    _makeHttpRequest(method, url, headers, body) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const options = {
                method,
                hostname: urlObj.hostname,
                port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
                path: urlObj.pathname + urlObj.search,
                headers,
                timeout: 30000
            };

            const client = urlObj.protocol === 'https:' ? https : http;
            let responseBody = '';

            const req = client.request(options, (res) => {
                res.on('data', chunk => responseBody += chunk);
                res.on('end', () => {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: responseBody
                    });
                });
            });

            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            if (body) {
                req.write(typeof body === 'string' ? body : JSON.stringify(body));
            }
            req.end();
        });
    }
}

module.exports = {
    CO2HTTPTracker,
    createTracker: (library) => new CO2HTTPTracker(library)
};
