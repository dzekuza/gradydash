import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email/email-service'

// Force dynamic rendering and use Edge Runtime
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text, type, data } = await request.json()

    if (!to || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: to and subject' },
        { status: 400 }
      )
    }

    let result

    if (type && data) {
      // Use the EmailService class methods
      switch (type) {
        case 'invite':
          result = await EmailService.sendInviteEmail({
            to,
            from: process.env.EMAIL_FROM_ADDRESS || 'noreply@eventably.com',
            ...data
          })
          break
        case 'welcome':
          result = await EmailService.sendWelcomeEmail({
            to,
            from: process.env.EMAIL_FROM_ADDRESS || 'noreply@eventably.com',
            ...data
          })
          break
        case 'notification':
          result = await EmailService.sendNotificationEmail({
            to,
            from: process.env.EMAIL_FROM_ADDRESS || 'noreply@eventably.com',
            subject,
            ...data
          })
          break
        case 'product-status':
          result = await EmailService.sendProductStatusNotification({
            to,
            from: process.env.EMAIL_FROM_ADDRESS || 'noreply@eventably.com',
            ...data
          })
          break
        case 'new-product':
          result = await EmailService.sendNewProductNotification({
            to,
            from: process.env.EMAIL_FROM_ADDRESS || 'noreply@eventably.com',
            ...data
          })
          break
        default:
          return NextResponse.json(
            { error: 'Invalid email type' },
            { status: 400 }
          )
      }
    } else if (html || text) {
      // Simple email sending using fetch
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM_ADDRESS || 'noreply@eventably.com',
          to: [to],
          subject,
          html,
          text
        })
      })

      const emailResult = await response.json()

      if (!response.ok) {
        throw new Error(emailResult.message || 'Failed to send email')
      }

      result = emailResult
    } else {
      return NextResponse.json(
        { error: 'Missing email content: either type/data or html/text' },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      messageId: result?.id || 'sent',
      data: result 
    })
  } catch (error) {
    console.error('Error in email send API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
