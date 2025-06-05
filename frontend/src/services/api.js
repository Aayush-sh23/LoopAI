
// frontend/src/services/api.js

// IMPORTANT: Update this URL if your backend is not running on localhost:5000
// or when you deploy your backend to a live server (e.g., Heroku, Railway URL).
const API_BASE_URL = 'http://localhost:5000'; 

/**
 * Submits a new data ingestion request to the backend.
 * * @param {number[]} ids - An array of integer IDs to be ingested.
 * @param {string} priority - The priority of the request ('HIGH', 'MEDIUM', 'LOW').
 * @returns {Promise<{ingestion_id: string}>} - A promise that resolves with the unique ingestion ID.
 * @throws {Error} If the API call fails or returns an error.
 */
export const submitIngestionRequest = async (ids, priority) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids, priority }),
    });

    if (!response.ok) {
      const errorData = await response.json(); // Get error message from backend
      throw new Error(`API error: ${response.status} - ${errorData.error || 'Something went wrong'}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error submitting ingestion request:", error);
    throw error; // Re-throw to be handled by the component
  }
};

/**
 * Fetches the current processing status of an ingestion request from the backend.
 * * @param {string} ingestionId - The unique ID of the ingestion request.
 * @returns {Promise<object>} - A promise that resolves with the status data.
 * @throws {Error} If the API call fails or returns an error.
 */
export const getIngestionStatus = async (ingestionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/status/${ingestionId}`);

    if (!response.ok) {
      const errorData = await response.json(); // Get error message from backend
      throw new Error(`API error: ${response.status} - ${errorData.error || 'Something went wrong'}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching status for ${ingestionId}:`, error);
    throw error; // Re-throw to be handled by the component
  }
};