const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', '..', 'data', 'http-request-reports.db');

function saveRequestReport({
    method,
    url,
    headers,
    body,
    responseStatus,
    responseHeaders,
    responseBody,
    responseTime,
    language,
    library,
    error = null
}) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH);
        
        const stmt = db.prepare(`
            INSERT INTO http_request_reports (
                timestamp,
                method,
                url,
                request_headers,
                request_body,
                response_status,
                response_headers,
                response_body,
                response_time_ms,
                language,
                library,
                error
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            new Date().toISOString(),
            method,
            url,
            JSON.stringify(headers),
            body,
            responseStatus,
            JSON.stringify(responseHeaders),
            responseBody,
            responseTime * 1000, // milisaniyeye çevir
            language,
            library,
            error,
            function(err) {
                stmt.finalize();
                db.close();
                
                if (err) {
                    console.error('Error saving request report:', err);
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            }
        );
    });
}

function getRequestReports(limit = 100) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH);
        
        db.all(`
            SELECT 
                id,
                timestamp,
                method,
                url,
                request_headers,
                request_body,
                response_status,
                response_headers,
                response_body,
                response_time_ms,
                language,
                library,
                error
            FROM http_request_reports 
            ORDER BY timestamp DESC 
            LIMIT ?
        `, [limit], (err, rows) => {
            db.close();
            
            if (err) {
                console.error('Error getting request reports:', err);
                reject(err);
            } else {
                // JSON string'leri parse et
                const reports = rows.map(row => ({
                    ...row,
                    request_headers: JSON.parse(row.request_headers),
                    response_headers: JSON.parse(row.response_headers)
                }));
                resolve(reports);
            }
        });
    });
}

function getRequestStats() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH);
        
        db.all(`
            SELECT 
                language,
                library,
                COUNT(*) as total_requests,
                AVG(response_time_ms) as avg_response_time,
                COUNT(CASE WHEN error IS NOT NULL THEN 1 END) as error_count
            FROM http_request_reports
            GROUP BY language, library
        `, [], (err, rows) => {
            db.close();
            
            if (err) {
                console.error('Error getting request stats:', err);
                reject(err);
            } else {
                resolve({
                    by_language_library: rows
                });
            }
        });
    });
}

module.exports = {
    saveRequestReport,
    getRequestReports,
    getRequestStats
};
