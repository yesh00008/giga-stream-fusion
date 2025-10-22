import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createRemainingBuckets() {
  console.log('Creating remaining storage buckets...\n');

  const buckets = [
    { name: 'posts', public: true },
    { name: 'videos', public: true },
    { name: 'shorts', public: true },
  ];

  for (const bucket of buckets) {
    const { data, error } = await supabase.storage.createBucket(bucket.name, {
      public: bucket.public,
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`✅ ${bucket.name}: Already exists`);
      } else {
        console.log(`❌ ${bucket.name}: ${error.message}`);
      }
    } else {
      console.log(`✅ ${bucket.name}: Created successfully`);
    }
  }
  
  console.log('\n✅ All storage buckets created!');
}

createRemainingBuckets();
