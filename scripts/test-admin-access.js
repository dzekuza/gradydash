const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAdminAccess() {
  try {
    console.log('🧪 Testing Admin Access to Dashboard...')
    console.log('')
    
    // Test 1: Authenticate as admin user
    console.log('1. Authenticating as admin user...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@grady.app',
      password: '7ftGiMiy.'
    })
    
    if (authError) {
      console.error('❌ Authentication failed:', authError.message)
      return
    }
    
    if (!authData.user) {
      console.error('❌ No user data returned from authentication')
      return
    }
    
    console.log('✅ Authentication successful:')
    console.log('   User ID:', authData.user.id)
    console.log('   Email:', authData.user.email)
    console.log('')
    
    // Test 2: Check admin membership with service role key
    console.log('2. Checking admin membership with service role...')
    const { data: memberships, error: membershipError } = await supabase
      .from('memberships')
      .select('role, environment_id')
      .eq('user_id', authData.user.id)
      .is('environment_id', null)
    
    if (membershipError) {
      console.error('❌ Error fetching memberships with service role:', membershipError)
      return
    }
    
    const adminMembership = memberships.find(m => 
      ['admin', 'grady_staff'].includes(m.role) && m.environment_id === null
    )
    
    if (!adminMembership) {
      console.error('❌ Admin membership not found with service role!')
      return
    }
    
    console.log('✅ Admin membership found with service role:')
    console.log('   Role:', adminMembership.role)
    console.log('   Environment ID:', adminMembership.environment_id)
    console.log('')
    
    // Test 3: Check admin membership with anon key (simulating web app)
    console.log('3. Checking admin membership with anon key (web app simulation)...')
    const anonSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    // Set the auth token for the anon client
    const { data: { session } } = await anonSupabase.auth.getSession()
    if (session) {
      anonSupabase.auth.setSession(session)
    }
    
    const { data: anonMemberships, error: anonMembershipError } = await anonSupabase
      .from('memberships')
      .select('role, environment_id')
      .eq('user_id', authData.user.id)
      .is('environment_id', null)
    
    if (anonMembershipError) {
      console.error('❌ Error fetching memberships with anon key:', anonMembershipError)
      console.log('   This might be the source of the "permission denied" error')
      return
    }
    
    const anonAdminMembership = anonMemberships.find(m => 
      ['admin', 'grady_staff'].includes(m.role) && m.environment_id === null
    )
    
    if (!anonAdminMembership) {
      console.error('❌ Admin membership not found with anon key!')
      console.log('   This explains why the admin user is being redirected to dashboard')
      return
    }
    
    console.log('✅ Admin membership found with anon key:')
    console.log('   Role:', anonAdminMembership.role)
    console.log('   Environment ID:', anonAdminMembership.environment_id)
    console.log('')
    
    // Test 4: Check profiles table access
    console.log('4. Checking profiles table access...')
    const { data: profile, error: profileError } = await anonSupabase
      .from('profiles')
      .select('id, email')
      .eq('id', authData.user.id)
      .single()
    
    if (profileError) {
      console.error('❌ Error accessing profiles table:', profileError)
      console.log('   This might be related to the "permission denied for table users" error')
      return
    }
    
    console.log('✅ Profiles table access successful:')
    console.log('   Profile ID:', profile.id)
    console.log('   Email:', profile.email)
    console.log('')
    
    console.log('🎉 Admin Access Test Complete!')
    console.log('')
    console.log('📋 Test Results:')
    console.log('   ✅ Authentication works')
    console.log('   ✅ Admin membership accessible with service role')
    console.log('   ✅ Admin membership accessible with anon key')
    console.log('   ✅ Profiles table accessible')
    console.log('')
    console.log('🔗 Admin user should be able to access:')
    console.log('   http://localhost:3000/admin')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testAdminAccess()
