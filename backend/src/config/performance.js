const { getDB } = require('./db');

async function measurePerformance() {
    const db = getDB();
    const results = {};

    console.log('\n🔍 Mesure des performances...\n');

    // ── TEST 1 : Filtre par statut ─────────────────────────
    const test1 = await db.collection('orders')
        .find({ status: 'delivered' })
        .explain('executionStats');

    results.filter_by_status = {
        description:       'Filtre par statut (delivered)',
        docs_examined:     test1.executionStats.totalDocsExamined,
        docs_returned:     test1.executionStats.totalDocsReturned,
        execution_time_ms: test1.executionStats.executionTimeMillis,
        index_used:        test1.executionStats.executionStages.inputStage?.indexName || 'AUCUN (COLLSCAN)'
    };

    // ── TEST 2 : Filtre par ville ──────────────────────────
    const test2 = await db.collection('orders')
        .find({ 'customer.location.city': 'Casablanca' })
        .explain('executionStats');

    results.filter_by_city = {
        description:       'Filtre par ville (Casablanca)',
        docs_examined:     test2.executionStats.totalDocsExamined,
        docs_returned:     test2.executionStats.totalDocsReturned,
        execution_time_ms: test2.executionStats.executionTimeMillis,
        index_used:        test2.executionStats.executionStages.inputStage?.indexName || 'AUCUN (COLLSCAN)'
    };

    // ── TEST 3 : Filtre statut + plage de dates ────────────
    const test3 = await db.collection('orders')
        .find({
            status: 'delivered',
            date: {
                $gte: new Date('2024-01-01'),
                $lt:  new Date('2024-12-31')
            }
        })
        .explain('executionStats');

    results.filter_status_date = {
        description:       'Filtre statut + date (2024)',
        docs_examined:     test3.executionStats.totalDocsExamined,
        docs_returned:     test3.executionStats.totalDocsReturned,
        execution_time_ms: test3.executionStats.executionTimeMillis,
        index_used:        test3.executionStats.executionStages.inputStage?.indexName || 'AUCUN (COLLSCAN)'
    };

    // ── TEST 4 : Filtre par segment client ─────────────────
    const test4 = await db.collection('orders')
        .find({ 'customer.segment': 'VIP' })
        .explain('executionStats');

    results.filter_by_segment = {
        description:       'Filtre par segment (VIP)',
        docs_examined:     test4.executionStats.totalDocsExamined,
        docs_returned:     test4.executionStats.totalDocsReturned,
        execution_time_ms: test4.executionStats.executionTimeMillis,
        index_used:        test4.executionStats.executionStages.inputStage?.indexName || 'AUCUN (COLLSCAN)'
    };

    return results;
}

module.exports = { measurePerformance };