// ════════════════════════════════════════════════════════════
// PIPELINES — Analyses du chiffre d'affaires
// ════════════════════════════════════════════════════════════

// ANALYSE 1 — CA par mois et par année
const revenueByMonthPipeline = (year) => [

    // Étape 1 : on garde uniquement les commandes livrées
    {
        $match: {
            status: 'delivered',
            ...(year && {
                date: {
                    $gte: new Date(`${year}-01-01`),
                    $lt:  new Date(`${year + 1}-01-01`)
                }
            })
        }
    },

    // Étape 2 : on regroupe par année + mois
    {
        $group: {
            _id: {
                year:  { $year:  '$date' },
                month: { $month: '$date' }
            },
            revenue:      { $sum: '$payment.total_amount' },
            nb_orders:    { $sum: 1 },
            avg_basket:   { $avg: '$payment.total_amount' },
            max_order:    { $max: '$payment.total_amount' },
            min_order:    { $min: '$payment.total_amount' }
        }
    },

    // Étape 3 : on trie par date croissante
    { $sort: { '_id.year': 1, '_id.month': 1 } },

    // Étape 4 : on formate proprement le résultat
    {
        $project: {
            _id: 0,
            year:       '$_id.year',
            month:      '$_id.month',
            revenue:    { $round: ['$revenue', 2] },
            nb_orders:  1,
            avg_basket: { $round: ['$avg_basket', 2] },
            max_order:  { $round: ['$max_order', 2] },
            min_order:  { $round: ['$min_order', 2] }
        }
    }
];

// ANALYSE 2 — CA par ville
const revenueByCityPipeline = () => [

    // Étape 1 : uniquement les commandes livrées
    { $match: { status: 'delivered' } },

    // Étape 2 : regroupement par ville
    {
        $group: {
            _id:        '$customer.location.city',
            revenue:    { $sum: '$payment.total_amount' },
            nb_orders:  { $sum: 1 },
            avg_basket: { $avg: '$payment.total_amount' }
        }
    },

    // Étape 3 : tri par revenu décroissant
    { $sort: { revenue: -1 } },

    // Étape 4 : formatage
    {
        $project: {
            _id: 0,
            city:       '$_id',
            revenue:    { $round: ['$revenue', 2] },
            nb_orders:  1,
            avg_basket: { $round: ['$avg_basket', 2] }
        }
    }
];

// ANALYSE 3 — Évolution hebdomadaire des ventes (tendance)
const revenueTrendPipeline = () => [

    { $match: { status: 'delivered' } },

    {
        $group: {
            _id: {
                year: { $year:  '$date' },
                week: { $week:  '$date' }
            },
            revenue:   { $sum: '$payment.total_amount' },
            nb_orders: { $sum: 1 }
        }
    },

    { $sort: { '_id.year': 1, '_id.week': 1 } },

    {
        $project: {
            _id: 0,
            year:      '$_id.year',
            week:      '$_id.week',
            revenue:   { $round: ['$revenue', 2] },
            nb_orders: 1
        }
    }
];

module.exports = {
    revenueByMonthPipeline,
    revenueByCityPipeline,
    revenueTrendPipeline
};