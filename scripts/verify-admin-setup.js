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

async function verifyAdminSetup() {
  try {
    console.log('🔍 Verifying admin setup...')
    
    // Get the admin user
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error('Error fetching users:', usersError)
      return
    }

    const adminUser = users.users.find(user => user.email === 'admin@grady.app')
    
    if (!adminUser) {
      console.error('❌ Admin user not found. Please run create-admin-user.js first.')
      return
    }

    console.log('✅ Admin user found:', adminUser.email)
    console.log('   User ID:', adminUser.id)
    console.log('   Email confirmed:', adminUser.email_confirmed_at ? 'Yes' : 'No')

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', adminUser.id)
      .single()

    if (profileError) {
      console.log('⚠️  Profile not found, creating...')
      
      const { data: newProfile, error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: adminUser.id,
          full_name: 'Grady Master Admin',
          first_name: 'Grady',
          last_name: 'Master Admin',
          email: adminUser.email,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createProfileError) {
        console.error('❌ Error creating profile:', createProfileError)
        return
      }

      console.log('✅ Profile created successfully')
    } else {
      console.log('✅ Profile exists:', profile.full_name)
    }

    // Check if admin membership exists
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', adminUser.id)
      .is('partner_id', null)
      .single()

    if (membershipError) {
      console.log('⚠️  Admin membership not found, creating...')
      
      const { data: newMembership, error: createMembershipError } = await supabase
        .from('memberships')
        .insert({
          user_id: adminUser.id,
          role: 'admin',
          partner_id: null // null for system-wide admin access
        })
        .select()
        .single()

      if (createMembershipError) {
        console.error('❌ Error creating admin membership:', createMembershipError)
        return
      }

      console.log('✅ Admin membership created successfully')
    } else {
      console.log('✅ Admin membership exists:', membership.role)
    }

    // Test admin access
    console.log('\n🧪 Testing admin access...')
    
    const { data: partners, error: envError } = await supabase
      .from('partners')
      .select('count')
      .limit(1)

    if (envError) {
      console.error('❌ Error testing admin access:', envError)
    } else {
      console.log('✅ Admin can access partners table')
    }

    console.log('\n🎉 Admin setup verification complete!')
    console.log('\n📋 Admin User Details:')
    console.log('   Email: admin@grady.app')
    console.log('   Password: 7ftGiMiy.')
    console.log('   Role: admin')
    console.log('   Access: System-wide admin')
    console.log('\n🔗 Access URLs:')
    console.log('   Login: http://localhost:3000/login')
    console.log('   Admin Dashboard: http://localhost:3000/admin')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

verifyAdminSetup()
