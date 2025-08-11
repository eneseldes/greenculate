const { HTTPClient, createClient } = require('./client');
const { getRequestReports, getRequestStats } = require('./db_manager');

module.exports = {
    HTTPClient,
    createClient,
    getRequestReports,
    getRequestStats
};
