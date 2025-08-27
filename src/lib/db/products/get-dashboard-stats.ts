import { createClient } from '@/lib/supabase/client-server'
import { ProductStatus } from '@/types/db'

export async function getProductsByStatus(environmentId: string): Promise<Record<ProductStatus, number>> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select('status')
    .eq('environment_id', environmentId)

  if (error) {
    console.error('Error fetching products by status:', error)
    return {
      taken: 0,
      in_repair: 0,
      selling: 0,
      sold: 0,
      returned: 0,
      discarded: 0,
    }
  }

  const statusCounts = data?.reduce((acc, product) => {
    const status = product.status as ProductStatus
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<ProductStatus, number>) || {}

  return {
    taken: statusCounts.taken || 0,
    in_repair: statusCounts.in_repair || 0,
    selling: statusCounts.selling || 0,
    sold: statusCounts.sold || 0,
    returned: statusCounts.returned || 0,
    discarded: statusCounts.discarded || 0,
  }
}

export async function getRevenueLast30Days(environmentId: string): Promise<number> {
  const supabase = createClient()
  
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data, error } = await supabase
    .from('sales')
    .select('amount')
    .eq('products.environment_id', environmentId)
    .gte('sold_at', thirtyDaysAgo.toISOString())

  if (error) {
    console.error('Error fetching revenue:', error)
    return 0
  }

  return data?.reduce((sum, sale) => sum + sale.amount, 0) || 0
}

export async function getAverageTimeToSale(environmentId: string): Promise<number> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select('created_at, sold_at')
    .eq('environment_id', environmentId)
    .not('sold_at', 'is', null)

  if (error) {
    console.error('Error fetching average time to sale:', error)
    return 0
  }

  if (!data || data.length === 0) {
    return 0
  }

  const timeToSaleDays = data.map(product => {
    const created = new Date(product.created_at)
    const sold = new Date(product.sold_at!)
    const diffTime = Math.abs(sold.getTime() - created.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  })

  const average = timeToSaleDays.reduce((sum, days) => sum + days, 0) / timeToSaleDays.length
  return average
}
