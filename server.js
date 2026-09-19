import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendSMS } from './send-sms.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API Endpoint for Vonage SMS dispatch
app.post('/api/send-sms', async (req, res) => {
  try {
    const { to, text } = req.body;

    if (!to || !text) {
      return res.status(400).json({ success: false, error: 'Missing required parameters: to and text' });
    }

    // Support multiple phone numbers separated by & or comma
    const phones = String(to).split(/[&,]/).map((p) => p.trim()).filter(Boolean);
    const results = [];

    for (const phone of phones) {
      const resObj = await sendSMS({ to: phone, text });
      results.push(resObj);
    }

    const allSuccessful = results.length > 0 && results.every((r) => r.success);
    return res.status(allSuccessful ? 200 : 207).json({
      success: allSuccessful,
      results,
      messageUUID: results[0]?.messageUUID || null,
    });
  } catch (error) {
    console.error('Error in Express /api/send-sms route:', error);
    return res.status(500).json({ success: false, error: error.message || String(error) });
  }
});

// Serve static frontend files if built
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('Vonage SMS API Server is running. Frontend dev mode: access via Vite dev server.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
