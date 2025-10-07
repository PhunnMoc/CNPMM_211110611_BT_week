#!/usr/bin/env node

/**
 * Database Setup Script
 *
 * This script automates the complete database setup process:
 * 1. Creates database and tables (schema.sql)
 * 2. Seeds users with proper password hashing (seed_users.js)
 * 3. Inserts sample data (seeds.sql)
 *
 * Usage: node setup-database.js
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables from nearest available .env
// Try: scripts/.env -> backend/.env -> repo-root/.env
(() => {
  const candidateEnvPaths = [
    path.resolve(__dirname, ".env"),
    path.resolve(__dirname, "..", ".env"),
    path.resolve(__dirname, "..", "..", ".env"),
  ];

  for (const envPath of candidateEnvPaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      break;
    }
  }
})();

// Configuration
const config = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "shopping_website",
  port: process.env.DB_PORT || 3306,
};

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, "cyan");
}

function logSuccess(message) {
  log(`✅ ${message}`, "green");
}

function logError(message) {
  log(`❌ ${message}`, "red");
}

function logWarning(message) {
  log(`⚠️  ${message}`, "yellow");
}

// Check if MySQL is available
function checkMySQL() {
  try {
    execSync("mysql --version", { stdio: "pipe" });
    return true;
  } catch (error) {
    return false;
  }
}

// Check if required files exist
function checkFiles() {
  const files = ["database/schema.sql", "database/seeds.sql", "seed_users.js"];

  const missing = files.filter((file) => !fs.existsSync(file));

  if (missing.length > 0) {
    logError(`Missing required files: ${missing.join(", ")}`);
    return false;
  }

  return true;
}

// Execute SQL file
function executeSQLFile(filePath, description) {
  try {
    logStep("SQL", `Executing ${description}...`);

    const command = `mysql -h ${config.host} -u ${config.user} ${
      config.password ? `-p${config.password}` : ""
    } -P ${config.port} < "${filePath}"`;

    execSync(command, {
      stdio: "pipe",
      cwd: process.cwd(),
    });

    logSuccess(`${description} completed successfully`);
    return true;
  } catch (error) {
    logError(`Failed to execute ${description}: ${error.message}`);
    return false;
  }
}

// Execute Node.js script
function executeNodeScript(scriptPath, description) {
  try {
    logStep("NODE", `Running ${description}...`);

    execSync(`node "${scriptPath}"`, {
      stdio: "inherit",
      cwd: process.cwd(),
    });

    logSuccess(`${description} completed successfully`);
    return true;
  } catch (error) {
    logError(`Failed to run ${description}: ${error.message}`);
    return false;
  }
}

// Main setup function
async function setupDatabase() {
  log("🚀 Starting Database Setup", "bright");
  log("============================", "bright");

  // Check prerequisites
  logStep("CHECK", "Checking prerequisites...");

  if (!checkMySQL()) {
    logError("MySQL is not installed or not in PATH");
    log(
      "Please install MySQL and ensure it's available in your system PATH",
      "yellow"
    );
    process.exit(1);
  }

  if (!checkFiles()) {
    logError("Required files are missing");
    process.exit(1);
  }

  logSuccess("All prerequisites met");

  // Step 1: Create database and tables
  if (!executeSQLFile("database/schema.sql", "Database Schema")) {
    logError("Database setup failed at schema creation");
    process.exit(1);
  }

  // Step 2: Seed users with proper password hashing
  if (!executeNodeScript("seed_users.js", "User Seeding")) {
    logError("Database setup failed at user seeding");
    process.exit(1);
  }

  // Step 3: Insert sample data
  if (!executeSQLFile("database/seeds.sql", "Sample Data")) {
    logError("Database setup failed at sample data insertion");
    process.exit(1);
  }

  // Success message
  log("\n🎉 Database Setup Complete!", "bright");
  log("============================", "bright");
  logSuccess("Database created and populated successfully");

  log("\n📋 Default Admin Account:", "bright");
  log("Email: admin@gmail.com", "cyan");
  log("Password: password123", "cyan");

  log("\n📋 Test User Accounts:", "bright");
  log("Email: john@example.com | Password: password123", "cyan");
  log("Email: jane@example.com | Password: password123", "cyan");

  log("\n🔧 Next Steps:", "bright");
  log("1. Start the backend server: npm start", "yellow");
  log("2. Start the frontend: cd ../../frontend && npm run dev", "yellow");
  log("3. Visit http://localhost:3000 to access the application", "yellow");

  log("\n✨ Happy coding!", "magenta");
}

// Handle errors
process.on("uncaughtException", (error) => {
  logError(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Run the setup
setupDatabase().catch((error) => {
  logError(`Setup failed: ${error.message}`);
  process.exit(1);
});
