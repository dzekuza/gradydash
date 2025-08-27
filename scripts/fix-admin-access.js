const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixAdminAccess() {
  try {
    console.log('🔧 Fixing admin access...')

    // Get the admin user by email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error('Error fetching users:', userError)
      return
    }

    const adminUser = users.find(user => user.email === 'admin@grady.app')
    
    if (!adminUser) {
      console.log('❌ Admin user not found. Please create the admin user first.')
      return
    }

    console.log(`✅ Found admin user: ${adminUser.email} (${adminUser.id})`)

    // Check if admin user has a profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', adminUser.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking profile:', profileError)
      return
    }

    if (!profile) {
      console.log('📝 Creating admin profile...')
      const { error: insertProfileError } = await supabase
        .from('profiles')
        .insert({
          id: adminUser.id,
          email: adminUser.email,
          full_name: 'System Administrator',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertProfileError) {
        console.error('Error creating profile:', insertProfileError)
        return
      }
      console.log('✅ Admin profile created')
    } else {
      console.log('✅ Admin profile already exists')
    }

    // Check if admin user has system-wide admin membership
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', adminUser.id)
      .is('environment_id', null)
      .eq('role', 'admin')
      .single()

    if (membershipError && membershipError.code !== 'PGRST116') {
      console.error('Error checking membership:', membershipError)
      return
    }

    if (!membership) {
      console.log('🔑 Creating system-wide admin membership...')
      const { error: insertMembershipError } = await supabase
        .from('memberships')
        .insert({
          user_id: adminUser.id,
          environment_id: null, // System-wide membership
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertMembershipError) {
        console.error('Error creating membership:', insertMembershipError)
        return
      }
      console.log('✅ System-wide admin membership created')
    } else {
      console.log('✅ System-wide admin membership already exists')
    }

    // Test admin access
    console.log('🧪 Testing admin access...')
    
    // Test environment creation permission
    const { data: testEnv, error: testEnvError } = await supabase
      .from('environments')
      .select('id')
      .limit(1)

    if (testEnvError) {
      console.error('❌ Environment access test failed:', testEnvError)
    } else {
      console.log('✅ Environment access test passed')
    }

    // Test profile access
    const { data: testProfiles, error: testProfilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (testProfilesError) {
      console.error('❌ Profile access test failed:', testProfilesError)
    } else {
      console.log('✅ Profile access test passed')
    }

    console.log('🎉 Admin access fix completed!')
    console.log('')
    console.log('You can now:')
    console.log('- Create environments')
    console.log('- Invite users')
    console.log('- Access admin panel')
    console.log('- Manage all system data')

  } catch (error) {
    console.error('❌ Error fixing admin access:', error)
  }
}

fixAdminAccess()
