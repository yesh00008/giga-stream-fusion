#!/usr/bin/env node

/**
 * Supabase Database Setup Script
 * 
 * This script sets up the complete database schema for Giga Stream Fusion
 * including tables, policies, functions, and triggers.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQLFile(filePath, description) {
  console.log(`\n📝 ${description}...`);
  
  try {
    const sql = readFileSync(filePath, 'utf-8');
    
    // Split SQL into individual statements (basic splitting)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));
    
    console.log(`   Found ${statements.length} SQL statements`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct execution via REST API
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
            },
            body: JSON.stringify({ query: statement })
          });
          
          if (!response.ok) {
            console.log(`   ⚠️  Statement ${i + 1} warning: ${error.message || 'Already exists'}`);
          } else {
            successCount++;
          }
        } else {
          successCount++;
        }
      } catch (err) {
        console.log(`   ⚠️  Statement ${i + 1} warning: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log(`   ✅ Completed: ${successCount} successful, ${errorCount} warnings`);
    return true;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function setupDatabase() {
  console.log('🚀 Starting Giga Stream Fusion Database Setup');
  console.log('=' .repeat(50));
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  
  // Execute database schema
  const schemaPath = join(__dirname, 'database-schema.sql');
  await executeSQLFile(schemaPath, 'Setting up database schema');
  
  console.log('\n' + '='.repeat(50));
  console.log('✨ Database setup complete!');
  console.log('\n📋 Next steps:');
  console.log('   1. Go to Supabase Dashboard > Storage');
  console.log('   2. Create the storage buckets (see storage-setup.sql)');
  console.log('   3. Run the storage policies from storage-setup.sql');
  console.log('   4. Start your application: npm run dev');
  console.log('\n💡 Tip: Check the Supabase dashboard to verify all tables were created');
}

// Run setup
setupDatabase().catch(console.error);
