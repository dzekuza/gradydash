import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface EmailInviteData {
  to: string
  from: string
  inviterName: string
  environmentName: string
  inviteUrl: string
  role: string
}

export interface EmailNotificationData {
  to: string
  from: string
  subject: string
  message: string
  environmentName: string
}

export interface EmailWelcomeData {
  to: string
  from: string
  userName: string
  environmentName: string
  loginUrl: string
}

export function useEmail() {
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const sendEmail = async (type: string, data: any) => {
    setIsSending(true)
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, data }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email')
      }

      toast({
        title: 'Email Sent',
        description: 'Email has been sent successfully.',
      })

      return result
    } catch (error) {
      console.error('Error sending email:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send email',
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsSending(false)
    }
  }

  const sendInviteEmail = async (data: EmailInviteData) => {
    return sendEmail('invite', data)
  }

  const sendWelcomeEmail = async (data: EmailWelcomeData) => {
    return sendEmail('welcome', data)
  }

  const sendNotificationEmail = async (data: EmailNotificationData) => {
    return sendEmail('notification', data)
  }

  const sendProductStatusNotification = async (data: {
    to: string
    from: string
    productName: string
    oldStatus: string
    newStatus: string
    environmentName: string
    productUrl: string
  }) => {
    return sendEmail('product-status', data)
  }

  const sendNewProductNotification = async (data: {
    to: string
    from: string
    productName: string
    environmentName: string
    productUrl: string
    addedBy: string
  }) => {
    return sendEmail('new-product', data)
  }

  return {
    isSending,
    sendEmail,
    sendInviteEmail,
    sendWelcomeEmail,
    sendNotificationEmail,
    sendProductStatusNotification,
    sendNewProductNotification,
  }
}
