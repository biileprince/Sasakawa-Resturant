import { sendHtmlMail, emailTemplates } from '../utils/mail.util';

export async function testEmailSending(req: any, res: any) {
  try {
    const { to, subject, message } = req.body;
    
    if (!to) {
      return res.status(400).json({ error: 'Email recipient is required' });
    }

    // Test simple email
    const testSubject = subject || 'Test Email from Sasakawa Restaurant';
    const testMessage = message || 'This is a test email to verify the email service is working correctly.';
    
    console.log('🧪 Testing email functionality...');
    console.log('📧 Recipient:', to);
    console.log('📧 Subject:', testSubject);
    
    // Create a simple HTML email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background-color: #f9fafb; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Test Email</h1>
          </div>
          <div class="content">
            <h2>Email Service Test</h2>
            <p>${testMessage}</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
            <p><strong>Email Service:</strong> SMTP</p>
            <p><strong>SMTP Host:</strong> ${process.env.SMTP_HOST || 'Not configured'}</p>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">Visit Application</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendHtmlMail(to, testSubject, htmlContent, testMessage);
    
    res.status(200).json({ 
      success: true, 
      message: 'Test email sent successfully',
      details: {
        to,
        subject: testSubject,
        timestamp: new Date().toISOString(),
        service: 'SMTP',
        smtpHost: process.env.SMTP_HOST || 'Not configured'
      }
    });
  } catch (error) {
    console.error('❌ Test email failed:', error);
    res.status(500).json({ 
      error: 'Failed to send test email', 
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

export async function testEmailTemplate(req: any, res: any) {
  try {
    const { to, template = 'requestCreated' } = req.body;
    
    if (!to) {
      return res.status(400).json({ error: 'Email recipient is required' });
    }

    // Mock data for template testing
    const mockData = {
      id: 'TEST-001',
      description: 'Test Service Request for Email Template',
      serviceType: 'Catering',
      budgetAmount: 500.00,
      urgency: 'Medium',
      expectedCompletionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      department: { name: 'IT Department' },
      requester: { name: 'Test User', email: to },
      approver: { name: 'Test Approver' }
    };

    console.log('🧪 Testing email template:', template);
    console.log('📧 Recipient:', to);

    let emailTemplate;
    
    switch (template) {
      case 'requestApproved':
        emailTemplate = emailTemplates.requestApproved(mockData);
        break;
      case 'requestRejected':
        emailTemplate = emailTemplates.requestRejected({ ...mockData, rejectionReason: 'Budget exceeds limit' });
        break;
      case 'invoiceCreated':
        emailTemplate = emailTemplates.invoiceCreated({
          invoiceNumber: 'INV-TEST-001',
          description: 'Test Invoice',
          amount: 500.00,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          request: mockData
        });
        break;
      default:
        emailTemplate = emailTemplates.requestCreated(mockData);
    }

    await sendHtmlMail(to, emailTemplate.subject, emailTemplate.html);
    
    res.status(200).json({ 
      success: true, 
      message: `Test email template '${template}' sent successfully`,
      details: {
        to,
        template,
        subject: emailTemplate.subject,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Test email template failed:', error);
    res.status(500).json({ 
      error: 'Failed to send test email template', 
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
