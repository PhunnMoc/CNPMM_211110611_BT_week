const { Client } = require("@elastic/elasticsearch");
const fs = require("fs");

// Create an Elasticsearch client with env-based configuration.
// Supports local dev (no auth) and cloud/self-hosted with basic auth or API key.
function createElasticsearchClient() {
  const node = process.env.ES_NODE || "http://localhost:9200";

  /** @type {import('@elastic/elasticsearch').ClientOptions} */
  const options = { node };

  if (process.env.ES_USERNAME && process.env.ES_PASSWORD) {
    options.auth = {
      username: process.env.ES_USERNAME,
      password: process.env.ES_PASSWORD,
    };
  }

  if (process.env.ES_API_KEY) {
    options.auth = { apiKey: process.env.ES_API_KEY };
  }

  if (process.env.ES_CA_CERT && fs.existsSync(process.env.ES_CA_CERT)) {
    options.tls = {
      ca: fs.readFileSync(process.env.ES_CA_CERT),
      rejectUnauthorized: process.env.ES_TLS_REJECT_UNAUTHORIZED !== "false",
    };
  }

  return new Client(options);
}

const esClient = createElasticsearchClient();

const PRODUCT_INDEX = process.env.ES_PRODUCT_INDEX || "products";

async function ensureProductIndex() {
  const exists = await esClient.indices.exists({ index: PRODUCT_INDEX });
  if (!exists) {
    await esClient.indices.create({
      index: PRODUCT_INDEX,
      mappings: {
        properties: {
          id: { type: "integer" },
          name: { type: "text" },
          description: { type: "text" },
          brand: { type: "keyword" },
          category_id: { type: "integer" },
          price: { type: "float" },
          is_active: { type: "boolean" },
          created_at: { type: "date" },
        },
      },
    });
  }
}

async function indexProduct(doc) {
  await esClient.index({
    index: PRODUCT_INDEX,
    id: String(doc.id),
    document: doc,
    refresh: "wait_for",
  });
}

async function deleteProduct(id) {
  await esClient.delete({
    index: PRODUCT_INDEX,
    id: String(id),
    ignore: [404],
    refresh: "wait_for",
  });
}

async function searchProducts(query, options = {}) {
  const { from = 0, size = 12, categoryId, minPrice, maxPrice } = options;

  const must = [];
  const filter = [{ term: { is_active: true } }];

  if (query) {
    must.push({
      multi_match: {
        query,
        fields: ["name^3", "description", "brand^2"],
        type: "best_fields",
        operator: "and",
      },
    });
  }

  if (categoryId) filter.push({ term: { category_id: categoryId } });
  if (minPrice !== undefined || maxPrice !== undefined) {
    const range = {};
    if (minPrice !== undefined) range.gte = parseFloat(minPrice);
    if (maxPrice !== undefined) range.lte = parseFloat(maxPrice);
    filter.push({ range: { price: range } });
  }

  const result = await esClient.search({
    index: PRODUCT_INDEX,
    from,
    size,
    query: { bool: { must, filter } },
  });

  const hits = result.hits?.hits || [];
  return {
    total: result.hits?.total?.value || 0,
    items: hits.map((h) => ({ id: parseInt(h._id, 10), ...h._source })),
  };
}

module.exports = {
  esClient,
  ensureProductIndex,
  indexProduct,
  deleteProduct,
  searchProducts,
  PRODUCT_INDEX,
};
