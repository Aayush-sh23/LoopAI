
class IngestionRequest {
  constructor(ingestionId, priority, createdTime, batches) {
    this.ingestionId = ingestionId;
    this.priority = priority;
    this.createdTime = createdTime; 
    this.batches = batches; 
  }
}

class Batch {
  constructor(batchId, ids, status = 'yet_to_start', processedData = []) {
    this.batchId = batchId;
    this.ids = ids;
    this.status = status;
    this.processedData = processedData; 
  }
}

module.exports = { IngestionRequest, Batch }; 