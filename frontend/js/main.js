// ── Formate les grands nombres ──────────────────────────
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + ' M';
    if (num >= 1000)    return (num / 1000).toFixed(1) + ' K';
    return num.toString();
}

// ── Charge et affiche tout ──────────────────────────────
async function loadDashboard() {

    // Date de mise à jour
    document.getElementById('last-updated').textContent =
        'Mis à jour : ' + new Date().toLocaleString('fr-FR');

    // ── KPI Cards ───────────────────────────────────────
    const stats = await API.getStats();
    if (stats) {
        document.getElementById('total-revenue').textContent =
            formatNumber(stats.total_revenue) + ' MAD';
        document.getElementById('total-orders').textContent =
            formatNumber(stats.total_orders);
        document.getElementById('total-customers').textContent =
            formatNumber(stats.total_customers);
        document.getElementById('avg-basket').textContent =
            formatNumber(stats.avg_basket) + ' MAD';
    }

    // ── Graphiques ──────────────────────────────────────
    const [monthly, cities, products, categories, segments, delivery] =
        await Promise.all([
            API.getMonthlyRevenue(),
            API.getRevenueByCity(),
            API.getTopProducts(),
            API.getByCategory(),
            API.getSegments(),
            API.getDelivery()
        ]);

    if (monthly)    renderMonthlyRevenue(monthly);
    if (categories) renderCategories(categories);
    if (products)   renderTopProducts(products);
    if (cities)     renderCities(cities);
    if (segments)   renderSegments(segments);
    if (delivery)   renderDelivery(delivery);
}

// Lance le dashboard au chargement
loadDashboard();