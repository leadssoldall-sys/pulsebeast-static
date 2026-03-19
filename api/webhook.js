import crypto from 'crypto';

// In-memory stats storage (persists during function lifetime)
let stats = {
  revenue: 0,
  leads: 0,
  calls: 0,
  lastUpdated: new Date().toISOString()
};

function verifySquareWebhook(body, signature, signatureKey) {
  const hash = crypto
    .createHmac('sha256', signatureKey)
    .update(body)
    .digest('base64');
  
  return hash === signature;
}

export default function handler(req, res) {
  // GET: Retrieve current stats
  if (req.method === 'GET') {
    return res.status(200).json(stats);
  }

  // POST: Handle webhook
  if (req.method === 'POST') {
    const signature = req.headers['x-square-hmac-sha256'];
    const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;

    // Verify webhook (optional - for security)
    if (signatureKey && !verifySquareWebhook(JSON.stringify(req.body), signature, signatureKey)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;

    // Handle payment events
    if (event.type === 'payment.created' || event.type === 'payment.updated') {
      const payment = event.data.object.payment;

      if (payment.status === 'COMPLETED') {
        const amountInCents = payment.amount_money.amount;
        const amountInDollars = amountInCents / 100;

        // Count $99 payments
        if (amountInDollars >= 99 && amountInDollars <= 100) {
          stats.revenue += amountInDollars;
          stats.leads += 1;
          stats.lastUpdated = new Date().toISOString();

          console.log(`✅ Payment: $${amountInDollars} | Revenue: $${stats.revenue} | Leads: ${stats.leads}`);
        }
      }
    }

    return res.status(200).json({ success: true, stats });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
