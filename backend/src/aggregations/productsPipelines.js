// ════════════════════════════════════════════════════════════
// PIPELINES — Analyses des produits
// ════════════════════════════════════════════════════════════

// ANALYSE 4 — Top produits les plus vendus
const topProductsPipeline = (limit = 10) => [

    // Étape 1 : on garde commandes livrées ou expédiées
    {
        $match: {
            status: { $in: ['delivered', 'shipped'] }
        }
    },

    // Étape 2 : $unwind décompose le tableau items
    // Avant : 1 document avec items: [{...}, {...}, {...}]
    // Après : 3 documents avec 1 item chacun
    { $unwind: '$items' },

    // Étape 3 : regroupement par produit
    {
        $group: {
            _id:           '$items.product_id',
            product_name:  { $first: '$items.name' },
            category:      { $first: '$items.category' },
            total_qty:     { $sum:   '$items.quantity' },
            total_revenue: {
                $sum: {
                    $multiply: ['$items.quantity', '$items.final_price']
                }
            },
            nb_orders:     { $sum: 1 },
            avg_discount:  { $avg: '$items.discount' }
        }
    },

    // Étape 4 : tri par quantité vendue
    { $sort: { total_qty: -1 } },

    // Étape 5 : on limite aux N premiers
    { $limit: limit },

    // Étape 6 : formatage
    {
        $project: {
            _id: 0,
            product_id:    '$_id',
            product_name:  1,
            category:      1,
            total_qty:     1,
            total_revenue: { $round: ['$total_revenue', 2] },
            nb_orders:     1,
            avg_discount:  { $round: [{ $multiply: ['$avg_discount', 100] }, 1] }
        }
    }
];

// ANALYSE 5 — CA par catégorie
const revenueByCategoryPipeline = () => [

    { $match: { status: 'delivered' } },

    { $unwind: '$items' },

    {
        $group: {
            _id:           '$items.category',
            total_revenue: {
                $sum: { $multiply: ['$items.quantity', '$items.final_price'] }
            },
            total_qty:     { $sum: '$items.quantity' },
            nb_orders:     { $sum: 1 }
        }
    },

    { $sort: { total_revenue: -1 } },

    {
        $project: {
            _id: 0,
            category:      '$_id',
            total_revenue: { $round: ['$total_revenue', 2] },
            total_qty:     1,
            nb_orders:     1
        }
    }
];

module.exports = {
    topProductsPipeline,
    revenueByCategoryPipeline
};