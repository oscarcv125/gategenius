const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error(`Error: ${response.statusText}`);
    return response.json();
  }

  async post(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Error: ${response.statusText}`);
    return response.json();
  }

  // Métodos específicos
  getConsumptionData() {
    return this.get('/consumption');
  }

  getExpirationData() {
    return this.get('/expiration');
  }

  getProductivityData() {
    return this.get('/productivity');
  }

  registerUser(userData) {
    return this.post('/users/register', userData);
  }

  loginUser(credentials) {
    return this.post('/users/login', credentials);
  }
}

export default new ApiService();
