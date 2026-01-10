import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

// ============ EVENT TRACKING ============

export const trackEvent = async (eventData) => {
  try {
    const response = await axios.post(`${API_URL}/analytics/track`, eventData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to track event:", error);
    return null;
  }
};

export const trackBatchEvents = async (events) => {
  try {
    const response = await axios.post(
      `${API_URL}/analytics/track/batch`,
      { events },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to track batch events:", error);
    return null;
  }
};

// ============ RECOMMENDATIONS ============

export const getRecommendations = async (
  token,
  limit = 10,
  type = "hybrid"
) => {
  const response = await axios.get(`${API_URL}/analytics/recommendations`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { limit, type },
  });
  return response.data;
};

export const getSimilarProducts = async (productId, limit = 6) => {
  const response = await axios.get(
    `${API_URL}/analytics/recommendations/similar/${productId}`,
    { params: { limit } }
  );
  return response.data;
};

// ============ CUSTOMER SEGMENTATION (Admin) ============

export const getCustomerSegments = async (token, params = {}) => {
  const response = await axios.get(`${API_URL}/analytics/segments`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
};

export const getMySegment = async (token) => {
  const response = await axios.get(`${API_URL}/analytics/segments/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const recalculateSegments = async (token) => {
  const response = await axios.post(
    `${API_URL}/analytics/segments/recalculate`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// ============ DEMAND FORECASTING ============

export const getDemandForecasts = async (token, params = {}) => {
  const response = await axios.get(`${API_URL}/analytics/forecasts`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
};

export const generateForecast = async (token, productId, days = 30) => {
  const response = await axios.post(
    `${API_URL}/analytics/forecasts/generate`,
    { productId, days },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// ============ DYNAMIC PRICING ============

export const getDynamicPrices = async (token, params = {}) => {
  const response = await axios.get(`${API_URL}/analytics/pricing`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
};

export const calculateDynamicPrice = async (token, productId) => {
  const response = await axios.post(
    `${API_URL}/analytics/pricing/calculate`,
    { productId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const applyDynamicPrice = async (token, productId, priceId) => {
  const response = await axios.post(
    `${API_URL}/analytics/pricing/apply`,
    { productId, priceId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// ============ DASHBOARD ANALYTICS ============

export const getDashboardAnalytics = async (token, params = {}) => {
  const response = await axios.get(`${API_URL}/analytics/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
};

export const getVendorAnalytics = async (token) => {
  const response = await axios.get(`${API_URL}/analytics/vendor/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ============ VENDOR-SPECIFIC PRICING ============

export const getVendorDynamicPrices = async (token, params = {}) => {
  const response = await axios.get(`${API_URL}/analytics/vendor/pricing`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
};

export const calculateVendorDynamicPrice = async (token, productId) => {
  const response = await axios.post(
    `${API_URL}/analytics/vendor/pricing/calculate`,
    { productId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// ============ VENDOR CUSTOMER SEGMENTS ============

export const getVendorCustomerSegments = async (token) => {
  const response = await axios.get(`${API_URL}/analytics/vendor/segments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ============ VENDOR DEMAND FORECASTING ============

export const getVendorDemandForecasts = async (token) => {
  const response = await axios.get(`${API_URL}/analytics/vendor/forecasts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ============ VENDOR PRICING SUGGESTIONS ============

export const getVendorPricingSuggestions = async (token) => {
  const response = await axios.get(
    `${API_URL}/analytics/vendor/pricing-suggestions`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};
