// ── Couleurs du dashboard ───────────────────────────────
const COLORS = [
    '#667eea', '#764ba2', '#f093fb',
    '#4facfe', '#00f2fe', '#43e97b',
    '#fa709a', '#fee140', '#a18cd1',
    '#ffecd2'
];

const CHART_DEFAULTS = {
    plugins: {
        legend: { labels: { color: '#a0aec0' } }
    },
    scales: {
        x: { ticks: { color: '#718096' }, grid: { color: '#2d3748' } },
        y: { ticks: { color: '#718096' }, grid: { color: '#2d3748' } }
    }
};

// ── Graphique 1 : CA mensuel (barres) ───────────────────
function renderMonthlyRevenue(data) {
    const months = ['Jan','Fév','Mar','Avr','Mai','Jun',
                    'Jul','Aoû','Sep','Oct','Nov','Déc'];
    const ctx = document.getElementById('chart-revenue-monthly').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => months[d.month - 1]),
            datasets: [{
                label: 'CA (MAD)',
                data: data.map(d => d.revenue),
                backgroundColor: COLORS[0] + 'cc',
                borderColor: COLORS[0],
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            ...CHART_DEFAULTS,
            plugins: {
                ...CHART_DEFAULTS.plugins,
                tooltip: {
                    callbacks: {
                        label: ctx => `${(ctx.raw / 1000000).toFixed(2)} M MAD`
                    }
                }
            }
        }
    });
}

// ── Graphique 2 : Catégories (donut) ────────────────────
function renderCategories(data) {
    const ctx = document.getElementById('chart-categories').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(d => d.category),
            datasets: [{
                data: data.map(d => d.total_revenue),
                backgroundColor: COLORS,
                borderWidth: 2,
                borderColor: '#1a1f2e'
            }]
        },
        options: {
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#a0aec0', padding: 15 }
                }
            }
        }
    });
}

// ── Graphique 3 : Top produits (barres horizontales) ────
function renderTopProducts(data) {
    const ctx = document.getElementById('chart-top-products').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.product_name),
            datasets: [{
                label: 'Quantité vendue',
                data: data.map(d => d.total_qty),
                backgroundColor: COLORS.map(c => c + 'cc'),
                borderColor: COLORS,
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            ...CHART_DEFAULTS,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// ── Graphique 4 : Ventes par ville (barres) ─────────────
function renderCities(data) {
    const ctx = document.getElementById('chart-cities').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.city),
            datasets: [{
                label: 'CA (MAD)',
                data: data.map(d => d.revenue),
                backgroundColor: COLORS[1] + 'cc',
                borderColor: COLORS[1],
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: { ...CHART_DEFAULTS }
    });
}

// ── Graphique 5 : Segments clients (donut) ──────────────
function renderSegments(data) {
    const ctx = document.getElementById('chart-segments').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(d => `${d.segment} (${d.nb_clients})`),
            datasets: [{
                data: data.map(d => d.nb_clients),
                backgroundColor: [COLORS[5], COLORS[0], COLORS[6]],
                borderWidth: 2,
                borderColor: '#1a1f2e'
            }]
        },
        options: {
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#a0aec0' }
                }
            }
        }
    });
}

// ── Graphique 6 : Performance livraisons (barres) ───────
function renderDelivery(data) {
    const ctx = document.getElementById('chart-delivery').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.carrier),
            datasets: [{
                label: 'Taux à temps (%)',
                data: data.map(d => d.on_time_rate),
                backgroundColor: COLORS[3] + 'cc',
                borderColor: COLORS[3],
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            ...CHART_DEFAULTS,
            scales: {
                ...CHART_DEFAULTS.scales,
                y: {
                    ...CHART_DEFAULTS.scales.y,
                    min: 50,
                    max: 70
                }
            }
        }
    });
}