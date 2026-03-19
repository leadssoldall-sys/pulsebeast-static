# Square Webhook Setup for PulseBeast Real-Time Stats

## Overview
This guide enables real-time payment tracking from your Square checkout link. Every $99 payment automatically updates the stats dashboard.

---

## Step 1: Deploy to Vercel

1. Push the latest code to GitHub
2. Deploy on Vercel (takes ~1 minute)
3. Note your Vercel URL: `https://your-project.vercel.app`

---

## Step 2: Configure Square Webhook

### 2.1 Get Your Webhook Signature Key

1. Go to [Square Developer Dashboard](https://developer.squareup.com/apps)
2. Select your application
3. Navigate to **Webhooks** (left sidebar)
4. Click **Add Endpoint**
5. Enter webhook URL: `https://your-project.vercel.app/api/webhook`
6. Subscribe to events:
   - ✅ `payment.created`
   - ✅ `payment.updated`
7. Click **Save**
8. Copy the **Signature Key** (you'll need this next)

### 2.2 Add to Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add new variable:
   - **Name:** `SQUARE_WEBHOOK_SIGNATURE_KEY`
   - **Value:** (paste the signature key from Step 2.1)
4. Click **Save**
5. Redeploy your project (Vercel will auto-redeploy)

---

## Step 3: Test the Webhook

### 3.1 Verify Webhook is Receiving Events

1. In Square Dashboard, go to **Webhooks**
2. Click your endpoint
3. Scroll to **Recent Events**
4. You should see `payment.created` and `payment.updated` events

### 3.2 Test with a Real Payment

1. Visit your Vercel site: `https://your-project.vercel.app`
2. Click **"UPGRADE NOW – $99"** button
3. Complete a test payment on Square (use test card if available)
4. Return to your site
5. Go to `/stats.html` to see updated stats

---

## Step 4: Verify Real-Time Stats

### Check Stats Dashboard

- **URL:** `https://your-project.vercel.app/stats.html`
- **Revenue:** Shows total from all $99 payments
- **Leads:** Increments by 1 per payment
- **Last Updated:** Shows when stats were last refreshed

### Monitor Webhook Logs

1. Square Dashboard → Webhooks → Your Endpoint
2. View **Recent Events** to confirm payments are being received
3. Check Vercel **Logs** for any errors

---

## Troubleshooting

### Stats Not Updating

**Problem:** Payment completed but stats didn't change

**Solutions:**
1. Verify webhook endpoint is correct in Square Dashboard
2. Check Vercel environment variable is set
3. Confirm payment amount is exactly $99 (or $99.00)
4. Check Vercel logs for errors: `vercel logs`

### Webhook Not Receiving Events

**Problem:** Recent Events is empty

**Solutions:**
1. Verify endpoint URL is correct and accessible
2. Check that events are subscribed: `payment.created` and `payment.updated`
3. Test endpoint manually: `curl https://your-project.vercel.app/api/webhook`
4. Ensure Vercel project is deployed and running

### Signature Verification Failing

**Problem:** Webhook rejected with "Invalid signature"

**Solutions:**
1. Verify `SQUARE_WEBHOOK_SIGNATURE_KEY` is correct
2. Redeploy after adding environment variable
3. Check that signature key hasn't been regenerated in Square Dashboard

---

## Production Checklist

- [ ] Webhook endpoint configured in Square Dashboard
- [ ] Signature key added to Vercel environment variables
- [ ] Project redeployed after env var change
- [ ] Test payment completed successfully
- [ ] Stats dashboard shows correct values
- [ ] `/stats.html` is accessible from your domain

---

## API Reference

### GET `/api/webhook`
Returns current stats

**Response:**
```json
{
  "revenue": 99.00,
  "leads": 1,
  "calls": 0,
  "lastUpdated": "2026-03-19T15:30:45.123Z"
}
```

### POST `/api/webhook`
Receives Square webhook events (called by Square, not manually)

**Webhook Payload:**
```json
{
  "type": "payment.created",
  "data": {
    "object": {
      "payment": {
        "status": "COMPLETED",
        "amount_money": {
          "amount": 9900,
          "currency": "USD"
        }
      }
    }
  }
}
```

---

## Next Steps

1. **Add Database:** Replace in-memory stats with persistent database (Supabase, Firebase)
2. **Email Notifications:** Send confirmation email on each payment
3. **Slack Alerts:** Notify team on new sales
4. **Analytics Dashboard:** Track conversion rates, customer lifetime value, etc.

---

## Support

- Square Webhooks Docs: https://developer.squareup.com/docs/webhooks
- Vercel Environment Variables: https://vercel.com/docs/environment-variables
- PulseBeast GitHub: https://github.com/leadssoldall-sys/pulsebeast-static
