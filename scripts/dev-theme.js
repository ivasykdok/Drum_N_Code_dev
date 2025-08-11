require('dotenv').config();
const { execSync } = require('child_process');

const store = process.env.SHOPIFY_STORE;

if (!store) {
  console.error("❌ SHOPIFY_STORE або THEME_ID не задані в .env");
  process.exit(1);
}

const command = `shopify theme dev -s ${store}`;
execSync(command, { stdio: 'inherit' });