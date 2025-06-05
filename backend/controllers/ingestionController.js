


const { IngestionRequest, Batch } = require('../models/ingestionRequest');
const { Priority } = require('../models/enums');


const { addRequestToQueue, getIngestionOverallStatus, BATCH_SIZE } = require('../services/ingestionQueue');
const { ingestionRequests } = require('../store/dataStore');


const { v4: uuidv4 } = require('uuid');

/**
 * Handles POST requests to the /ingest endpoint.
 * Validates input, creates a new ingestion request, stores it,
 * and adds it to the processing queue.
 *
 * @param {object} req - The Express request object.
 * @param {object} req.body - The request body, expected to contain 'ids' and 'priority'.
 * @param {Array<number>} req.body.ids - A list of integer IDs.
 * @param {string} req.body.priority - The priority of the request ('HIGH', 'MEDIUM', 'LOW').
 * @param {object} res - The Express response object.
 */
const ingestData = (req, res) => {
  const { ids, priority } = req.body;

  
  if (!ids || !Array.isArray(ids) || ids.length === 0 || ids.some(id => typeof id !== 'number' || !Number.isInteger(id) || id < 1 || id > 10**9 + 7)) {
    return res.status(400).json({ error: 'Invalid "ids" provided. Must be a non-empty array of integers (1 to 10^9+7).' });
  }

  
  const upperCasePriority = priority ? priority.toUpperCase() : '';
  if (!Object.keys(Priority).includes(upperCasePriority)) {
    return res.status(400).json({ error: 'Invalid "priority" provided. Must be HIGH, MEDIUM, or LOW.' });
  }

  const ingestionId = uuidv4();
  const createdTime = Date.now(); 
  const batches = [];

  
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batchIds = ids.slice(i, i + BATCH_SIZE);
    batches.push(new Batch(uuidv4(), batchIds));
  }

  
  const newIngestionRequest = new IngestionRequest(ingestionId, upperCasePriority, createdTime, batches);

  
  ingestionRequests.set(ingestionId, newIngestionRequest);
  console.log(`New ingestion request received: ${ingestionId} with priority ${upperCasePriority}`);

  
  addRequestToQueue(newIngestionRequest);

  
  res.status(202).json({ ingestion_id: ingestionId });
};

/**
 * Handles GET requests to the /status/:ingestion_id endpoint.
 * Retrieves the processing status of a specific ingestion request.
 *
 * @param {object} req - The Express request object.
 * @param {object} req.params - The path parameters, expected to contain 'ingestion_id'.
 * @param {string} req.params.ingestion_id - The unique ID of the ingestion request.
 * @param {object} res - The Express response object.
 */
const getStatus = (req, res) => {
  const { ingestion_id } = req.params;

  
  const request = ingestionRequests.get(ingestion_id);
  if (!request) {
    return res.status(404).json({ error: 'Ingestion ID not found.' });
  }

  
  const overallStatus = getIngestionOverallStatus(ingestion_id);

  
  const formattedBatches = request.batches.map(batch => ({
    batch_id: batch.batchId,
    ids: batch.ids,
    status: batch.status
  }));

  
  res.status(200).json({
    ingestion_id: request.ingestionId,
    status: overallStatus,
    batches: formattedBatches
  });
};

module.exports = { ingestData, getStatus };