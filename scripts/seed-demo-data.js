require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedDemoData() {
  try {
    console.log('🌱 Seeding demo data...')

    // Create demo environment
    const { data: demoEnv, error: envError } = await supabase
      .from('environments')
      .insert({
        name: 'Demo Environment',
        slug: 'demo',
        description: 'Demo environment for testing',
        created_by: null // Will be set by RLS
      })
      .select()
      .single()

    if (envError) {
      console.error('Error creating demo environment:', envError)
      return
    }

    console.log('✅ Demo environment created:', demoEnv.name)

    // Create demo locations
    const { data: locations, error: locationsError } = await supabase
      .from('locations')
      .insert([
        {
          environment_id: demoEnv.id,
          name: 'Warehouse A',
          description: 'Main warehouse location',
          address: '123 Warehouse St, Demo City'
        },
        {
          environment_id: demoEnv.id,
          name: 'Repair Center',
          description: 'Product repair and refurbishment center',
          address: '456 Repair Ave, Demo City'
        },
        {
          environment_id: demoEnv.id,
          name: 'Store Front',
          description: 'Retail store location',
          address: '789 Store Blvd, Demo City'
        }
      ])
      .select()

    if (locationsError) {
      console.error('Error creating locations:', locationsError)
      return
    }

    console.log('✅ Demo locations created:', locations.length)

    // Create demo products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .insert([
        {
          environment_id: demoEnv.id,
          title: 'iPhone 13 Pro',
          sku: 'IP13P-001',
          barcode: '1234567890123',
          description: 'Apple iPhone 13 Pro 128GB',
          status: 'taken',
          location_id: locations[0].id,
          purchase_price: 450.00,
          selling_price: 699.00
        },
        {
          environment_id: demoEnv.id,
          title: 'MacBook Air M1',
          sku: 'MBA-M1-001',
          barcode: '1234567890124',
          description: 'Apple MacBook Air with M1 chip',
          status: 'in_repair',
          location_id: locations[1].id,
          purchase_price: 600.00,
          selling_price: 899.00
        },
        {
          environment_id: demoEnv.id,
          title: 'iPad Pro 12.9"',
          sku: 'IPP-12-001',
          barcode: '1234567890125',
          description: 'Apple iPad Pro 12.9" 256GB',
          status: 'selling',
          location_id: locations[2].id,
          purchase_price: 350.00,
          selling_price: 599.00
        },
        {
          environment_id: demoEnv.id,
          title: 'AirPods Pro',
          sku: 'APP-001',
          barcode: '1234567890126',
          description: 'Apple AirPods Pro with noise cancellation',
          status: 'sold',
          location_id: locations[2].id,
          purchase_price: 150.00,
          selling_price: 249.00,
          sold_price: 249.00,
          sold_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
        },
        {
          environment_id: demoEnv.id,
          title: 'Apple Watch Series 7',
          sku: 'AWS7-001',
          barcode: '1234567890127',
          description: 'Apple Watch Series 7 45mm',
          status: 'sold',
          location_id: locations[2].id,
          purchase_price: 200.00,
          selling_price: 399.00,
          sold_price: 399.00,
          sold_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
        },
        {
          environment_id: demoEnv.id,
          title: 'Broken iPhone 12',
          sku: 'IP12-BROKEN-001',
          barcode: '1234567890128',
          description: 'iPhone 12 with broken screen',
          status: 'discarded',
          location_id: locations[1].id,
          purchase_price: 100.00,
          selling_price: 0.00
        }
      ])
      .select()

    if (productsError) {
      console.error('Error creating products:', productsError)
      return
    }

    console.log('✅ Demo products created:', products.length)

    // Create sales records for sold products
    const soldProducts = products.filter(p => p.status === 'sold')
    if (soldProducts.length > 0) {
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .insert(
          soldProducts.map(product => ({
            product_id: product.id,
            amount: product.sold_price,
            currency: 'EUR',
            sold_by: null // Will be set by RLS
          }))
        )
        .select()

      if (salesError) {
        console.error('Error creating sales:', salesError)
      } else {
        console.log('✅ Sales records created:', sales.length)
      }
    }

    console.log('🎉 Demo data seeding completed successfully!')
    console.log('📊 You can now visit /demo to see the real data in action')

  } catch (error) {
    console.error('❌ Error seeding demo data:', error)
  }
}

seedDemoData()
