const { MongoClient } = require('mongodb');
const { faker } = require('@faker-js/faker/locale/fr');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'ecommerce';

// ════════════════════════════════════════════════════════════
// DONNÉES DE RÉFÉRENCE — logique métier réaliste
// ════════════════════════════════════════════════════════════

// 1️⃣ PRODUITS — popularité inversement proportionnelle au prix
const products = [
    { id: 'PROD-001', name: 'Laptop Dell XPS',    category: 'Électronique', price: 12500, popularity: 3  },
    { id: 'PROD-002', name: 'iPhone 15',           category: 'Électronique', price: 9800,  popularity: 5  },
    { id: 'PROD-003', name: 'Samsung TV 55"',      category: 'Électronique', price: 6500,  popularity: 4  },
    { id: 'PROD-004', name: 'Casque Sony WH-1000', category: 'Électronique', price: 2800,  popularity: 8  },
    { id: 'PROD-005', name: 'Nike Air Max',        category: 'Vêtements',    price: 1200,  popularity: 12 },
    { id: 'PROD-006', name: "Jean Levi's 501",     category: 'Vêtements',    price: 850,   popularity: 13 },
    { id: 'PROD-007', name: 'Canapé 3 places',     category: 'Maison',       price: 4500,  popularity: 4  },
    { id: 'PROD-008', name: 'Vélo de sport',       category: 'Sport',        price: 3200,  popularity: 5  },
    { id: 'PROD-009', name: 'Crème hydratante',    category: 'Beauté',       price: 250,   popularity: 18 },
    { id: 'PROD-010', name: "Huile d'olive bio",   category: 'Alimentation', price: 120,   popularity: 20 },
    { id: 'PROD-011', name: 'Café en grains 1kg',  category: 'Alimentation', price: 95,    popularity: 22 },
    { id: 'PROD-012', name: 'T-shirt basique',     category: 'Vêtements',    price: 180,   popularity: 16 },
    { id: 'PROD-013', name: 'Tablette iPad',       category: 'Électronique', price: 5500,  popularity: 6  },
    { id: 'PROD-014', name: 'Tapis de yoga',       category: 'Sport',        price: 320,   popularity: 14 },
    { id: 'PROD-015', name: 'Parfum Chanel N°5',   category: 'Beauté',       price: 1800,  popularity: 9  },
];

// 2️⃣ VILLES — pondérées selon l'importance économique
const cities = [
    { weight: 30, value: 'Casablanca' },
    { weight: 15, value: 'Rabat'      },
    { weight: 12, value: 'Marrakech'  },
    { weight: 10, value: 'Fès'        },
    { weight: 10, value: 'Tanger'     },
    { weight: 8,  value: 'Agadir'     },
    { weight: 8,  value: 'Meknès'     },
    { weight: 7,  value: 'Oujda'      },
];

// 3️⃣ SEGMENTS CLIENTS — 10% VIP, 30% Standard, 60% Occasionnels
const customerSegments = [
    { weight: 10, value: 'VIP'         },
    { weight: 30, value: 'Standard'    },
    { weight: 60, value: 'Occasionnel' },
];

// 4️⃣ MOIS — saisonnalité réaliste
const monthWeights = [
    { weight: 5,  value: 1  }, // Janvier    — après fêtes, calme
    { weight: 4,  value: 2  }, // Février    — faible
    { weight: 5,  value: 3  }, // Mars       — normal
    { weight: 9,  value: 4  }, // Avril      — pic Ramadan
    { weight: 6,  value: 5  }, // Mai        — normal
    { weight: 4,  value: 6  }, // Juin       — faible
    { weight: 3,  value: 7  }, // Juillet    — été, creux
    { weight: 3,  value: 8  }, // Août       — été, creux
    { weight: 6,  value: 9  }, // Septembre  — rentrée
    { weight: 7,  value: 10 }, // Octobre    — normal
    { weight: 9,  value: 11 }, // Novembre   — pic Black Friday
    { weight: 12, value: 12 }, // Décembre   — pic fêtes
];

const carriers = ['Amana', 'Aramex', 'DHL', 'CTM', 'Chronopost'];
const paymentMethods = ['carte_bancaire', 'cash', 'virement', 'paypal'];

// ════════════════════════════════════════════════════════════
// FONCTIONS LOGIQUES
// ════════════════════════════════════════════════════════════

function getWeightedDate() {
    const month = faker.helpers.weightedArrayElement(monthWeights);
    const year = faker.helpers.arrayElement([2023, 2023, 2024, 2024, 2024]);
    const day = faker.number.int({ min: 1, max: 28 });
    const hour = faker.number.int({ min: 8, max: 22 });
    const minute = faker.number.int({ min: 0, max: 59 });
    return new Date(year, month - 1, day, hour, minute);
}

function getStatusByDate(orderDate) {
    const daysSince = (new Date() - orderDate) / (1000 * 60 * 60 * 24);

    if (daysSince < 1)  return 'pending';
    if (daysSince < 3)  return faker.helpers.arrayElement(['pending', 'processing']);
    if (daysSince < 7)  return faker.helpers.arrayElement(['processing', 'shipped']);
    if (daysSince < 14) return faker.helpers.arrayElement(['shipped', 'delivered']);

    return faker.helpers.weightedArrayElement([
        { weight: 80, value: 'delivered'  },
        { weight: 12, value: 'cancelled'  },
        { weight: 5,  value: 'shipped'    },
        { weight: 3,  value: 'processing' },
    ]);
}

function getBasketBySegment(segment) {
    const profiles = {
        'VIP':         { minItems: 2, maxItems: 5, preferExpensive: true  },
        'Standard':    { minItems: 1, maxItems: 3, preferExpensive: false },
        'Occasionnel': { minItems: 1, maxItems: 2, preferExpensive: false },
    };
    return profiles[segment];
}

// ════════════════════════════════════════════════════════════
// GÉNÉRATION D'UNE COMMANDE
// ════════════════════════════════════════════════════════════
function generateOrder(orderNum) {
    const segment = faker.helpers.weightedArrayElement(customerSegments);
    const profile = getBasketBySegment(segment);
    const numItems = faker.number.int({ min: profile.minItems, max: profile.maxItems });

    const items = [];
    let total = 0;

    for (let i = 0; i < numItems; i++) {
        const product = faker.helpers.weightedArrayElement(
            products.map(p => ({ weight: p.popularity, value: p }))
        );

        const discountOptions = segment === 'VIP'
            ? [0, 0.05, 0.10, 0.15, 0.20]
            : [0, 0, 0.05, 0.10];

        const quantity = faker.number.int({ min: 1, max: profile.preferExpensive ? 3 : 2 });
        const discount = faker.helpers.arrayElement(discountOptions);
        const finalPrice = Math.round(product.price * (1 - discount) * 100) / 100;

        items.push({
            product_id: product.id,
            name: product.name,
            category: product.category,
            quantity,
            unit_price: product.price,
            discount,
            final_price: finalPrice
        });

        total += quantity * finalPrice;
    }

    const date = getWeightedDate();
    const status = getStatusByDate(date);

    // ✅ CORRIGÉ — city est maintenant directement une string
    const city = faker.helpers.weightedArrayElement(cities);

    const carrier = faker.helpers.arrayElement(carriers);
    const estimatedDays = faker.number.int({ min: 2, max: 7 });
    const actualDays = status === 'delivered'
        ? faker.number.int({ min: 1, max: estimatedDays + 3 })
        : null;

    return {
        order_id: `ORD-${String(orderNum).padStart(6, '0')}`,
        date,
        status,
        customer: {
            customer_id: `CUST-${faker.number.int({ min: 1, max: 8000 })}`,
            name: faker.person.fullName(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            location: {
                city: city,   // ✅ CORRIGÉ — plus de city.name
                country: 'MA'
            },
            segment
        },
        items,
        payment: {
            method: faker.helpers.arrayElement(paymentMethods),
            total_amount: Math.round(total * 100) / 100,
            currency: 'MAD'
        },
        delivery: {
            carrier,
            estimated_days: estimatedDays,
            actual_days: actualDays,
            status
        }
    };
}

// ════════════════════════════════════════════════════════════
// GÉNÉRATION DES PRODUITS
// ════════════════════════════════════════════════════════════
function generateProducts() {
    return products.map(p => ({
        product_id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        popularity_score: p.popularity,
        stock: faker.number.int({ min: 0, max: 500 }),
        brand: faker.company.name(),
        created_at: new Date()
    }));
}

// ════════════════════════════════════════════════════════════
// PROGRAMME PRINCIPAL
// ════════════════════════════════════════════════════════════
async function main() {
    console.log('🔌 Connexion à MongoDB...');

    let client;
    for (let i = 0; i < 10; i++) {
        try {
            client = new MongoClient(MONGO_URI);
            await client.connect();
            console.log('✅ Connecté à MongoDB');
            break;
        } catch (err) {
            console.log(`⏳ Tentative ${i + 1}/10 — MongoDB pas encore prêt...`);
            await new Promise(r => setTimeout(r, 3000));
        }
    }

    if (!client) {
        console.error('❌ Impossible de se connecter à MongoDB');
        process.exit(1);
    }

    const db = client.db(DB_NAME);

    const count = await db.collection('orders').countDocuments();
    if (count > 0) {
        console.log(`⚠️  La base contient déjà ${count} commandes. Génération ignorée.`);
        await client.close();
        return;
    }

    console.log('📦 Insertion des produits...');
    const prods = generateProducts();
    await db.collection('products').insertMany(prods);
    console.log(`✅ ${prods.length} produits insérés`);

    const TOTAL = 50000;
    const BATCH_SIZE = 1000;
    console.log(`🛒 Génération de ${TOTAL} commandes avec logique métier réaliste...`);

    for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
        const batch = [];
        for (let j = 0; j < BATCH_SIZE && i + j < TOTAL; j++) {
            batch.push(generateOrder(i + j + 1));
        }
        await db.collection('orders').insertMany(batch);
        console.log(`  ✅ ${Math.min(i + BATCH_SIZE, TOTAL)} / ${TOTAL}`);
    }

    console.log('🎉 Génération terminée avec succès !');
    await client.close();
}

main();