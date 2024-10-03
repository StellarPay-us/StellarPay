import axios from 'axios'

const GATEWAY_BASE_URL = 'http://localhost:3010'

/**
 * Sends a message payload to the gateway.
 * @param {Object} payload - The message payload to send (JSON format).
 * @returns {Promise<any>} - A promise that resolves with the response from the gateway.
 */
export const sendMessageToGateway = async (payload: any): Promise<any> => {
  try {
    const response = await axios.post(`${GATEWAY_BASE_URL}/messages`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error sending message to gateway:', error)
    throw error
  }
}
