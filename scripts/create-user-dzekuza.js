const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createUser() {
  try {
    console.log('Creating user: dzekuza@gmail.com')
    
    // Create the user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'dzekuza@gmail.com',
      password: '7ftGiMiy.',
      email_confirm: true,
      user_metadata: {
        full_name: 'Dzekuza User'
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return
    }

    console.log('Auth user created:', authData.user.id)

    // Create profile in profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: 'dzekuza@gmail.com',
        full_name: 'Dzekuza User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (profileError) {
      console.error('Error creating profile:', profileError)
      return
    }

    console.log('Profile created:', profileData)

    // Add user to an environment (you can modify this as needed)
    // First, get the first available environment
    const { data: environments, error: envError } = await supabase
      .from('environments')
      .select('id')
      .limit(1)

    if (envError) {
      console.error('Error fetching environments:', envError)
      return
    }

    if (environments && environments.length > 0) {
      const { data: membershipData, error: membershipError } = await supabase
        .from('memberships')
        .insert({
          user_id: authData.user.id,
          environment_id: environments[0].id,
          role: 'reseller_staff',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (membershipError) {
        console.error('Error creating membership:', membershipError)
        return
      }

      console.log('Membership created:', membershipData)
    }

    console.log('✅ User dzekuza@gmail.com created successfully!')
    console.log('User ID:', authData.user.id)
    console.log('Email:', authData.user.email)
    console.log('Password: 7ftGiMiy.')
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

createUser()
