

import React, { useState } from 'react';
import { submitIngestionRequest } from '../services/api';

const IngestionForm = () => {
  
  const [idsInput, setIdsInput] = useState('');
  const [priority, setPriority] = useState('MEDIUM'); 

  
  const [ingestionId, setIngestionId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); 

  /**
   * Handles the form submission.
   * @param {Event} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError(''); 
    setIngestionId(''); 
    setLoading(true); 

    try {
      
      
      const ids = idsInput
        .split(',')
        .map(idStr => Number(idStr.trim()))
        .filter(id => !isNaN(id) && id >= 1 && id <= 10**9 + 7);

      if (ids.length === 0) {
        setError('Please enter valid IDs (comma-separated numbers between 1 and 10^9+7).');
        return; 
      }

      
      const response = await submitIngestionRequest(ids, priority);
      
      
      setIngestionId(response.ingestion_id);
      setIdsInput(''); 
    } catch (err) {
      
      setError('Failed to submit request: ' + (err.message || 'Unknown error.'));
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="ingestion-form-container">
      <h2>Submit New Ingestion Request</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="ids">IDs (comma-separated, e.g., 1,2,3,4,5):</label>
          <input
            type="text"
            id="ids"
            value={idsInput}
            onChange={(e) => setIdsInput(e.target.value)}
            placeholder="e.g., 1, 2, 3, 4, 5"
            required
            aria-describedby="id-input-help"
          />
          <small id="id-input-help">IDs should be integers between 1 and 10^9+7.</small>
        </div>
        <div className="form-group">
          <label htmlFor="priority">Priority:</label>
          <select 
            id="priority" 
            value={priority} 
            onChange={(e) => setPriority(e.target.value)}
            required
          >
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>

      {/* Display messages based on state */}
      {ingestionId && (
        <p className="success-message">
          Ingestion request submitted! Your ID: <strong>{ingestionId}</strong>
        </p>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default IngestionForm;