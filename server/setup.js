/**
 * Storia Database Setup Script
 * Run ONCE after filling in your SUPABASE_SERVICE_KEY in .env
 * Usage: node setup.js
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function setup() {
    console.log('🎙️  Storia DB Setup');
    console.log('   Connecting to:', process.env.SUPABASE_URL);
    console.log('');

    // Test connection
    const { error: connErr } = await supabase.from('_setup_test_').select('*').limit(1);
    // PGRST116 = table not found = connection works fine
    if (connErr && !connErr.message.includes('not found') && !connErr.code?.startsWith('PGRST')) {
        console.error('❌  Cannot connect to Supabase:', connErr.message);
        console.error('   Check your SUPABASE_URL and SUPABASE_SERVICE_KEY in server/.env');
        process.exit(1);
    }
    console.log('✅  Supabase connection OK');

    // Run schema SQL via rpc (requires service_role key)
    const schemaSql = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS stories (
      id TEXT PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      data JSONB NOT NULL,
      is_public BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS user_stats (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      plan TEXT DEFAULT 'free',
      monthly_used INT DEFAULT 0,
      monthly_limit INT DEFAULT 5,
      bundles_remaining INT DEFAULT 0,
      total_generated INT DEFAULT 0,
      next_reset_date TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
    CREATE INDEX IF NOT EXISTS idx_stories_public ON stories(is_public) WHERE is_public = TRUE;
  `;

    const { error: sqlErr } = await supabase.rpc('exec_sql', { sql: schemaSql });
    if (sqlErr) {
        // exec_sql RPC doesn't exist by default — fall back to checking tables directly
        console.log('ℹ️   Cannot run raw SQL via RPC (this is normal).');
        console.log('   Please run server/db/schema.sql manually in the Supabase SQL Editor.');
        console.log('   → https://supabase.com/dashboard/project/qbsoedfpjyyvqkkmshea/sql/new');
        process.exit(0);
    }

    console.log('✅  Schema created successfully!');
    console.log('');
    console.log('🚀  You\'re ready. Start the server with: npm run dev');
}

setup().catch(err => {
    console.error('Setup failed:', err.message);
    process.exit(1);
});
