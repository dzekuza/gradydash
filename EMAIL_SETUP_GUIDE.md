# Email Setup Guide

## Current Status

The invitation system is working, but emails are not being sent because the
email configuration is not set up.

## Quick Fix for Development

### Option 1: Use Resend (Recommended for Production)

1. **Sign up for Resend** (https://resend.com)
2. **Get your API key** from the Resend dashboard
3. **Update your `.env.local` file**:

```bash
# Email Configuration (Resend)
RESEND_API_KEY=re_your_actual_api_key_here
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
DEBUG_EMAILS=false
```

### Option 2: Development Mode (No Email Setup Required)

The application now has improved error handling. When you send an invitation:

1. **The invitation is still created** in the database
2. **The invitation URL is logged** to the console
3. **You can manually share the URL** with the invited user

## How to Test Invitations

### Method 1: Check Console Logs

When you send an invitation, check the terminal/console for:

```
📧 Email would have been sent:
   To: user@example.com
   Subject: You're invited to join Environment Name
   From: noreply@yourdomain.com
   URL in email: http://localhost:3000/invite/[invite-id]
```

### Method 2: Direct URL Access

1. Send an invitation to any email
2. Copy the invitation URL from the console
3. Open the URL in a browser
4. Complete the registration process

### Method 3: Database Check

1. Check the `environment_invites` table in Supabase
2. Find the invitation record
3. Use the `token` field to construct the URL: `/invite/[invite-id]`

## Production Setup

### 1. Domain Verification

- Add your domain to Resend
- Verify domain ownership
- Set up SPF/DKIM records

### 2. Environment Variables

```bash
RESEND_API_KEY=re_your_production_api_key
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3. Test Email Sending

- Send a test invitation
- Check that emails are delivered
- Verify invitation links work

## Troubleshooting

### Email Not Sending

1. Check if `RESEND_API_KEY` is set correctly
2. Verify the API key is valid in Resend dashboard
3. Check console logs for error messages

### Invitation Links Not Working

1. Verify `NEXT_PUBLIC_APP_URL` is set correctly
2. Check that the invitation exists in the database
3. Ensure the invitation hasn't expired (7 days)

### Development vs Production

- **Development**: Uses localhost URLs
- **Production**: Uses your domain URLs
- **Email**: Only works with valid Resend API key

## Current Working Features

✅ **Invitation Creation**: Invitations are created in the database ✅
**Invitation URLs**: Working invitation links are generated ✅ **User
Registration**: Users can register via invitation links ✅ **Role Assignment**:
Users get the correct role when accepting ✅ **Error Handling**: Graceful
fallback when email fails

## Next Steps

1. **Set up Resend** for production email sending
2. **Test the complete flow** with real email addresses
3. **Monitor email delivery** in Resend dashboard
4. **Set up email templates** for better branding

## Support

If you need help setting up email functionality:

1. Check the console logs for detailed error messages
2. Verify your environment variables are set correctly
3. Test with a valid Resend API key
4. Contact support if issues persist
