// scripts/seed_users.js
require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;

const usersToSeed = [
  {
    username: "admin",
    email: "admin@gmail.com",
    password: "password123",
    first_name: "Admin",
    last_name: "User",
    phone: "+1234567890",
    is_admin: 1,
  },
  {
    username: "john_doe",
    email: "john@example.com",
    password: "password123",
    first_name: "John",
    last_name: "Doe",
    phone: "+1234567891",
    is_admin: 0,
  },
  {
    username: "jane_smith",
    email: "jane@example.com",
    password: "password123",
    first_name: "Jane",
    last_name: "Smith",
    phone: "+1234567892",
    is_admin: 0,
  },
];

// Config from .env: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "shopping_website",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const u of usersToSeed) {
      // Hash password
      const hash = await bcrypt.hash(u.password, SALT_ROUNDS);

      // Upsert: if user with email exists -> update password_hash (and other fields if you want)
      // Otherwise insert new user.
      const [rows] = await conn.execute(
        "SELECT id FROM users WHERE email = ? LIMIT 1",
        [u.email]
      );

      if (rows.length === 0) {
        // Insert
        await conn.execute(
          `INSERT INTO users (username, email, password_hash, first_name, last_name, phone, is_admin)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            u.username,
            u.email,
            hash,
            u.first_name,
            u.last_name,
            u.phone,
            u.is_admin,
          ]
        );
        console.log(`Inserted user ${u.email}`);
      } else {
        // Update password_hash (and optionally username, names, phone, is_admin)
        await conn.execute(
          `UPDATE users
           SET password_hash = ?, username = ?, first_name = ?, last_name = ?, phone = ?, is_admin = ?
           WHERE email = ?`,
          [
            hash,
            u.username,
            u.first_name,
            u.last_name,
            u.phone,
            u.is_admin,
            u.email,
          ]
        );
        console.log(`Updated user ${u.email} (password refreshed)`);
      }
    }

    await conn.commit();
    console.log("Seeding users done.");
  } catch (err) {
    await conn.rollback();
    console.error("Seeding failed:", err);
    process.exitCode = 1;
  } finally {
    conn.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
