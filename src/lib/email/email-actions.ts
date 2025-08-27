'use server'

import { EmailService } from './email-service'
import { revalidatePath } from 'next/cache'

export async function sendInviteEmailAction(data: {
  to: string
  from: string
  inviterName: string
  environmentName: string
  inviteUrl: string
  role: string
}) {
  try {
    const result = await EmailService.sendInviteEmail(data)
    revalidatePath('/members')
    return { success: true, data: result }
  } catch (error) {
    console.error('Error sending invite email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' }
  }
}

export async function sendWelcomeEmailAction(data: {
  to: string
  from: string
  userName: string
  environmentName: string
  loginUrl: string
}) {
  try {
    const result = await EmailService.sendWelcomeEmail(data)
    return { success: true, data: result }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' }
  }
}

export async function sendNotificationEmailAction(data: {
  to: string
  from: string
  subject: string
  message: string
  environmentName: string
}) {
  try {
    const result = await EmailService.sendNotificationEmail(data)
    return { success: true, data: result }
  } catch (error) {
    console.error('Error sending notification email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' }
  }
}

export async function sendProductStatusNotificationAction(data: {
  to: string
  from: string
  productName: string
  oldStatus: string
  newStatus: string
  environmentName: string
  productUrl: string
}) {
  try {
    const result = await EmailService.sendProductStatusNotification(data)
    revalidatePath('/products')
    return { success: true, data: result }
  } catch (error) {
    console.error('Error sending product status notification:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' }
  }
}

export async function sendNewProductNotificationAction(data: {
  to: string
  from: string
  productName: string
  environmentName: string
  productUrl: string
  addedBy: string
}) {
  try {
    const result = await EmailService.sendNewProductNotification(data)
    revalidatePath('/products')
    return { success: true, data: result }
  } catch (error) {
    console.error('Error sending new product notification:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' }
  }
}
