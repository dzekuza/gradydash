import { createClient } from '@/lib/supabase/client-server'
import { getOrCreateDemoEnvironment } from './environments/get-demo-environment'
import { ProductStatus } from '@/types/db'

export async function seedDemoData() {
  const supabase = createClient()
  
  try {
    // Get or create demo environment
    const demoEnv = await getOrCreateDemoEnvironment()
    
    // Create some demo locations
    const { data: locations, error: locationsError } = await supabase
      .from('locations')
      .insert([
        {
          environment_id: demoEnv.id,
          name: 'Main Warehouse',
          description: 'Primary storage location',
          address: '123 Main St, Demo City'
        },
        {
          environment_id: demoEnv.id,
          name: 'Repair Center',
          description: 'Product repair and maintenance',
          address: '456 Repair Ave, Demo City'
        },
        {
          environment_id: demoEnv.id,
          name: 'Showroom',
          description: 'Customer display area',
          address: '789 Show St, Demo City'
        }
      ])
      .select()

    if (locationsError) {
      console.error('Error creating demo locations:', locationsError)
      return
    }

    const locationIds = locations?.map(l => l.id) || []

    // Create demo products with various statuses
    const demoProducts = [
      {
        environment_id: demoEnv.id,
        title: 'iPhone 13 Pro',
        sku: 'IP13P-001',
        barcode: '1234567890123',
        description: 'Apple iPhone 13 Pro 128GB',
        status: 'taken' as ProductStatus,
        location_id: locationIds[0],
        purchase_price: 800.00,
        selling_price: 1200.00
      },
      {
        environment_id: demoEnv.id,
        title: 'Samsung Galaxy S21',
        sku: 'SGS21-002',
        barcode: '1234567890124',
        description: 'Samsung Galaxy S21 128GB',
        status: 'in_repair' as ProductStatus,
        location_id: locationIds[1],
        purchase_price: 600.00,
        selling_price: 900.00
      },
      {
        environment_id: demoEnv.id,
        title: 'MacBook Air M1',
        sku: 'MBA-M1-003',
        barcode: '1234567890125',
        description: 'Apple MacBook Air M1 256GB',
        status: 'selling' as ProductStatus,
        location_id: locationIds[2],
        purchase_price: 900.00,
        selling_price: 1400.00
      },
      {
        environment_id: demoEnv.id,
        title: 'iPad Pro 12.9',
        sku: 'IPP12-004',
        barcode: '1234567890126',
        description: 'Apple iPad Pro 12.9" 256GB',
        status: 'sold' as ProductStatus,
        location_id: locationIds[2],
        purchase_price: 700.00,
        selling_price: 1100.00
      },
      {
        environment_id: demoEnv.id,
        title: 'Dell XPS 13',
        sku: 'DX13-005',
        barcode: '1234567890127',
        description: 'Dell XPS 13 512GB SSD',
        status: 'returned' as ProductStatus,
        location_id: locationIds[0],
        purchase_price: 800.00,
        selling_price: 1200.00
      },
      {
        environment_id: demoEnv.id,
        title: 'Broken Laptop',
        sku: 'BL-006',
        barcode: '1234567890128',
        description: 'Damaged laptop beyond repair',
        status: 'discarded' as ProductStatus,
        location_id: locationIds[1],
        purchase_price: 200.00,
        selling_price: 0.00
      }
    ]

    const { data: products, error: productsError } = await supabase
      .from('products')
      .insert(demoProducts)
      .select()

    if (productsError) {
      console.error('Error creating demo products:', productsError)
      return
    }

    // Create some demo sales
    const soldProducts = products?.filter(p => p.status === 'sold') || []
    
    if (soldProducts.length > 0) {
      const { error: salesError } = await supabase
        .from('sales')
        .insert([
          {
            product_id: soldProducts[0].id,
            sale_price: soldProducts[0].selling_price || 1100.00,
            sale_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
          }
        ])

      if (salesError) {
        console.error('Error creating demo sales:', salesError)
      }
    }

    console.log('Demo data seeded successfully!')
  } catch (error) {
    console.error('Error seeding demo data:', error)
  }
}
