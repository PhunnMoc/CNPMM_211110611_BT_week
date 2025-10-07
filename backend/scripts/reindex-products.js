#!/usr/bin/env node
const pool = require("../config/database");
const {
  ensureProductIndex,
  indexProduct,
} = require("../services/elasticsearch");

async function main() {
  console.log("Starting product reindex...");
  await ensureProductIndex();

  const [rows] = await pool.query("SELECT * FROM products WHERE is_active = 1");

  let success = 0;
  for (const row of rows) {
    try {
      await indexProduct({
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        discount_price: row.discount_price,
        sku: row.sku,
        category_id: row.category_id,
        brand: row.brand,
        weight: row.weight,
        dimensions: row.dimensions,
        stock_quantity: row.stock_quantity,
        is_featured: !!row.is_featured,
        is_active: !!row.is_active,
        created_at: row.created_at,
      });
      success++;
    } catch (e) {
      console.warn(`Failed to index product ${row.id}:`, e.message);
    }
  }

  console.log(`Indexed ${success}/${rows.length} products`);
  process.exit(0);
}

main().catch((e) => {
  console.error("Reindex failed:", e);
  process.exit(1);
});
