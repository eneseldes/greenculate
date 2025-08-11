const axios = require('axios');
const fetch = require('node-fetch');
const http = require('http');
const https = require('https');
const { saveRequestReport } = require('./db_manager');

class HTTPClient {
    constructor(library = 'axios') {
        const supportedLibraries = {
            python: ['requests', 'urllib', 'http.client'],
            nodejs: ['axios', 'node-fetch', 'http']
        };

        if (!supportedLibraries.nodejs.includes(library)) {
            throw new Error(`Unsupported library: ${library}. Use one of: ${supportedLibraries.nodejs.join(', ')}`);
        }

        this.library = library;
    }

    async sendRequest(method, url, headers = {}, body = null) {
        const startTime = Date.now();
        
        try {
            let response;
            if (this.library === 'axios') {
                response = await this._sendWithAxios(method, url, headers, body);
            } else if (this.library === 'node-fetch') {
                response = await this._sendWithFetch(method, url, headers, body);
            } else if (this.library === 'http') {
                response = await this._sendWithHttp(method, url, headers, body);
            }

            const executionTime = (Date.now() - startTime) / 1000; // saniyeye çevir

            // Raporu kaydet
            await saveRequestReport({
                method,
                url,
                headers,
                body: body || '',
                responseStatus: response.status,
                responseHeaders: response.headers,
                responseBody: response.body,
                responseTime: executionTime,
                language: 'nodejs',
                library: this.library
            });

            return response;

        } catch (error) {
            const executionTime = (Date.now() - startTime) / 1000;

            // Hata raporunu kaydet
            await saveRequestReport({
                method,
                url,
                headers,
                body: body || '',
                responseStatus: 0,
                responseHeaders: {},
                responseBody: '',
                responseTime: executionTime,
                language: 'nodejs',
                library: this.library,
                error: error.message
            });

            throw error;
        }
    }

    async _sendWithAxios(method, url, headers, body) {
        const response = await axios({
            method,
            url,
            headers,
            data: body,
            timeout: 30000
        });

        return {
            status: response.status,
            headers: response.headers,
            body: typeof response.data === 'string' ? response.data : JSON.stringify(response.data)
        };
    }

    async _sendWithFetch(method, url, headers, body) {
        const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null,
            timeout: 30000
        });

        const responseBody = await response.text();

        return {
            status: response.status,
            headers: Object.fromEntries(response.headers),
            body: responseBody
        };
    }

    _sendWithHttp(method, url, headers, body) {
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

            const req = client.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: data
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

function createClient(library = 'axios') {
    return new HTTPClient(library);
}

module.exports = {
    HTTPClient,
    createClient
};
