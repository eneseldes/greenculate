const express = require('express');
const router = express.Router();
const { createTracker } = require('../http_client/co2_tracker');

// HTTP isteği gönder ve karbon emisyonunu ölç
router.post('/request', async (req, res) => {
    try {
        const { method, url, headers, body, library = 'axios', repeat = 1 } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const tracker = createTracker(library);
        const result = await tracker.sendRequest(method, url, headers, body, repeat);

        res.json(result);
    } catch (error) {
        console.error('Error making request:', error);
        res.status(500).json({ error: error.message });
    }
});

// İstek geçmişini getir
router.get('/history', async (req, res) => {
    try {
        // CO2.js ile yapılan son isteklerin geçmişini getir
        // Bu kısmı ihtiyaca göre implemente edebilirsiniz
        res.json([]);
    } catch (error) {
        console.error('Error getting history:', error);
        res.status(500).json({ error: error.message });
    }
});

// İstatistikleri getir
router.get('/stats', async (req, res) => {
    try {
        // CO2.js ile yapılan isteklerin istatistiklerini getir
        // Bu kısmı ihtiyaca göre implemente edebilirsiniz
        res.json({
            by_library: []
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
