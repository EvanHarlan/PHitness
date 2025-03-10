// In src/lib/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api', // Notice the /api here
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default instance;