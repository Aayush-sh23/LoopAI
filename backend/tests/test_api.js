

const axios = require('axios');
const { expect } = require('chai');


const BASE_URL = 'http://localhost:5000';

describe('Data Ingestion API System Tests', function() {
 
  
  this.timeout(70000); 

  
  let ingestionId1, ingestionId2, ingestionId3, ingestionId4;

  
  before(async function() {
    console.log('Starting API tests. Giving server a moment to ensure it is fully ready...');
    await new Promise(resolve => setTimeout(resolve, 1000)); 
  });

  
  describe('POST /ingest', () => {
    it('should submit a MEDIUM priority request and return an ingestion_id', async () => {
      console.log('\n--- Test: POST /ingest (MEDIUM) ---');
      const response = await axios.post(`${BASE_URL}/ingest`, {
        ids: [1, 2, 3, 4, 5], 
        priority: 'MEDIUM'
      });
      expect(response.status).to.equal(202);
      expect(response.data).to.have.property('ingestion_id').that.is.a('string');
      ingestionId1 = response.data.ingestion_id;
      console.log(`  Ingestion ID 1 (MEDIUM): ${ingestionId1}`);
    });

    it('should submit a HIGH priority request and return an ingestion_id', async () => {
      
      
      console.log('\n--- Test: POST /ingest (HIGH) ---');
      await new Promise(resolve => setTimeout(resolve, 500)); 
      const response = await axios.post(`${BASE_URL}/ingest`, {
        ids: [6, 7, 8, 9, 10, 11], 
        priority: 'HIGH'
      });
      expect(response.status).to.equal(202);
      expect(response.data).to.have.property('ingestion_id').that.is.a('string');
      ingestionId2 = response.data.ingestion_id;
      console.log(`  Ingestion ID 2 (HIGH): ${ingestionId2}`);
    });

    it('should submit a LOW priority request and return an ingestion_id', async () => {
      
      console.log('\n--- Test: POST /ingest (LOW) ---');
      await new Promise(resolve => setTimeout(resolve, 500)); 
      const response = await axios.post(`${BASE_URL}/ingest`, {
        ids: [101, 102, 103, 104], 
        priority: 'LOW'
      });
      expect(response.status).to.equal(202);
      expect(response.data).to.have.property('ingestion_id').that.is.a('string');
      ingestionId3 = response.data.ingestion_id;
      console.log(`  Ingestion ID 3 (LOW): ${ingestionId3}`);
    });

    it('should handle invalid input for ids (non-array)', async () => {
      console.log('\n--- Test: POST /ingest (Invalid IDs - non-array) ---');
      try {
        await axios.post(`${BASE_URL}/ingest`, {
          ids: 'not_an_array',
          priority: 'HIGH'
        });
        expect.fail('Expected request to fail with status 400');
      } catch (error) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.error).to.include('Invalid "ids" provided');
        console.log(`  Error: ${error.response.data.error}`);
      }
    });

    it('should handle invalid input for ids (contains non-number)', async () => {
      console.log('\n--- Test: POST /ingest (Invalid IDs - non-number) ---');
      try {
        await axios.post(`${BASE_URL}/ingest`, {
          ids: [1, 'a', 3],
          priority: 'HIGH'
        });
        expect.fail('Expected request to fail with status 400');
      } catch (error) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.error).to.include('Invalid "ids" provided');
        console.log(`  Error: ${error.response.data.error}`);
      }
    });

    it('should handle invalid input for ids (out of range)', async () => {
      console.log('\n--- Test: POST /ingest (Invalid IDs - out of range) ---');
      try {
        await axios.post(`${BASE_URL}/ingest`, {
          ids: [0, 10**9 + 8], 
          priority: 'HIGH'
        });
        expect.fail('Expected request to fail with status 400');
      } catch (error) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.error).to.include('Invalid "ids" provided');
        console.log(`  Error: ${error.response.data.error}`);
      }
    });

    it('should handle invalid input for priority', async () => {
      console.log('\n--- Test: POST /ingest (Invalid Priority) ---');
      try {
        await axios.post(`${BASE_URL}/ingest`, {
          ids: [1, 2],
          priority: 'INVALID_PRIORITY'
        });
        expect.fail('Expected request to fail with status 400');
      } catch (error) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.error).to.include('Invalid "priority" provided');
        console.log(`  Error: ${error.response.data.error}`);
      }
    });
  });

  
  describe('GET /status/:ingestion_id - Priority and Rate Limit Verification', () => {
    it('should initially show requests as yet_to_start or triggered', async () => {
      console.log('\n--- Test: Initial Status Check ---');
      
      await new Promise(resolve => setTimeout(resolve, 100));

      const status1 = await axios.get(`${BASE_URL}/status/${ingestionId1}`);
      expect(status1.status).to.equal(200);
      expect(status1.data.status).to.be.oneOf(['yet_to_start', 'triggered']);
      expect(status1.data.batches.length).to.equal(2); 
      console.log(`  Status ID 1 (${ingestionId1}): ${status1.data.status}`);

      const status2 = await axios.get(`${BASE_URL}/status/${ingestionId2}`);
      expect(status2.status).to.equal(200);
      expect(status2.data.status).to.be.oneOf(['yet_to_start', 'triggered']);
      expect(status2.data.batches.length).to.equal(2); 
      console.log(`  Status ID 2 (${ingestionId2}): ${status2.data.status}`);

      const status3 = await axios.get(`${BASE_URL}/status/${ingestionId3}`);
      expect(status3.status).to.equal(200);
      expect(status3.data.status).to.be.oneOf(['yet_to_start', 'triggered']);
      expect(status3.data.batches.length).to.equal(2); 
      console.log(`  Status ID 3 (${ingestionId3}): ${status3.data.status}`);
    });

    it('should verify processing order: MEDIUM (first batch), then HIGH (all batches), then MEDIUM (remaining), then LOW (all batches) with rate limits', async () => {
      console.log('\n--- Test: Detailed Priority and Rate Limit Order Verification ---');
      

      
      
      
      
      
      
      

      const pollStatus = async (id, expectedBatchIndex, expectedStatus, expectedIds, timeout) => {
        let attempts = 0;
        const maxAttempts = timeout / 1000 + 2; 
        let currentStatusData;

        while (attempts < maxAttempts) {
          try {
            currentStatusData = (await axios.get(`${BASE_URL}/status/${id}`)).data;
            if (currentStatusData.batches[expectedBatchIndex] && currentStatusData.batches[expectedBatchIndex].status === expectedStatus) {
              console.log(`  ${id} Batch ${expectedBatchIndex + 1} is ${expectedStatus}. IDs: [${currentStatusData.batches[expectedBatchIndex].ids.join(', ')}]`);
              expect(currentStatusData.batches[expectedBatchIndex].ids).to.deep.equal(expectedIds);
              return; 
            }
          } catch (e) {
            
          }
          await new Promise(resolve => setTimeout(resolve, 1000)); 
          attempts++;
        }
        expect.fail(`Timeout: Batch ${expectedBatchIndex + 1} of ${id} did not reach status '${expectedStatus}' with IDs [${expectedIds.join(', ')}] within ${timeout / 1000} seconds.`);
      };

      
      console.log('  Waiting for R1 Batch 1 (1,2,3) to complete...');
      await pollStatus(ingestionId1, 0, 'completed', [1, 2, 3], 6000); 

      
      console.log('  Waiting for R2 Batch 1 (6,7,8) to complete...');
      await pollStatus(ingestionId2, 0, 'completed', [6, 7, 8], 6000);

      
      console.log('  Waiting for R2 Batch 2 (9,10,11) to complete...');
      await pollStatus(ingestionId2, 1, 'completed', [9, 10, 11], 6000);
      let status2Final = (await axios.get(`${BASE_URL}/status/${ingestionId2}`)).data;
      expect(status2Final.status).to.equal('completed', 'R2 overall status should be completed');
      console.log(`  R2 overall status: ${status2Final.status}`);

      
      console.log('  Waiting for R1 Batch 2 (4,5) to complete...');
      await pollStatus(ingestionId1, 1, 'completed', [4, 5], 6000);
      let status1Final = (await axios.get(`${BASE_URL}/status/${ingestionId1}`)).data;
      expect(status1Final.status).to.equal('completed', 'R1 overall status should be completed');
      console.log(`  R1 overall status: ${status1Final.status}`);

      
      console.log('  Waiting for R3 Batch 1 (101,102,103) to complete...');
      await pollStatus(ingestionId3, 0, 'completed', [101, 102, 103], 6000);

      
      console.log('  Waiting for R3 Batch 2 (104) to complete...');
      await pollStatus(ingestionId3, 1, 'completed', [104], 6000);
      let status3Final = (await axios.get(`${BASE_URL}/status/${ingestionId3}`)).data;
      expect(status3Final.status).to.equal('completed', 'R3 overall status should be completed');
      console.log(`  R3 overall status: ${status3Final.status}`);
    }).timeout(45000); 

    it('should return 404 for a non-existent ingestion_id', async () => {
      console.log('\n--- Test: GET /status (Non-existent ID) ---');
      try {
        await axios.get(`${BASE_URL}/status/nonexistent_id_12345`);
        expect.fail('Expected request to fail with status 404');
      } catch (error) {
        expect(error.response.status).to.equal(404);
        expect(error.response.data.error).to.include('Ingestion ID not found');
        console.log(`  Error: ${error.response.data.error}`);
      }
    });

    it('should correctly reflect overall status: yet_to_start, triggered, completed', async () => {
      console.log('\n--- Test: Overall Status Transitions ---');
      
      const response = await axios.post(`${BASE_URL}/ingest`, {
        ids: [201, 202, 203, 204, 205, 206, 207],
        priority: 'MEDIUM'
      });
      ingestionId4 = response.data.ingestion_id;
      console.log(`  Ingestion ID 4 (MEDIUM) for status transition test: ${ingestionId4}`);

      
      const pollOverallStatus = async (id, expectedStatus, timeout) => {
        let attempts = 0;
        const maxAttempts = timeout / 1000 + 2;
        let currentStatusData;

        while (attempts < maxAttempts) {
          try {
            currentStatusData = (await axios.get(`${BASE_URL}/status/${id}`)).data;
            console.log(`  Polling status for ${id}: ${currentStatusData.status}`);
            if (currentStatusData.status === expectedStatus) {
              return; 
            }
          } catch (e) {
             
          }
          await new Promise(resolve => setTimeout(resolve, 1000)); 
          attempts++;
        }
        expect.fail(`Timeout: Overall status for ${id} did not reach '${expectedStatus}' within ${timeout / 1000} seconds.`);
      };

      
      let status4 = (await axios.get(`${BASE_URL}/status/${ingestionId4}`)).data;
      expect(status4.status).to.be.oneOf(['yet_to_start', 'triggered'], 'Initial status should be yet_to_start or triggered');
      console.log(`  Initial status for ID 4: ${status4.status}`);

      
      console.log('  Waiting for ID 4 to transition to "triggered" status...');
      await pollOverallStatus(ingestionId4, 'triggered', 10000); 

      
      status4 = (await axios.get(`${BASE_URL}/status/${ingestionId4}`)).data;
      const completedBatchesCount = status4.batches.filter(b => b.status === 'completed').length;
      expect(completedBatchesCount).to.be.at.least(1, 'At least one batch should be completed');
      expect(status4.status).to.equal('triggered', 'Status should be "triggered" if some batches are complete and some not');
      console.log(`  ID 4 has ${completedBatchesCount} completed batches. Status: ${status4.status}`);

      
      console.log('  Waiting for ID 4 to transition to "completed" status (all batches processed)...');
      await pollOverallStatus(ingestionId4, 'completed', 30000); 

      status4 = (await axios.get(`${BASE_URL}/status/${ingestionId4}`)).data;
      expect(status4.status).to.equal('completed', 'Final status should be "completed"');
      expect(status4.batches.every(b => b.status === 'completed')).to.be.true;
      console.log(`  Final status for ID 4: ${status4.status}`);
    }).timeout(60000); 
  });
});