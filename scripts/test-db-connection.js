const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (profilesError) {
      console.error('❌ Error connecting to profiles table:', profilesError)
      return
    }
    
    console.log('✅ Successfully connected to profiles table')
    
    // Test products table
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('count')
      .limit(1)
    
    if (productsError) {
      console.error('❌ Error connecting to products table:', productsError)
      return
    }
    
    console.log('✅ Successfully connected to products table')
    
    // Test sales table
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('count')
      .limit(1)
    
    if (salesError) {
      console.error('❌ Error connecting to sales table:', salesError)
      return
    }
    
    console.log('✅ Successfully connected to sales table')
    
    // Test memberships table
    const { data: memberships, error: membershipsError } = await supabase
      .from('memberships')
      .select('count')
      .limit(1)
    
    if (membershipsError) {
      console.error('❌ Error connecting to memberships table:', membershipsError)
      return
    }
    
    console.log('✅ Successfully connected to memberships table')
    
    console.log('')
    console.log('🎉 All database connections successful!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Apply the migration: supabase/migrations/002_add_system_admin_support.sql')
    console.log('2. Run: npm run create-admin')
    console.log('3. Test login with: admin@grady.app / 7ftGiMiy.')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testConnection()
