// Simple script to test the connection between frontend and backend
import axios from 'axios';

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';

async function testConnection() {
  console.log(`Testing connection to backend at ${API_URL}...`);
  
  try {
    const response = await axios.get(`${API_URL}/health`);
    console.log('Connection successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('Connection failed!');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Backend might be down.');
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
}

testConnection();