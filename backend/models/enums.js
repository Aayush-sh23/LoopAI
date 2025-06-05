
const Priority = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
  getName: (value) => { 
    for (const key in Priority) {
      if (Priority[key] === value) {
        return key;
      }
    }
    return null;
  }
};

const BatchStatus = {
  YET_TO_START: 'yet_to_start',
  TRIGGERED: 'triggered',
  COMPLETED: 'completed'
};

const IngestionStatus = {
  YET_TO_START: 'yet_to_start',
  TRIGGERED: 'triggered',
  COMPLETED: 'completed'
};

module.exports = { Priority, BatchStatus, IngestionStatus }; 