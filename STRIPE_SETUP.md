# Stripe Integration Setup

This guide will help you set up Stripe payment processing for the upgrade page.

## Required Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs (create these in your Stripe dashboard)
STRIPE_MIDI_PRICE_ID=price_your_midi_plan_price_id_here
STRIPE_MAXI_PRICE_ID=price_your_maxi_plan_price_id_here
```

## Stripe Dashboard Setup

### 1. Create Products and Prices

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Products** → **Add Product**
3. Create two products:

#### Midi Plan Product

- **Name**: Midi Plan
- **Price**: €9.99/month
- **Billing**: Recurring (monthly)
- **Price ID**: Copy this ID to `STRIPE_MIDI_PRICE_ID`

#### Maxi Plan Product

- **Name**: Maxi Plan
- **Price**: €19.99/month
- **Billing**: Recurring (monthly)
- **Price ID**: Copy this ID to `STRIPE_MAXI_PRICE_ID`

### 2. Set Up Webhooks

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set **Endpoint URL** to: `https://your-domain.com/api/stripe/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** to `STRIPE_WEBHOOK_SECRET`

### 3. Test Mode

Make sure you're using **test mode** in Stripe dashboard for development. Use
these test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Expiry**: Any future date
- **CVC**: Any 3 digits

## Testing the Integration

1. Start your development server: `npm run dev`
2. Navigate to `/upgrade`
3. Move the slider to select a paid plan (4-10 partners)
4. Click "Upgrade now"
5. Complete the payment with a test card
6. You should be redirected to the success page

## Production Deployment

For production:

1. Switch to **live mode** in Stripe dashboard
2. Update environment variables with live keys
3. Update webhook endpoint URL to your production domain
4. Test the complete flow with real cards

## Security Notes

- Never commit your Stripe secret keys to version control
- Always use environment variables for sensitive keys
- Verify webhook signatures in production
- Implement proper error handling for failed payments
- Consider adding subscription management features

## Next Steps

Consider implementing:

1. **Subscription Management**: Allow users to view/cancel subscriptions
2. **Usage Tracking**: Track partner count and enforce limits
3. **Billing Portal**: Let users manage their billing information
4. **Email Notifications**: Send receipts and subscription updates
5. **Database Integration**: Store subscription status in your database
