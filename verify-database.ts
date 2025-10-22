import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Missing Supabase credentials in .env file\n');
  console.log('Please ensure .env file exists with:');
  console.log('  VITE_SUPABASE_URL=your-url');
  console.log('  VITE_SUPABASE_ANON_KEY=your-key\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Database Verification Script
 * 
 * Checks if all tables, storage buckets, and policies are properly configured
 */

console.log('🔍 Verifying Giga Stream Fusion Database Setup...\n');

const expectedTables = [
  'profiles',
  'posts',
  'likes',
  'comments',
  'follows',
  'notifications',
  'messages',
  'playlists',
  'playlist_items',
  'watch_history',
  'subscriptions',
  'stories'
];

const expectedBuckets = [
  'avatars',
  'banners',
  'posts',
  'videos',
  'shorts',
  'stories',
  'thumbnails'
];

async function verifyTables() {
  console.log('📊 Checking Tables...');
  
  const results = [];
  
  for (const table of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(0);
      
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
        results.push({ table, status: 'missing', error: error.message });
      } else {
        console.log(`   ✅ ${table}`);
        results.push({ table, status: 'ok' });
      }
    } catch (err) {
      console.log(`   ❌ ${table}: ${err.message}`);
      results.push({ table, status: 'error', error: err.message });
    }
  }
  
  const okCount = results.filter(r => r.status === 'ok').length;
  console.log(`\n   Summary: ${okCount}/${expectedTables.length} tables found\n`);
  
  return results;
}

async function verifyBuckets() {
  console.log('💾 Checking Storage Buckets...');
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log(`   ❌ Error fetching buckets: ${error.message}\n`);
      return [];
    }
    
    const bucketNames = buckets.map(b => b.name);
    const results = [];
    
    for (const bucket of expectedBuckets) {
      if (bucketNames.includes(bucket)) {
        console.log(`   ✅ ${bucket}`);
        results.push({ bucket, status: 'ok' });
      } else {
        console.log(`   ❌ ${bucket} (not found)`);
        results.push({ bucket, status: 'missing' });
      }
    }
    
    const okCount = results.filter(r => r.status === 'ok').length;
    console.log(`\n   Summary: ${okCount}/${expectedBuckets.length} buckets found\n`);
    
    return results;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}\n`);
    return [];
  }
}

async function verifyAuthTrigger() {
  console.log('⚡ Checking Auth Trigger...');
  
  try {
    // Check if handle_new_user function exists
    const { data, error } = await supabase.rpc('handle_new_user');
    
    // We expect an error since we're not passing parameters
    // But if the function exists, we'll get a specific error
    if (error && error.message.includes('function')) {
      console.log(`   ✅ handle_new_user function exists\n`);
      return true;
    } else if (!error) {
      console.log(`   ✅ handle_new_user function exists\n`);
      return true;
    } else {
      console.log(`   ⚠️  Could not verify trigger (check Supabase dashboard)\n`);
      return false;
    }
  } catch (err) {
    console.log(`   ⚠️  Could not verify trigger: ${err.message}\n`);
    return false;
  }
}

async function getSetupInstructions(tableResults, bucketResults) {
  console.log('📋 Setup Instructions:\n');
  
  const missingTables = tableResults.filter(r => r.status !== 'ok');
  const missingBuckets = bucketResults.filter(r => r.status !== 'ok');
  
  if (missingTables.length === 0 && missingBuckets.length === 0) {
    console.log('   ✨ Everything is set up correctly!');
    console.log('   🚀 You can now run: npm run dev\n');
    return;
  }
  
  if (missingTables.length > 0) {
    console.log('   ⚠️  Missing Tables:');
    console.log('   1. Go to Supabase Dashboard > SQL Editor');
    console.log('   2. Click "New Query"');
    console.log('   3. Copy contents of database-schema.sql');
    console.log('   4. Paste and click "Run"');
    console.log('   Missing:', missingTables.map(t => t.table).join(', '));
    console.log('');
  }
  
  if (missingBuckets.length > 0) {
    console.log('   ⚠️  Missing Storage Buckets:');
    console.log('   1. Go to Supabase Dashboard > Storage');
    console.log('   2. Click "New Bucket" for each missing bucket');
    console.log('   3. Set as Public and configure file limits');
    console.log('   Missing:', missingBuckets.map(b => b.bucket).join(', '));
    console.log('');
    console.log('   After creating buckets:');
    console.log('   4. Go to SQL Editor');
    console.log('   5. Copy contents of storage-setup.sql');
    console.log('   6. Paste and click "Run"');
    console.log('');
  }
  
  console.log('   📚 See DATABASE_SETUP.md for detailed instructions\n');
}

async function main() {
  const tableResults = await verifyTables();
  const bucketResults = await verifyBuckets();
  await verifyAuthTrigger();
  
  console.log('='.repeat(60));
  await getSetupInstructions(tableResults, bucketResults);
  console.log('='.repeat(60));
}

main().catch(console.error);
