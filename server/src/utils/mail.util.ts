import nodemailer from 'nodemailer';

export function getMailer() {
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
  return transporter;
}

export async function sendSimpleMail(to: string, subject: string, text: string) {
  const from = process.env.SMTP_FROM || 'no-reply@example.com';
  const transporter = getMailer();
  await transporter.sendMail({ from, to, subject, text });
}

export async function sendHtmlMail(to: string, subject: string, html: string, text?: string) {
  const from = process.env.SMTP_FROM || 'no-reply@sasakawa.edu';
  const transporter = getMailer();
  
  try {
    await transporter.sendMail({ 
      from, 
      to, 
      subject, 
      html, 
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    });
    console.log(`Email sent successfully to ${to}: ${subject}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw error;
  }
}

// Email templates
export const emailTemplates = {
  requestCreated: (requestData: any) => ({
    subject: `New Service Request: ${requestData.eventName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">🍽️ Sasakawa Restaurant</h1>
          <p style="margin: 5px 0 0 0;">Service Request Notification</p>
        </div>
        
        <div style="padding: 20px; background: #f9fafb; border-left: 4px solid #667eea;">
          <h2 style="color: #374151; margin-top: 0;">New Service Request Created</h2>
          <p style="color: #6b7280;">A new service request has been submitted and requires your attention.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Request Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 5px 0; font-weight: bold;">Event Name:</td><td>${requestData.eventName}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Service Type:</td><td>${requestData.serviceType}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Requested by:</td><td>${requestData.requester?.name} (${requestData.requester?.email})</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Department:</td><td>${requestData.department?.name || 'Not assigned'}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Event Date:</td><td>${new Date(requestData.eventDate).toLocaleDateString()}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Venue:</td><td>${requestData.venue}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Attendees:</td><td>${requestData.attendees} people</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Estimate Amount:</td><td>₦${requestData.estimateAmount?.toLocaleString()}</td></tr>
            </table>
          </div>
          
          ${requestData.description ? `
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h4 style="color: #1f2937; margin-top: 0;">Description</h4>
            <p style="color: #6b7280; margin: 0;">${requestData.description}</p>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/requests/${requestData.id}" 
               style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
               View Request Details
            </a>
          </div>
        </div>
        
        <div style="padding: 15px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>This is an automated notification from Sasakawa Restaurant Service Request System.</p>
        </div>
      </div>
    `
  }),

  requestApproved: (requestData: any, approvalComments?: string) => ({
    subject: `Request Approved: ${requestData.eventName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">✅ Request Approved</h1>
          <p style="margin: 5px 0 0 0;">Your service request has been approved</p>
        </div>
        
        <div style="padding: 20px; background: #f0fdf4; border-left: 4px solid #10b981;">
          <h2 style="color: #374151; margin-top: 0;">Great News!</h2>
          <p style="color: #6b7280;">Your service request for "${requestData.eventName}" has been approved and is now being processed.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Request Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 5px 0; font-weight: bold;">Event Name:</td><td>${requestData.eventName}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Service Type:</td><td>${requestData.serviceType}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Event Date:</td><td>${new Date(requestData.eventDate).toLocaleDateString()}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Venue:</td><td>${requestData.venue}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Attendees:</td><td>${requestData.attendees} people</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Estimate Amount:</td><td>₦${requestData.estimateAmount?.toLocaleString()}</td></tr>
            </table>
          </div>
          
          ${approvalComments ? `
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #1f2937; margin-top: 0;">💬 Approval Comments</h3>
            <p style="color: #6b7280; margin: 0; font-style: italic;">"${approvalComments}"</p>
          </div>
          ` : ''}
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Next Steps</h3>
            <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
              <li>An invoice will be generated for this request</li>
              <li>You will receive a notification once the invoice is ready</li>
              <li>The finance department will handle payment processing</li>
              <li>Service delivery will be scheduled closer to your event date</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/requests/${requestData.id}" 
               style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
               View Request Status
            </a>
          </div>
        </div>
        
        <div style="padding: 15px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>This is an automated notification from Sasakawa Restaurant Service Request System.</p>
        </div>
      </div>
    `
  }),

  requestRevision: (requestData: any, reason?: string) => ({
    subject: `Revision Requested: ${requestData.eventName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">📝 Revision Requested</h1>
          <p style="margin: 5px 0 0 0;">Your service request needs some updates</p>
        </div>
        
        <div style="padding: 20px; background: #fffbeb; border-left: 4px solid #f59e0b;">
          <h2 style="color: #374151; margin-top: 0;">Request Requires Revision</h2>
          <p style="color: #6b7280;">Your service request for "${requestData.eventName}" has been reviewed and requires some updates before approval.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Request Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 5px 0; font-weight: bold;">Event Name:</td><td>${requestData.eventName}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Service Type:</td><td>${requestData.serviceType}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Event Date:</td><td>${new Date(requestData.eventDate).toLocaleDateString()}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Venue:</td><td>${requestData.venue}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Attendees:</td><td>${requestData.attendees} people</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Estimate Amount:</td><td>₦${requestData.estimateAmount?.toLocaleString()}</td></tr>
            </table>
          </div>
          
          ${reason ? `
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #1f2937; margin-top: 0;">📋 Revision Comments</h3>
            <p style="color: #6b7280; margin: 0; font-style: italic;">"${reason}"</p>
          </div>
          ` : ''}
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Next Steps</h3>
            <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
              <li>Review the comments provided above</li>
              <li>Edit your request with the necessary changes</li>
              <li>Resubmit the request for approval</li>
              <li>Contact the reviewer if you need clarification</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/requests/${requestData.id}/edit" 
               style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
               Edit Request
            </a>
          </div>
        </div>
        
        <div style="padding: 15px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>This is an automated notification from Sasakawa Restaurant Service Request System.</p>
        </div>
      </div>
    `
  }),

  requestRejected: (requestData: any, reason?: string) => ({
    subject: `Request Rejected: ${requestData.eventName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">❌ Request Rejected</h1>
          <p style="margin: 5px 0 0 0;">Your service request has been rejected</p>
        </div>
        
        <div style="padding: 20px; background: #fef2f2; border-left: 4px solid #ef4444;">
          <h2 style="color: #374151; margin-top: 0;">Request Status Update</h2>
          <p style="color: #6b7280;">Unfortunately, your service request for "${requestData.eventName}" has been rejected.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Request Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 5px 0; font-weight: bold;">Event Name:</td><td>${requestData.eventName}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Service Type:</td><td>${requestData.serviceType}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Event Date:</td><td>${new Date(requestData.eventDate).toLocaleDateString()}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Venue:</td><td>${requestData.venue}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Attendees:</td><td>${requestData.attendees} people</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Estimate Amount:</td><td>₦${requestData.estimateAmount?.toLocaleString()}</td></tr>
            </table>
          </div>
          
          ${reason ? `
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ef4444;">
            <h3 style="color: #1f2937; margin-top: 0;">🚫 Reason for Rejection</h3>
            <p style="color: #6b7280; margin: 0; font-style: italic;">"${reason}"</p>
          </div>
          ` : ''}
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">What You Can Do</h3>
            <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
              <li>Review the rejection reason above</li>
              <li>Contact your department approver for clarification</li>
              <li>Submit a new request with the necessary modifications</li>
              <li>Reach out to the restaurant team for assistance</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/requests/${requestData.id}" 
               style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
               View Request Details
            </a>
          </div>
        </div>
        
        <div style="padding: 15px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>This is an automated notification from Sasakawa Restaurant Service Request System.</p>
        </div>
      </div>
    `
  }),

  invoiceCreated: (invoiceData: any) => ({
    subject: `Invoice Created: ${invoiceData.request?.eventName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">🧾 Invoice Created</h1>
          <p style="margin: 5px 0 0 0;">Your service invoice is ready</p>
        </div>
        
        <div style="padding: 20px; background: #eff6ff; border-left: 4px solid #3b82f6;">
          <h2 style="color: #374151; margin-top: 0;">Invoice Generated</h2>
          <p style="color: #6b7280;">An invoice has been created for your approved service request.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Invoice Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 5px 0; font-weight: bold;">Invoice #:</td><td>${invoiceData.invoiceNo || invoiceData.id.slice(0, 8)}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Event:</td><td>${invoiceData.request?.eventName}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Gross Amount:</td><td>₦${invoiceData.grossAmount?.toLocaleString()}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Tax Amount:</td><td>₦${invoiceData.taxAmount?.toLocaleString()}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold; color: #059669;">Net Amount:</td><td style="color: #059669; font-weight: bold;">₦${invoiceData.netAmount?.toLocaleString()}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Due Date:</td><td>${new Date(invoiceData.dueDate).toLocaleDateString()}</td></tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/invoices/${invoiceData.id}" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
               View Invoice
            </a>
          </div>
        </div>
        
        <div style="padding: 15px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>This is an automated notification from Sasakawa Restaurant Service Request System.</p>
        </div>
      </div>
    `
  }),

  paymentRecorded: (paymentData: any) => ({
    subject: `Payment Recorded: ${paymentData.invoice?.request?.eventName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">💰 Payment Recorded</h1>
          <p style="margin: 5px 0 0 0;">Your payment has been processed</p>
        </div>
        
        <div style="padding: 20px; background: #ecfdf5; border-left: 4px solid #059669;">
          <h2 style="color: #374151; margin-top: 0;">Payment Confirmation</h2>
          <p style="color: #6b7280;">We have successfully recorded your payment for the service request.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Payment Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 5px 0; font-weight: bold;">Payment #:</td><td>${paymentData.id.slice(0, 8)}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Event:</td><td>${paymentData.invoice?.request?.eventName}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Amount:</td><td>₦${paymentData.amount?.toLocaleString()}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Method:</td><td>${paymentData.method}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Date:</td><td>${new Date(paymentData.paymentDate).toLocaleDateString()}</td></tr>
            </table>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Service Delivery</h3>
            <p style="color: #6b7280; margin: 0;">Your payment has been confirmed. Our team will contact you closer to your event date to finalize service delivery details.</p>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/payments/${paymentData.id}" 
               style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
               View Payment Details
            </a>
          </div>
        </div>
        
        <div style="padding: 15px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>This is an automated notification from Sasakawa Restaurant Service Request System.</p>
        </div>
      </div>
    `
  }),

  // Finance officer notification for approved requests
  requestApprovedForFinance: (requestData: any, approvalComments?: string) => ({
    subject: `Action Required - Create Invoice: ${requestData.eventName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">📋 Invoice Creation Required</h1>
          <p style="margin: 5px 0 0 0;">Request approved - action needed</p>
        </div>
        
        <div style="padding: 20px; background: #eff6ff; border-left: 4px solid #3b82f6;">
          <h2 style="color: #374151; margin-top: 0;">Request Approved - Create Invoice</h2>
          <p style="color: #6b7280;">A service request has been approved and now requires an invoice to be created for processing.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Request Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 5px 0; font-weight: bold;">Event Name:</td><td>${requestData.eventName}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Service Type:</td><td>${requestData.serviceType}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Event Date:</td><td>${new Date(requestData.eventDate).toLocaleDateString()}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Venue:</td><td>${requestData.venue}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Attendees:</td><td>${requestData.attendees} people</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Estimate Amount:</td><td>₦${requestData.estimateAmount?.toLocaleString()}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Approved by:</td><td>${requestData.approver?.name || 'System'}</td></tr>
            </table>
          </div>
          
          ${approvalComments ? `
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #1f2937; margin-top: 0;">💬 Approval Comments</h3>
            <p style="color: #6b7280; margin: 0; font-style: italic;">"${approvalComments}"</p>
          </div>
          ` : ''}
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Required Actions</h3>
            <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
              <li><strong>Create an invoice</strong> for this approved request</li>
              <li>Include applicable taxes and charges</li>
              <li>Set appropriate due date for payment</li>
              <li>Send invoice to the requester for payment</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/requests/${requestData.id}" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
               View Request
            </a>
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/invoices/new?requestId=${requestData.id}" 
               style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
               Create Invoice
            </a>
          </div>
        </div>
        
        <div style="padding: 15px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>This is an automated notification from Sasakawa Restaurant Service Request System.</p>
        </div>
      </div>
    `
  })
};


