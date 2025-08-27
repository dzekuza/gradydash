const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration(migrationFile) {
  try {
    console.log(`Applying migration: ${migrationFile}`)
    
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile)
    const sql = fs.readFileSync(migrationPath, 'utf8')
    
    const { error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error(`Error applying migration ${migrationFile}:`, error)
      return false
    }
    
    console.log(`✅ Successfully applied migration: ${migrationFile}`)
    return true
  } catch (error) {
    console.error(`Error applying migration ${migrationFile}:`, error)
    return false
  }
}

async function main() {
  console.log('🚀 Applying database migrations to fix RLS policies and user profiles...')
  
  const migrations = [
    '009_fix_admin_status_check.sql',
    '010_fix_user_profile_creation.sql'
  ]
  
  let successCount = 0
  
  for (const migration of migrations) {
    const success = await applyMigration(migration)
    if (success) {
      successCount++
    }
  }
  
  console.log(`\n📊 Migration Summary:`)
  console.log(`- Total migrations: ${migrations.length}`)
  console.log(`- Successful: ${successCount}`)
  console.log(`- Failed: ${migrations.length - successCount}`)
  
  if (successCount === migrations.length) {
    console.log('\n✅ All migrations applied successfully!')
    console.log('\n🔧 The following issues have been fixed:')
    console.log('- RLS policies now allow users to view their own memberships')
    console.log('- Admin status checks no longer fail for new users')
    console.log('- User profiles are created automatically with proper fields')
    console.log('- Added helper functions for admin status checks')
    console.log('- Added indexes for better performance')
  } else {
    console.log('\n❌ Some migrations failed. Please check the errors above.')
    process.exit(1)
  }
}

main().catch(console.error)
