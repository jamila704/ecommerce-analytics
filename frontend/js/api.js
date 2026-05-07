// URL de base de l'API
const API_BASE = 'http://localhost:3000/api';

// Fonction générique pour appeler l'API
async function fetchAPI(endpoint) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error(`❌ Erreur API ${endpoint}:`, error);
        return null;
    }
}

// Fonctions spécifiques par endpoint
const API = {
    getStats:          () => fetchAPI('/revenue/stats'),
    getMonthlyRevenue: () => fetchAPI('/revenue/monthly?year=2024'),
    getRevenueByCity:  () => fetchAPI('/revenue/by-city'),
    getTopProducts:    () => fetchAPI('/products/top?limit=10'),
    getByCategory:     () => fetchAPI('/products/by-category'),
    getSegments:       () => fetchAPI('/customers/segments-summary'),
    getDelivery:       () => fetchAPI('/customers/delivery-performance'),
};