#!/bin/bash

# Automated Supabase Database Setup Script
# This script pushes the database schema directly to Supabase using psql

echo "🚀 Pushing Database Schema to Supabase..."
echo "=========================================="
echo ""

# Load environment variables
source .env 2>/dev/null || true

# Extract database details from Supabase URL
PROJECT_REF=$(echo $VITE_SUPABASE_URL | grep -oP '(?<=https://)[^.]+')

# Supabase connection string format:
# postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

echo "📍 Project: $PROJECT_REF"
echo ""
echo "⚠️  IMPORTANT: For direct database access, you need your database password."
echo ""
echo "To get it:"
echo "1. Go to https://supabase.com/dashboard/project/$PROJECT_REF/settings/database"
echo "2. Copy your database password"
echo ""
read -p "Enter your database password: " -s DB_PASSWORD
echo ""
echo ""

CONNECTION_STRING="postgresql://postgres:$DB_PASSWORD@db.$PROJECT_REF.supabase.co:5432/postgres"

echo "📤 Uploading database schema..."
echo ""

# Check if psql is available
if command -v psql &> /dev/null; then
    psql "$CONNECTION_STRING" -f database-schema.sql
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Database schema uploaded successfully!"
        echo ""
        npm run db:verify
    else
        echo "❌ Upload failed. Please try the manual method."
    fi
else
    echo "⚠️  psql not found. Using alternative method..."
    echo ""
    echo "📋 Please complete these steps manually:"
    echo ""
    echo "1. Open: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
    echo "2. Copy contents of database-schema.sql"
    echo "3. Paste and click RUN"
    echo ""
fi
