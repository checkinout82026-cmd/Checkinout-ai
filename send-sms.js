import { Vonage } from '@vonage/server-sdk';
import { Channels } from '@vonage/messages';
import dotenv from 'dotenv';

dotenv.config();

const VONAGE_API_KEY = process.env.VONAGE_API_KEY || '0b9785a2';
const VONAGE_API_SECRET = process.env.VONAGE_API_SECRET || '';
const VONAGE_FROM = process.env.VONAGE_FROM || 'Vonage APIs';

const vonage = new Vonage({
  apiKey: VONAGE_API_KEY,
  apiSecret: VONAGE_API_SECRET,
});

/**
 * Send an SMS message using Vonage Messages API.
 * @param {Object} options
 * @param {string|number} options.to - Recipient phone number
 * @param {string} options.text - SMS content to send
 * @param {string} [options.from] - Sender ID
 */
export async function sendSMS({ to, text, from = VONAGE_FROM }) {
  let cleanTo = String(to).replace(/\D/g, '');
  if (cleanTo.length === 10) {
    cleanTo = '1' + cleanTo;
  }

  if (!cleanTo) {
    throw new Error('Invalid recipient phone number');
  }

  console.log(`[Vonage] Sending SMS to ${cleanTo}...`);

  try {
    const data = await vonage.messages.send({
      messageType: 'text',
      channel: Channels.SMS,
      text: text,
      to: cleanTo,
      from: from,
    });

    const messageUUID = data?.messageUUID || data?.message_uuid || 'unknown';
    console.log('[Vonage] Message sent successfully. UUID:', messageUUID);
    return { success: true, messageUUID, to: cleanTo };
  } catch (error) {
    console.error('[Vonage] Error sending SMS:', error);
    return { success: false, error: error.message || String(error) };
  }
}

// Allow direct execution for testing: `node send-sms.js [to_phone] [message]`
if (process.argv[1] && process.argv[1].endsWith('send-sms.js')) {
  const targetPhone = process.argv[2] || '919838605661';
  const messageText = process.argv[3] || 'This is a test SMS sent using Vonage API';
  
  console.log(`Testing standalone Vonage SMS to ${targetPhone}...`);
  sendSMS({ to: targetPhone, text: messageText })
    .then((res) => console.log('Result:', res))
    .catch((err) => console.error('Failed:', err));
}
