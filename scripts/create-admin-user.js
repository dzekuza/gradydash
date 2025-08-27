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

async function createAdminUser() {
  try {
    console.log('Creating admin user...')
    
    // Create the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@grady.app',
      password: '7ftGiMiy.',
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        full_name: 'Grady Master Admin',
        first_name: 'Grady',
        last_name: 'Master Admin',
        company_name: 'Grady ReSellOps',
        role: 'grady_admin'
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return
    }

    console.log('✅ Auth user created successfully:', authData.user.email)

    // Update the profile with admin role
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: 'Grady Master Admin',
        updated_at: new Date().toISOString()
      })
      .eq('id', authData.user.id)
      .select()

    if (profileError) {
      console.error('Error updating profile:', profileError)
      return
    }

    console.log('✅ Profile updated successfully')

    // Create a global admin membership (without environment_id for system-wide access)
    const { data: membershipData, error: membershipError } = await supabase
      .from('memberships')
      .insert({
        user_id: authData.user.id,
        role: 'grady_admin',
        environment_id: null // null for system-wide admin access
      })
      .select()

    if (membershipError) {
      console.error('Error creating admin membership:', membershipError)
      return
    }

    console.log('✅ Admin membership created successfully')
    console.log('')
    console.log('🎉 Master Admin User Created Successfully!')
    console.log('Email: admin@grady.app')
    console.log('Password: 7ftGiMiy.')
    console.log('Role: grady_admin')
    console.log('')
    console.log('This user can:')
    console.log('- Create new environments (stores)')
    console.log('- Invite users to any environment')
    console.log('- Access all environments')
    console.log('- Manage system-wide settings')

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

createAdminUser()
