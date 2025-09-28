#!/bin/bash

# Database Setup Script for Linux/macOS
# This script automates the complete database setup process

echo ""
echo "========================================"
echo "   Shopping Website Database Setup"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "ERROR: MySQL is not installed or not in PATH"
    echo "Please install MySQL from https://dev.mysql.com/downloads/"
    exit 1
fi

# Make the script executable
chmod +x setup-database.js

# Run the database setup
echo "Starting database setup..."
cd backend/scripts
node setup-database.js

if [ $? -ne 0 ]; then
    echo ""
    echo "Database setup failed!"
    exit 1
fi

echo ""
echo "Database setup completed successfully!"
echo ""
