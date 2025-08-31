import nodemailer from 'nodemailer';

// TestMail.app API interface
interface TestMailAPIResponse {
  success: boolean;
  message?: string;
  error?: string;
}

async function sendViaTestMailAPI(to: string, subject: string, html: string, text?: string): Promise<void> {
  const apiKey = process.env.TESTMAIL_API_KEY;
  const namespace = process.env.TESTMAIL_NAMESPACE || 'default';
  const from = process.env.MAIL_FROM || 'noreply@sasakawa.edu';

  if (!apiKey) {
    throw new Error('TESTMAIL_API_KEY not configured');
  }

  const payload = {
    to,
    subject,
    html,
    text: text || subject,
    from,
    namespace
  };

  const response = await fetch('https://api.testmail.app/api/json/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`TestMail API error: ${response.status} - ${error}`);
  }

  const result: TestMailAPIResponse = await response.json();
  if (!result.success) {
    throw new Error(`TestMail send failed: ${result.error || result.message}`);
  }

  console.log(`📧 Email sent via TestMail API to ${to}: ${subject}`);
}

async function sendViaSMTP(to: string, subject: string, html: string, text?: string): Promise<void> {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const host = process.env.SMTP_HOST;
  
  if (!host) throw new Error('SMTP_HOST not set');

  let transportConfig: any = {
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
  };

  // Configure authentication based on environment
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transportConfig.auth = {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    };
  }

  // Special configuration for Mailtrap in development
  if (nodeEnv === 'development' && host.includes('sandbox.smtp.mailtrap.io')) {
    transportConfig = {
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      secure: false,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
      }
    };
    console.log('🔧 Using Mailtrap for development email testing');
  }

  const transporter = nodemailer.createTransport(transportConfig);
  const from = process.env.MAIL_FROM || 'no-reply@sasakawa.edu';
  
  const result = await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text: text || subject
  });

  console.log(`📧 Email sent via SMTP to ${to}: ${subject}`);
  return result;
}

export async function sendHtmlMail(to: string, subject: string, html: string, text?: string) {
  try {
    // Priority: Use TestMail API if configured, otherwise fall back to SMTP
    if (process.env.TESTMAIL_API_KEY) {
      await sendViaTestMailAPI(to, subject, html, text);
    } else {
      await sendViaSMTP(to, subject, html, text);
    }
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw error;
  }
}

export async function sendSimpleMail(to: string, subject: string, text: string) {
  // Convert text to basic HTML
  const html = `<p>${text.replace(/\n/g, '<br>')}</p>`;
  await sendHtmlMail(to, subject, html, text);
}

// Legacy function for backward compatibility
export function getMailer() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const host = process.env.SMTP_HOST;
  
  if (!host) throw new Error('SMTP_HOST not set');

  let transportConfig: any = {
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
  };

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transportConfig.auth = {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    };
  }

  if (nodeEnv === 'development' && host.includes('sandbox.smtp.mailtrap.io')) {
    transportConfig = {
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      secure: false,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
      }
    };
  }

  return nodemailer.createTransport(transportConfig);
}

// Email templates
export const emailTemplates = {
  requestCreated: (requestData: any) => ({
    subject: `New Service Request: ${requestData.description}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .details table { width: 100%; }
          .details td { padding: 5px 0; vertical-align: top; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Service Request Submitted</h1>
          </div>
          <div class="content">
            <p>A new service request has been submitted and requires your attention.</p>
            <div class="details">
              <table>
                <tr><td style="padding: 5px 0; font-weight: bold;">Request ID:</td><td>#${requestData.id}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Description:</td><td>${requestData.description}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Service Type:</td><td>${requestData.serviceType}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Department:</td><td>${requestData.department?.name}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Requested by:</td><td>${requestData.requester?.name} (${requestData.requester?.email})</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Urgency:</td><td>${requestData.urgency}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Budget:</td><td>$${requestData.budgetAmount}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Expected Date:</td><td>${new Date(requestData.expectedCompletionDate).toLocaleDateString()}</td></tr>
              </table>
            </div>
            <p>Please log in to the system to review and process this request.</p>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/protected/requests" class="button">Review Request</a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated message from the Sasakawa Restaurant Service Request System.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  requestApproved: (requestData: any) => ({
    subject: `Service Request Approved: ${requestData.description}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .details table { width: 100%; }
          .details td { padding: 5px 0; vertical-align: top; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 10px 20px; background-color: #059669; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Request Approved</h1>
          </div>
          <div class="content">
            <p>Great news! Your service request has been approved.</p>
            <div class="details">
              <table>
                <tr><td style="padding: 5px 0; font-weight: bold;">Request ID:</td><td>#${requestData.id}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Description:</td><td>${requestData.description}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Approved by:</td><td>${requestData.approver?.name}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Budget:</td><td>$${requestData.budgetAmount}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Expected Date:</td><td>${new Date(requestData.expectedCompletionDate).toLocaleDateString()}</td></tr>
              </table>
            </div>
            <p>Your request is now ready for processing. You'll receive further updates as progress is made.</p>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/protected/requests" class="button">View Request</a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated message from the Sasakawa Restaurant Service Request System.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  requestRejected: (requestData: any) => ({
    subject: `Service Request Update: ${requestData.description}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .details table { width: 100%; }
          .details td { padding: 5px 0; vertical-align: top; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 10px 20px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Request Update Required</h1>
          </div>
          <div class="content">
            <p>Your service request needs some adjustments before it can be approved.</p>
            <div class="details">
              <table>
                <tr><td style="padding: 5px 0; font-weight: bold;">Request ID:</td><td>#${requestData.id}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Description:</td><td>${requestData.description}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Reviewed by:</td><td>${requestData.approver?.name}</td></tr>
                ${requestData.rejectionReason ? `<tr><td style="padding: 5px 0; font-weight: bold;">Feedback:</td><td>${requestData.rejectionReason}</td></tr>` : ''}
              </table>
            </div>
            <p>Please review the feedback and update your request accordingly. You can resubmit after making the necessary changes.</p>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/protected/requests" class="button">Update Request</a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated message from the Sasakawa Restaurant Service Request System.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  invoiceGenerated: (invoiceData: any) => ({
    subject: `Invoice Generated: ${invoiceData.description}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #7c3aed; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .details table { width: 100%; }
          .details td { padding: 5px 0; vertical-align: top; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 10px 20px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📄 Invoice Generated</h1>
          </div>
          <div class="content">
            <p>An invoice has been generated for a completed service request.</p>
            <div class="details">
              <table>
                <tr><td style="padding: 5px 0; font-weight: bold;">Invoice #:</td><td>${invoiceData.invoiceNumber}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Description:</td><td>${invoiceData.description}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Amount:</td><td>$${invoiceData.amount}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Due Date:</td><td>${new Date(invoiceData.dueDate).toLocaleDateString()}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Department:</td><td>${invoiceData.request?.department?.name}</td></tr>
              </table>
            </div>
            <p>Please process payment by the due date to avoid any service interruptions.</p>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/protected/invoices" class="button">View Invoice</a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated message from the Sasakawa Restaurant Service Request System.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  paymentReceived: (paymentData: any) => ({
    subject: `Payment Received: Invoice ${paymentData.invoice?.invoiceNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .details table { width: 100%; }
          .details td { padding: 5px 0; vertical-align: top; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 10px 20px; background-color: #059669; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Payment Received</h1>
          </div>
          <div class="content">
            <p>We have successfully received your payment. Thank you!</p>
            <div class="details">
              <table>
                <tr><td style="padding: 5px 0; font-weight: bold;">Payment ID:</td><td>#${paymentData.id}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Invoice #:</td><td>${paymentData.invoice?.invoiceNumber}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Amount:</td><td>$${paymentData.amount}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Payment Method:</td><td>${paymentData.paymentMethod}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Date:</td><td>${new Date(paymentData.paymentDate).toLocaleDateString()}</td></tr>
              </table>
            </div>
            <p>Your payment has been processed and your invoice has been marked as paid.</p>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/protected/payments" class="button">View Payment</a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated message from the Sasakawa Restaurant Service Request System.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};
