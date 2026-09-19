export interface SendSmsOptions {
  to: string;
  text: string;
  studentName?: string;
}

export interface SendSmsResponse {
  success: boolean;
  messageUUID?: string;
  error?: string;
  results?: Array<{ success: boolean; messageUUID?: string; error?: string; to?: string }>;
}

/**
 * Dispatch an SMS via the server's Vonage SMS API endpoint.
 */
export async function sendCheckoutSMS({ to, text, studentName }: SendSmsOptions): Promise<SendSmsResponse> {
  try {
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, text, studentName }),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Failed to send Vonage SMS via API endpoint:', error);
    return {
      success: false,
      error: error.message || 'Network error sending SMS request to server',
    };
  }
}
