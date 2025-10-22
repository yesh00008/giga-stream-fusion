import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('🚀 Creating Database Tables in Supabase...\n');

async function executeSQL(sql: string) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: sql })
  });
  
  return response;
}

async function createTables() {
  const schema = readFileSync('./database-schema.sql', 'utf-8');
  
  // Split into executable statements
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .filter(s => !s.startsWith('--'))
    .filter(s => !s.match(/^\/\*[\s\S]*?\*\/$/));

  console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    // Get statement type for logging
    const type = statement.match(/^(CREATE|ALTER|DROP|INSERT)\s+(\w+)/i);
    const description = type ? `${type[1]} ${type[2]}` : 'SQL';
    
    try {
      const response = await executeSQL(statement + ';');
      
      if (response.ok) {
        successCount++;
        console.log(`✅ [${i + 1}/${statements.length}] ${description}`);
      } else {
        const error = await response.text();
        if (error.includes('already exists')) {
          skipCount++;
          console.log(`⚠️  [${i + 1}/${statements.length}] ${description} (already exists)`);
        } else {
          errorCount++;
          console.log(`❌ [${i + 1}/${statements.length}] ${description}: ${error.substring(0, 100)}`);
        }
      }
    } catch (err: any) {
      errorCount++;
      console.log(`❌ [${i + 1}/${statements.length}] ${description}: ${err.message}`);
    }
    
    // Small delay to avoid rate limiting
    if (i % 10 === 0 && i > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`✅ Completed: ${successCount} created, ${skipCount} skipped, ${errorCount} errors`);
  console.log('='.repeat(70) + '\n');
}

async function main() {
  try {
    await createTables();
    
    console.log('🔍 Verifying tables...\n');
    
    // Verify tables exist
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    
    const tables = ['profiles', 'posts', 'likes', 'comments', 'follows'];
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(0);
      if (!error) {
        console.log(`✅ Table '${table}' is ready`);
      }
    }
    
    console.log('\n🎉 Database setup complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run: npm run db:verify');
    console.log('   2. Run: npm run dev');
    console.log('   3. Test signup at http://localhost:5173/signup\n');
    
  } catch (error: any) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();
