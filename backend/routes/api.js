


const express = require('express');
const router = express.Router();
const ingestionController = require('../controllers/ingestionController');

/**
 * @swagger
 * /ingest:
 * post:
 * summary: Submits a data ingestion request.
 * description: Enqueues a list of IDs for asynchronous processing with a specified priority.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - ids
 * - priority
 * properties:
 * ids:
 * type: array
 * items:
 * type: integer
 * minimum: 1
 * maximum: 1000000007 # 10^9 + 7
 * description: A list of integer IDs to be ingested.
 * priority:
 * type: string
 * enum: [HIGH, MEDIUM, LOW]
 * description: The processing priority for the request.
 * example:
 * ids: [1, 2, 3, 4, 5]
 * priority: "HIGH"
 * responses:
 * 202:
 * description: Request accepted for processing. Returns a unique ingestion ID.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * ingestion_id:
 * type: string
 * format: uuid
 * description: Unique identifier for the ingestion request.
 * 400:
 * description: Invalid input for IDs or priority.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * error:
 * type: string
 * example: "Invalid 'ids' provided. Must be a non-empty array of integers (1 to 10^9+7)."
 */
router.post('/ingest', ingestionController.ingestData);

/**
 * @swagger
 * /status/{ingestion_id}:
 * get:
 * summary: Retrieves the processing status of an ingestion request.
 * description: Returns the overall status of the ingestion request and details for each batch.
 * parameters:
 * - in: path
 * name: ingestion_id
 * schema:
 * type: string
 * format: uuid
 * required: true
 * description: The unique identifier of the ingestion request.
 * responses:
 * 200:
 * description: Successfully retrieved ingestion status.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * ingestion_id:
 * type: string
 * format: uuid
 * description: The unique identifier of the ingestion request.
 * status:
 * type: string
 * enum: [yet_to_start, triggered, completed]
 * description: The overall status of the ingestion request.
 * batches:
 * type: array
 * items:
 * type: object
 * properties:
 * batch_id:
 * type: string
 * format: uuid
 * description: Unique identifier for the batch.
 * ids:
 * type: array
 * items:
 * type: integer
 * description: List of IDs contained in this batch.
 * status:
 * type: string
 * enum: [yet_to_start, triggered, completed]
 * description: The status of this specific batch.
 * example:
 * ingestion_id: "abc123"
 * status: "triggered"
 * batches:
 * - batch_id: "uuid1"
 * ids: [1, 2, 3]
 * status: "completed"
 * - batch_id: "uuid2"
 * ids: [4, 5]
 * status: "yet_to_start"
 * 404:
 * description: Ingestion ID not found.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * error:
 * type: string
 * example: "Ingestion ID not found."
 */
router.get('/status/:ingestion_id', ingestionController.getStatus);

module.exports = router;