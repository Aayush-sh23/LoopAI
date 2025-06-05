

import React, { useState, useEffect } from 'react';
import { getIngestionStatus } from '../services/api';

const StatusViewer = () => {
  
  const [ingestionId, setIngestionId] = useState('');

  
  const [statusData, setStatusData] = useState(null);

  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  
  const fetchStatus = async () => {
    if (!ingestionId) {
      setError('Please enter an Ingestion ID to check status.');
      setStatusData(null);
      return;
    }

    setLoading(true); 
    setError(''); 
    setStatusData(null); 

    try {
      const data = await getIngestionStatus(ingestionId);
      setStatusData(data);
    } catch (err) {
      setError('Failed to fetch status: ' + (err.message || 'Unknown error.'));
    } finally {
      setLoading(false); 
    }
  };

  
  useEffect(() => {
    let intervalId;
    
    if (statusData && statusData.status !== 'completed') {
      
      intervalId = setInterval(fetchStatus, 3000); 
    }

    
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [statusData, ingestionId]); 

  return (
    <div className="status-viewer-container">
      <h2>Check Ingestion Status</h2>
      <div className="form-group status-input-group">
        <label htmlFor="ingestionId">Ingestion ID:</label>
        <input
          type="text"
          id="ingestionId"
          value={ingestionId}
          onChange={(e) => setIngestionId(e.target.value)}
          placeholder="Enter the ingestion ID"
        />
        <button onClick={fetchStatus} disabled={loading}>
          {loading ? 'Fetching...' : 'Get Status'}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {statusData && (
        <div className="status-results">
          <h3>Status for {statusData.ingestion_id}</h3>
          <p>Overall Status: <strong className={`status-text ${statusData.status}`}>{statusData.status.toUpperCase()}</strong></p>
          
          <h4>Batches:</h4>
          {statusData.batches && statusData.batches.length > 0 ? (
            <ul className="batch-list">
              {statusData.batches.map((batch) => (
                <li key={batch.batch_id} className="batch-item">
                  <span className="batch-ids">IDs: [{batch.ids.join(', ')}]</span> | 
                  Status: <span className={`status-text ${batch.status}`}>{batch.status.toUpperCase()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No batches found for this ingestion ID.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default StatusViewer;