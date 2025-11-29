const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
export const API_BASE_URL = USE_MOCK
    ? 'http://localhost:5000'
    : '';