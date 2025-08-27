'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createProductSchema } from '@/lib/utils/zod-schemas/product'
import { getDemoEnvironmentId } from '@/lib/db/environments/get-demo-environment'

export async function createProduct(formData: FormData) {
  const supabase = createClient()
  let redirectTo: string | undefined
  
  try {
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('User authentication error:', userError)
      throw new Error('Authentication error: ' + userError.message)
    }
    
    if (!user) {
      throw new Error('Authentication required')
    }

    // Parse categories from form data
    const categoriesJson = formData.get('categories') as string
    let categories: string[] | undefined
    
    if (categoriesJson) {
      try {
        categories = JSON.parse(categoriesJson)
      } catch (error) {
        console.warn('Failed to parse categories JSON:', error)
        categories = undefined
      }
    }

    // Parse and validate form data
    const rawData = {
      title: formData.get('title') as string,
      sku: formData.get('sku') as string,
      barcode: formData.get('barcode') as string,
      description: formData.get('description') as string,
      status: formData.get('status') as string,
      location_id: formData.get('location_id') as string,
      purchase_price: formData.get('purchase_price') ? parseFloat(formData.get('purchase_price') as string) : undefined,
      selling_price: formData.get('selling_price') ? parseFloat(formData.get('selling_price') as string) : undefined,
      categories,
    }

    // Validate the data
    const validatedData = createProductSchema.parse(rawData)

    // Get environment ID from form or use demo
    const environmentId = formData.get('environment_id') as string || 'demo'
    const actualEnvironmentId = environmentId === 'demo' 
      ? await getDemoEnvironmentId() 
      : environmentId

    // Compute environment slug for routing
    const environmentSlug = formData.get('environment_slug') as string || 
      (environmentId === 'demo' ? 'demo' : environmentId)

    // Build base path dynamically
    const basePath = `/${environmentSlug}`

    console.log('Creating product with:', { ...validatedData, environmentId: actualEnvironmentId })

    // Create the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        ...validatedData,
        environment_id: actualEnvironmentId
      })
      .select()
      .single()

    if (productError) {
      console.error('Error creating product:', productError)
      throw new Error('Failed to create product: ' + productError.message)
    }

    if (!product) {
      throw new Error('Product was not created')
    }

    console.log('Product created successfully:', product.id)

    // Set redirect path
    redirectTo = `${basePath}/products/${product.id}`

    // Revalidate the products page and base path
    revalidatePath(`${basePath}/products`)
    revalidatePath(basePath)

  } catch (error) {
    console.error('Error in createProduct:', error)
    
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    
    throw new Error('An unexpected error occurred while creating the product')
  }

  // Redirect outside of try/catch to avoid swallowing Next.js redirect error
  if (redirectTo) {
    redirect(redirectTo)
  }
}
