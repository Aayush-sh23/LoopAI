/**
 * In-memory store for all ingestion requests.
 * Simulates a database by storing IngestionRequest objects,
 * accessible by their unique ingestionId.
 * In a real-world application, this would be replaced by a persistent database (e.g., MongoDB, PostgreSQL).
 *
 * @type {Map<string, import('../models/ingestionRequest').IngestionRequest>}
 */
const ingestionRequests = new Map();

module.exports = { ingestionRequests };