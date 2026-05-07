// ════════════════════════════════════════════════════════════
// PIPELINES — Analyses clients (complexe multi-étapes)
// ════════════════════════════════════════════════════════════

// ANALYSE 6 — Segmentation clients (pipeline complexe)
// C'est l'agrégation multi-étapes exigée par la prof
const customerSegmentationPipeline = () => [

    // Étape 1 : uniquement commandes livrées
    { $match: { status: 'delivered' } },

    // Étape 2 : regroupement par client
    {
        $group: {
            _id:          '$customer.customer_id',
            name:         { $first: '$customer.name' },
            city:         { $first: '$customer.location.city' },
            segment:      { $first: '$customer.segment' },
            total_orders: { $sum: 1 },
            total_spent:  { $sum: '$payment.total_amount' },
            avg_basket:   { $avg: '$payment.total_amount' },
            first_order:  { $min: '$date' },
            last_order:   { $max: '$date' }
        }
    },

    // Étape 3 : calcul de la durée de vie client (en jours)
    {
        $addFields: {
            days_as_customer: {
                $dateDiff: {
                    startDate: '$first_order',
                    endDate:   '$last_order',
                    unit:      'day'
                }
            }
        }
    },

    // Étape 4 : calcul fréquence d'achat (commandes par mois)
    {
        $addFields: {
            purchase_frequency: {
                $cond: {
                    if:   { $gt: ['$days_as_customer', 0] },
                    then: {
                        $round: [{
                            $divide: [
                                { $multiply: ['$total_orders', 30] },
                                '$days_as_customer'
                            ]
                        }, 2]
                    },
                    else: '$total_orders'
                }
            }
        }
    },

    // Étape 5 : calcul du score RFM
    // R = Recency (récence), F = Frequency, M = Monetary
    {
        $addFields: {
            recency_days: {
                $dateDiff: {
                    startDate: '$last_order',
                    endDate:   new Date(),
                    unit:      'day'
                }
            }
        }
    },

    // Étape 6 : classification automatique basée sur les dépenses
    {
        $addFields: {
            computed_segment: {
                $switch: {
                    branches: [
                        {
                            case: { $gte: ['$total_spent', 50000] },
                            then: 'VIP'
                        },
                        {
                            case: { $gte: ['$total_spent', 15000] },
                            then: 'Standard'
                        }
                    ],
                    default: 'Occasionnel'
                }
            }
        }
    },

    // Étape 7 : tri par total dépensé
    { $sort: { total_spent: -1 } },

    // Étape 8 : formatage final
    {
        $project: {
            _id: 0,
            customer_id:        '$_id',
            name:               1,
            city:               1,
            segment:            1,
            computed_segment:   1,
            total_orders:       1,
            total_spent:        { $round: ['$total_spent', 2] },
            avg_basket:         { $round: ['$avg_basket', 2] },
            purchase_frequency: 1,
            recency_days:       1,
            first_order:        1,
            last_order:         1
        }
    }
];

// ANALYSE 7 — Résumé des segments
const segmentSummaryPipeline = () => [

    { $match: { status: 'delivered' } },

    {
        $group: {
            _id:         '$customer.segment',
            nb_clients:  { $addToSet: '$customer.customer_id' },
            nb_orders:   { $sum: 1 },
            total_spent: { $sum: '$payment.total_amount' },
            avg_basket:  { $avg: '$payment.total_amount' }
        }
    },

    {
        $project: {
            _id: 0,
            segment:     '$_id',
            nb_clients:  { $size: '$nb_clients' },
            nb_orders:   1,
            total_spent: { $round: ['$total_spent', 2] },
            avg_basket:  { $round: ['$avg_basket', 2] }
        }
    },

    { $sort: { total_spent: -1 } }
];

// ANALYSE 8 — Performance des livraisons
const deliveryPerformancePipeline = () => [

    {
        $match: {
            status: 'delivered',
            'delivery.actual_days': { $ne: null }
        }
    },

    {
        $group: {
            _id:              '$delivery.carrier',
            nb_livraisons:    { $sum: 1 },
            avg_actual_days:  { $avg: '$delivery.actual_days' },
            avg_estimated:    { $avg: '$delivery.estimated_days' },
            on_time: {
                $sum: {
                    $cond: [
                        { $lte: ['$delivery.actual_days', '$delivery.estimated_days'] },
                        1,
                        0
                    ]
                }
            }
        }
    },

    {
        $addFields: {
            on_time_rate: {
                $round: [{
                    $multiply: [
                        { $divide: ['$on_time', '$nb_livraisons'] },
                        100
                    ]
                }, 1]
            }
        }
    },

    { $sort: { on_time_rate: -1 } },

    {
        $project: {
            _id: 0,
            carrier:         '$_id',
            nb_livraisons:   1,
            avg_actual_days: { $round: ['$avg_actual_days', 1] },
            avg_estimated:   { $round: ['$avg_estimated', 1] },
            on_time_rate:    1
        }
    }
];

module.exports = {
    customerSegmentationPipeline,
    segmentSummaryPipeline,
    deliveryPerformancePipeline
};