import { createClient } from '@/lib/supabase/client-server'
import { ProductStatus } from '@/types/db'
import { getDemoEnvironmentId } from '@/lib/db/environments/get-demo-environment'

export async function getProductsByStatus(environmentId: string): Promise<Record<ProductStatus, number>> {
  const supabase = createClient()
  
  try {
    // Handle demo environment
    const actualEnvironmentId = environmentId === 'demo-env' || environmentId === 'temp-id'
      ? await getDemoEnvironmentId() 
      : environmentId

    const { data, error } = await supabase
      .from('products')
      .select('status')
      .eq('environment_id', actualEnvironmentId)

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
  } catch (error) {
    console.error('Unexpected error in getProductsByStatus:', error)
    return {
      taken: 0,
      in_repair: 0,
      selling: 0,
      sold: 0,
      returned: 0,
      discarded: 0,
    }
  }
}

export async function getRevenueLast30Days(environmentId: string): Promise<number> {
  const supabase = createClient()
  
  try {
    // Handle demo environment
    const actualEnvironmentId = environmentId === 'demo-env' || environmentId === 'temp-id'
      ? await getDemoEnvironmentId() 
      : environmentId

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data, error } = await supabase
      .from('sales')
      .select(`
        sale_price,
        product_id,
        products!inner(environment_id)
      `)
      .eq('products.environment_id', actualEnvironmentId)
      .gte('sale_date', thirtyDaysAgo.toISOString())

    if (error) {
      console.error('Error fetching revenue:', error)
      return 0
    }

    return data?.reduce((sum, sale) => sum + Number(sale.sale_price), 0) || 0
  } catch (error) {
    console.error('Unexpected error in getRevenueLast30Days:', error)
    return 0
  }
}

export async function getAverageTimeToSale(environmentId: string): Promise<number> {
  const supabase = createClient()
  
  try {
    // Handle demo environment
    const actualEnvironmentId = environmentId === 'demo-env' || environmentId === 'temp-id'
      ? await getDemoEnvironmentId() 
      : environmentId

    // First get all products in the environment with their creation dates
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, created_at')
      .eq('environment_id', actualEnvironmentId)

    if (productsError) {
      console.error('Error fetching products:', productsError)
      return 0
    }

    if (!products || products.length === 0) {
      return 0
    }

    // Then get sales for these products
    const productIds = products.map(p => p.id)
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('product_id, sale_date')
      .in('product_id', productIds)

    if (salesError) {
      console.error('Error fetching sales:', salesError)
      return 0
    }

    if (!sales || sales.length === 0) {
      return 0
    }

    // Group sales by product_id and find the earliest sale_date for each product
    const earliestSalesByProduct = sales.reduce((acc, sale) => {
      const existing = acc.get(sale.product_id)
      if (!existing || new Date(sale.sale_date) < new Date(existing.sale_date)) {
        acc.set(sale.product_id, sale)
      }
      return acc
    }, new Map<string, typeof sales[0]>())

    // Calculate time to sale for each product with at least one sale
    const timeToSaleDays: number[] = []
    const negativeDurations: Array<{ productId: string, created: Date, sold: Date, duration: number }> = []

    earliestSalesByProduct.forEach((sale, productId) => {
      const product = products.find(p => p.id === productId)
      if (!product) return

      const created = new Date(product.created_at)
      const sold = new Date(sale.sale_date)
      const diffTime = sold.getTime() - created.getTime()
      const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (durationDays < 0) {
        // Log negative durations for investigation
        negativeDurations.push({
          productId,
          created,
          sold,
          duration: durationDays
        })
        console.warn(`Negative time-to-sale detected for product ${productId}:`, {
          created: created.toISOString(),
          sold: sold.toISOString(),
          durationDays
        })
        // Skip negative durations from the average calculation
        return
      }

      timeToSaleDays.push(durationDays)
    })

    if (timeToSaleDays.length === 0) {
      return 0
    }

    const average = timeToSaleDays.reduce((sum, days) => sum + days, 0) / timeToSaleDays.length
    return average
  } catch (error) {
    console.error('Unexpected error in getAverageTimeToSale:', error)
    return 0
  }
}
