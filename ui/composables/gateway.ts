import axios from 'axios';

const GATEWAY_BASE_URL = 'http://localhost:3010'; 

/**
 * Sends a message payload to the gateway.
 * @param {Object} payload - The message payload to send (XML/JSON format).
 * @returns {Promise<any>} - A promise that resolves with the response from the gateway.
 */
export const sendMessageToGateway = async (payload: any): Promise<any> => {
  try {
    const response = await axios.post(`${GATEWAY_BASE_URL}/messages`, payload, {
      headers: {
        'Content-Type': 'application/json', 
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message to gateway:', error);
    throw error;
  }
};

/**
 * Fetches the current status of the message queue from the gateway.
 * @returns {Promise<any>} - A promise that resolves with the queue status.
 */
export const getQueueStatusFromGateway = async (): Promise<any> => {
  try {
    const response = await axios.get(`${GATEWAY_BASE_URL}/queue/status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching queue status from gateway:', error);
    throw error;
  }
};
