/**
 * Square Webhook Handler for PulseBeast
 * 
 * Set up in Square Dashboard:
 * 1. Go to Developer → Webhooks
 * 2. Add webhook endpoint: https://your-domain.vercel.app/api/webhook
 * 3. Subscribe to: payment.created, payment.updated
 * 4. Copy Signature Key
 */

const crypto = require('crypto');

// Store stats in memory (use database in production)
let stats = {
  revenue: 0,
  leads: 0,
  calls: 0,
  lastUpdated: new Date()
};

/**
 * Verify Square webhook signature
 */
function verifySquareWebhook(req, signatureKey) {
  const signature = req.headers['x-square-hmac-sha256'];
  const body = req.rawBody; // Raw body as string
  
  const hash = crypto
    .createHmac('sha256', signatureKey)
    .update(body)
    .digest('base64');
  
  return hash === signature;
}

/**
 * Handle incoming Square webhook
 */
async function handleSquareWebhook(req, res, signatureKey) {
  // Verify webhook authenticity
  if (!verifySquareWebhook(req, signatureKey)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.body;

  // Handle payment completion
  if (event.type === 'payment.created' || event.type === 'payment.updated') {
    const payment = event.data.object.payment;

    // Only count successful payments
    if (payment.status === 'COMPLETED') {
      const amountInCents = payment.amount_money.amount;
      const amountInDollars = amountInCents / 100;

      // Check if this is a $99 payment (or close to it)
      if (amountInDollars >= 99 && amountInDollars <= 100) {
        // Update revenue
        stats.revenue += amountInDollars;
        
        // Add 1 lead per $99 sale
        stats.leads += 1;
        
        // Update timestamp
        stats.lastUpdated = new Date();

        console.log(`✅ Payment received: $${amountInDollars}`);
        console.log(`📊 Updated stats - Revenue: $${stats.revenue}, Leads: ${stats.leads}`);
      }
    }
  }

  // Acknowledge receipt
  res.json({ success: true });
}

/**
 * Get current stats
 */
function getStats() {
  return {
    ...stats,
    lastUpdated: stats.lastUpdated.toISOString()
  };
}

/**
 * Reset stats (admin only)
 */
function resetStats() {
  stats = {
    revenue: 0,
    leads: 0,
    calls: 0,
    lastUpdated: new Date()
  };
}

module.exports = {
  handleSquareWebhook,
  getStats,
  resetStats,
  verifySquareWebhook
};
