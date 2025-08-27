const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function applyAdminFix() {
  try {
    console.log('🔧 Applying admin environment creation fix...')

    // Drop the restrictive admin creation policy
    console.log('1. Dropping restrictive admin creation policy...')
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'DROP POLICY IF EXISTS "Admins can create environments" ON ENVIRONMENTS;'
    })

    if (dropError) {
      console.error('❌ Error dropping policy:', dropError)
      return
    }
    console.log('✅ Dropped restrictive admin creation policy')

    // Create a more permissive policy
    console.log('2. Creating permissive environment creation policy...')
    const { error: createPolicyError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Authenticated users can create environments" ON ENVIRONMENTS
        FOR INSERT
        TO AUTHENTICATED
        WITH CHECK (
          AUTH.UID() IS NOT NULL
        );
      `
    })

    if (createPolicyError) {
      console.error('❌ Error creating policy:', createPolicyError)
      return
    }
    console.log('✅ Created permissive environment creation policy')

    // Add membership creation policies
    console.log('3. Adding membership creation policies...')
    const { error: membershipError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Users can create their own memberships" ON MEMBERSHIPS;
        
        CREATE POLICY "Users can create their own memberships" ON MEMBERSHIPS
        FOR INSERT
        TO AUTHENTICATED
        WITH CHECK (
          USER_ID = AUTH.UID()
        );
        
        CREATE POLICY "Admins can create any membership" ON MEMBERSHIPS
        FOR INSERT
        TO AUTHENTICATED
        WITH CHECK (
          EXISTS (
            SELECT 1
            FROM MEMBERSHIPS M
            WHERE M.USER_ID = AUTH.UID()
              AND M.ROLE IN ('admin', 'grady_staff')
              AND M.ENVIRONMENT_ID IS NULL
          )
        );
      `
    })

    if (membershipError) {
      console.error('❌ Error creating membership policies:', membershipError)
      return
    }
    console.log('✅ Created membership creation policies')

    console.log('🎉 Admin environment creation fix applied successfully!')
    console.log('')
    console.log('You should now be able to:')
    console.log('- Create environments from the admin panel')
    console.log('- Create memberships for new environments')
    console.log('- Access all admin functionality')

  } catch (error) {
    console.error('❌ Error applying admin fix:', error)
  }
}

applyAdminFix()
