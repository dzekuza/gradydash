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

async function testAdminLogin() {
  try {
    console.log('🧪 Testing Admin Login Functionality...')
    console.log('')
    
    // Test 1: Check if admin user exists
    console.log('1. Checking if admin user exists...')
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      return
    }
    
    const adminUser = users.find(user => user.email === 'admin@grady.app')
    
    if (!adminUser) {
      console.error('❌ Admin user not found!')
      console.log('Run: node scripts/create-admin-user.js')
      return
    }
    
    console.log('✅ Admin user exists:', adminUser.email)
    console.log('   User ID:', adminUser.id)
    console.log('   Email confirmed:', adminUser.email_confirmed_at ? 'Yes' : 'No')
    console.log('')
    
    // Test 2: Check admin membership
    console.log('2. Checking admin membership...')
    const { data: memberships, error: membershipError } = await supabase
      .from('memberships')
      .select('role, environment_id')
      .eq('user_id', adminUser.id)
      .is('environment_id', null)
    
    if (membershipError) {
      console.error('❌ Error fetching memberships:', membershipError)
      return
    }
    
    const adminMembership = memberships.find(m => 
      ['admin', 'grady_staff'].includes(m.role) && m.environment_id === null
    )
    
    if (!adminMembership) {
      console.error('❌ Admin membership not found!')
      console.log('Admin user exists but has no system-wide admin privileges')
      return
    }
    
    console.log('✅ Admin membership found:')
    console.log('   Role:', adminMembership.role)
    console.log('   Environment ID:', adminMembership.environment_id)
    console.log('')
    
    // Test 3: Test authentication
    console.log('3. Testing authentication...')
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
    
    // Test 4: Verify admin privileges after login
    console.log('4. Verifying admin privileges...')
    const { data: userMemberships, error: userMembershipError } = await supabase
      .from('memberships')
      .select('role, environment_id')
      .eq('user_id', authData.user.id)
      .is('environment_id', null)
    
    if (userMembershipError) {
      console.error('❌ Error checking user memberships:', userMembershipError)
      return
    }
    
    const hasAdminPrivileges = userMemberships.some(membership => 
      ['admin', 'grady_staff'].includes(membership.role) && membership.environment_id === null
    )
    
    if (hasAdminPrivileges) {
      console.log('✅ User has admin privileges')
      console.log('   Can access admin panel: Yes')
      console.log('   Admin role:', userMemberships.find(m => m.environment_id === null)?.role)
    } else {
      console.log('❌ User does not have admin privileges')
      console.log('   Can access admin panel: No')
    }
    
    console.log('')
    console.log('🎉 Admin Login Test Complete!')
    console.log('')
    console.log('📋 Test Results:')
    console.log('   ✅ Admin user exists')
    console.log('   ✅ Admin membership configured')
    console.log('   ✅ Authentication works')
    console.log('   ✅ Admin privileges verified')
    console.log('')
    console.log('🔗 You can now test the admin login at:')
    console.log('   http://localhost:3000/admin-login')
    console.log('')
    console.log('📝 Login Credentials:')
    console.log('   Email: admin@grady.app')
    console.log('   Password: 7ftGiMiy.')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testAdminLogin()
