import { readFileSync } from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const DB_PASSWORD = '9EaTWSrYTh5y5wU8';

console.log('🚀 Pushing Database Schema to Supabase...\n');

async function executeSQLBatch(sql: string) {
  // Use Supabase Management API
  const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1];
  
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: sql })
  });

  return response;
}

async function main() {
  const schema = readFileSync('./database-schema.sql', 'utf-8');
  
  console.log('📤 Uploading to Supabase...\n');
  
  const response = await executeSQLBatch(schema);
  
  if (response.ok) {
    console.log('✅ Database schema uploaded successfully!\n');
  } else {
    const error = await response.text();
    console.log('⚠️  API method not available. Using SQL Editor method...\n');
    console.log('📋 Please complete manually:');
    console.log('1. Open: https://supabase.com/dashboard/project/mbppxyzdynwjpftzdpgt/sql/new');
    console.log('2. Copy database-schema.sql contents');
    console.log('3. Paste and click RUN\n');
  }
}

main();
