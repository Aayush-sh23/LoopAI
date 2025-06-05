

const { Priority, BatchStatus, IngestionStatus } = require('../models/enums');
const { ingestionRequests } = require('../store/dataStore');
const { v4: uuidv4 } = require('uuid'); 

/**
 * The main ingestion queue. Stores IngestionRequest objects that are pending processing.
 * The queue is sorted based on priority and then creation time.
 * @type {Array<import('../models/ingestionRequest').IngestionRequest>}
 */
const ingestionQueue = [];

/**
 * Flag to indicate if the processing loop is currently active.
 * Prevents multiple instances of the processing loop from running simultaneously.
 * @type {boolean}
 */
let isProcessing = false;

/**
 * Defines the number of IDs to process in a single batch.
 * As per requirements, this is set to 3.
 * @type {number}
 */
const BATCH_SIZE = 3;

/**
 * Defines the rate limit delay between processing batches in milliseconds.
 * As per requirements, this is 5 seconds (5000 ms).
 * @type {number}
 */
const RATE_LIMIT_DELAY = 5000; 

/**
 * Adds an ingestion request to the queue and re-sorts the queue.
 * If the processing loop is not active, it starts it.
 *
 * @param {import('../models/ingestionRequest').IngestionRequest} ingestionRequest - The request to add to the queue.
 */
const addRequestToQueue = (ingestionRequest) => {
  ingestionQueue.push(ingestionRequest);
  
  
  ingestionQueue.sort((a, b) => {
    const priorityA = Priority[a.priority];
    const priorityB = Priority[b.priority];

    if (priorityA !== priorityB) {
      return priorityB - priorityA; 
    }
    return a.createdTime - b.createdTime; 
  });
  console.log(`Request ${ingestionRequest.ingestionId} added to queue (Priority: ${ingestionRequest.priority}). Current queue length: ${ingestionQueue.length}`);
  if (!isProcessing) {
    startProcessing();
  }
};

/**
 * Simulates fetching data for a single ID from an external API.
 * Introduces a random delay to mock network latency.
 *
 * @param {number} id - The ID for which to fetch data.
 * @returns {Promise<{id: number, data: string}>} - A promise that resolves with the simulated processed data.
 */
const fetchExternalData = async (id) => {
  console.log(`  Simulating external data fetch for ID: ${id}...`);
  
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
  return { id: id, data: `processed_data_for_${id}` };
};

/**
 * Processes a single batch of IDs.
 * Updates the batch status and fetches simulated data for each ID in the batch.
 *
 * @param {import('../models/ingestionRequest').Batch} batch - The batch object to process.
 */
const processBatch = async (batch) => {
  batch.status = BatchStatus.TRIGGERED;
  console.log(`  Processing batch ${batch.batchId} with IDs: [${batch.ids.join(', ')}]`);

  const processedData = [];
  for (const id of batch.ids) {
    const data = await fetchExternalData(id);
    processedData.push(data);
  }

  batch.processedData = processedData;
  batch.status = BatchStatus.COMPLETED;
  console.log(`  Batch ${batch.batchId} completed.`);
};

/**
 * The main processing loop for the ingestion queue.
 * It continuously processes batches based on priority and rate limits.
 */
const startProcessing = async () => {
  if (isProcessing) {
    return; 
  }
  isProcessing = true;
  console.log('--- Starting ingestion queue processing loop ---');

  while (ingestionQueue.length > 0) {
    const currentRequest = ingestionQueue[0]; 

    let processedBatchInCurrentWindow = false;

    
    for (const batch of currentRequest.batches) {
      if (batch.status === BatchStatus.YET_TO_START) {
        await processBatch(batch);
        processedBatchInCurrentWindow = true;
        break; 
      }
    }

    
    const allBatchesCompleted = currentRequest.batches.every(b => b.status === BatchStatus.COMPLETED);
    if (allBatchesCompleted) {
      console.log(`Ingestion request ${currentRequest.ingestionId} fully completed. Removing from queue.`);
      ingestionQueue.shift(); 
    }

    
    if (ingestionQueue.length > 0 || !allBatchesCompleted) {
        console.log(`Applying rate limit: Waiting ${RATE_LIMIT_DELAY / 1000} seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
    }
  }

  isProcessing = false;
  console.log('--- Ingestion queue processing finished ---');
};

/**
 * Calculates the overall status of an ingestion request based on its batch statuses.
 *
 * @param {string} ingestionId - The ID of the ingestion request.
 * @returns {string | null} - The overall status ('yet_to_start', 'triggered', 'completed') or null if not found.
 */
const getIngestionOverallStatus = (ingestionId) => {
  const request = ingestionRequests.get(ingestionId);
  if (!request) {
    return null; 
  }

  const hasYetToStart = request.batches.some(batch => batch.status === BatchStatus.YET_TO_START);
  const hasTriggered = request.batches.some(batch => batch.status === BatchStatus.TRIGGERED);
  const hasCompleted = request.batches.some(batch => batch.status === BatchStatus.COMPLETED);

  if (hasYetToStart && !hasTriggered && !hasCompleted) {
    return IngestionStatus.YET_TO_START;
  } else if (hasTriggered || (hasYetToStart && hasCompleted)) { 
    return IngestionStatus.TRIGGERED;
  } else if (!hasYetToStart && !hasTriggered && hasCompleted) { 
    return IngestionStatus.COMPLETED;
  }

  
  return IngestionStatus.YET_TO_START;
};

module.exports = { addRequestToQueue, getIngestionOverallStatus, BATCH_SIZE };