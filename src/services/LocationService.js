import api from './api';

class LocationService {
// Get list of country
  async getCountries() {
    try {
      const response = await api.get('/api/services/app/Countries/GetList');
      return response;
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  }

  // Get list of cities/provinces
  async getCities() {
    try {
      const response = await api.get('/api/services/app/Cities/GetList');
      return response;
    } catch (error) {
      console.error('Error fetching cities:', error);
      throw error;
    }
  }

  // Get districts by provinceId
  async getDistricts(provinceId) {
    try {
      const response = await api.get('/api/services/app/Districts/GetList', {
        params: {
          provinceId
        }
      });
      return response;
    } catch (error) {
      console.error('Error fetching districts:', error);
      throw error;
    }
  }

  // Get wards by districtId
  async getWards(districtId) {
    try {
      const response = await api.get('/api/services/app/Wards/GetList', {
        params: {
          districtId
        }
      });
      return response;
    } catch (error) {
      console.error('Error fetching wards:', error);
      throw error;
    }
  }
}

export default new LocationService(); 