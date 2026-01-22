import nodemailer from "nodemailer";
import { Resend } from "resend";

// Initialize Resend client lazily
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (process.env.RESEND_API_KEY && !resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

async function sendViaResend(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<any> {
  const from = process.env.MAIL_FROM || "onboarding@resend.dev";
  const resend = getResendClient();
  
  // Sanitize subject - remove newlines and limit length
  const cleanSubject = subject.replace(/[\r\n]+/g, ' ').trim().substring(0, 200);
  
  console.log("📧 Resend Configuration:", {
    from,
    to,
    subject: cleanSubject,
    hasApiKey: !!process.env.RESEND_API_KEY,
  });

  if (!resend) {
    throw new Error("RESEND_API_KEY not set - please configure Resend settings");
  }

  try {
    const result = await resend.emails.send({
      from,
      to: [to],
      subject: cleanSubject,
      html,
      text: text || cleanSubject,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    console.log(`📧 Email sent successfully via Resend to ${to}: ${subject}`);
    return result;
  } catch (error) {
    console.error("📧 Resend Error:", error);
    throw error;
  }
}

async function sendViaSMTP(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<any> {
  const nodeEnv = process.env.NODE_ENV || "development";
  const host = process.env.SMTP_HOST;

  console.log("📧 SMTP Configuration:", {
    host,
    port: process.env.SMTP_PORT || 587,
    nodeEnv,
    to,
    subject,
  });

  if (!host) {
    throw new Error("SMTP_HOST not set - please configure email settings");
  }

  let transportConfig: any = {
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
  };

  // Configure authentication based on environment
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transportConfig.auth = {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    };
    console.log("📧 Using SMTP authentication");
  }

  // Special configuration for Mailtrap in development
  if (nodeEnv === "development" && host.includes("sandbox.smtp.mailtrap.io")) {
    transportConfig = {
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      secure: false,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    };
    console.log("🔧 Using Mailtrap for development email testing");
  }

  // Production SMTP configurations
  if (nodeEnv === "production") {
    // Gmail configuration
    if (host.includes("smtp.gmail.com")) {
      transportConfig.secure = true;
      transportConfig.port = 465;
      console.log("📧 Using Gmail SMTP configuration");
    }
    // SendGrid configuration
    else if (host.includes("smtp.sendgrid.net")) {
      transportConfig.port = 587;
      transportConfig.secure = false;
      console.log("📧 Using SendGrid SMTP configuration");
    }
    // Mailgun configuration
    else if (host.includes("smtp.mailgun.org")) {
      transportConfig.port = 587;
      transportConfig.secure = false;
      console.log("📧 Using Mailgun SMTP configuration");
    }
  }

  try {
    const transporter = nodemailer.createTransport(transportConfig);
    const from = process.env.MAIL_FROM || "noreply@sasakawa.edu";
    
    // Sanitize subject - remove newlines
    const cleanSubject = subject.replace(/[\r\n]+/g, ' ').trim();

    // Verify SMTP connection
    console.log("📧 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection verified");

    const result = await transporter.sendMail({
      from,
      to,
      subject: cleanSubject,
      html,
      text: text || cleanSubject,
    });

    console.log(`📧 Email sent successfully via SMTP to ${to}: ${subject}`);
    return result;
  } catch (error) {
    console.error("📧 SMTP Error:", error);
    throw error;
  }
}

// Email service utility - Use Resend as primary, SMTP as fallback
export async function sendHtmlMail(
  to: string,
  subject: string,
  html: string,
  text?: string
) {
  try {
    console.log("📧 Attempting to send email:", {
      to,
      subject,
      service: process.env.RESEND_API_KEY ? "Resend" : "SMTP",
    });

    // Use Resend as primary email service
    if (process.env.RESEND_API_KEY) {
      await sendViaResend(to, subject, html, text);
    } else {
      // Fallback to SMTP if Resend is not configured
      console.log("📧 Resend not configured, falling back to SMTP");
      await sendViaSMTP(to, subject, html, text);
    }
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw error;
  }
}

export async function sendSimpleMail(
  to: string,
  subject: string,
  text: string
) {
  // Convert text to basic HTML
  const html = `<p>${text.replace(/\n/g, "<br>")}</p>`;
  await sendHtmlMail(to, subject, html, text);
}

// Legacy function for backward compatibility
export function getMailer() {
  const nodeEnv = process.env.NODE_ENV || "development";
  const host = process.env.SMTP_HOST;

  if (!host) throw new Error("SMTP_HOST not set");

  let transportConfig: any = {
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
  };

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transportConfig.auth = {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    };
  }

  if (nodeEnv === "development" && host.includes("sandbox.smtp.mailtrap.io")) {
    transportConfig = {
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      secure: false,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    };
  }

  return nodemailer.createTransport(transportConfig);
}

// Email templates
export const emailTemplates = {
  requestCreated: (requestData: any) => ({
    subject: `New Service Request: ${
      requestData.eventName || "Service Request"
    }`,
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
                <tr><td style="padding: 5px 0; font-weight: bold;">Request ID:</td><td>#${
                  requestData.requestNo || requestData.id || "N/A"
                }</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Description:</td><td>${
                  requestData.description || "N/A"
                }</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Service Type:</td><td>${
                  requestData.serviceType || "N/A"
                }</td></tr>
                ${
                  requestData.packageName
                    ? `<tr><td style="padding: 5px 0; font-weight: bold;">Food Package:</td><td>${
                        requestData.packageName
                      } ${
                        requestData.pricePerPerson
                          ? `(₵${Number(requestData.pricePerPerson).toFixed(
                              2
                            )}/person)`
                          : ""
                      }</td></tr>`
                    : ""
                }
                <tr><td style="padding: 5px 0; font-weight: bold;">Attendees:</td><td>${
                  requestData.attendees || "N/A"
                } people</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Department:</td><td>${
                  requestData.department?.name || "N/A"
                }</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Requested by:</td><td>${
                  requestData.requester?.name || "N/A"
                } ${
      requestData.requester?.email ? `(${requestData.requester.email})` : ""
    }</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Budget:</td><td>₵${Number(
                  requestData.estimateAmount || 0
                ).toFixed(2)}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Event Date:</td><td>${
                  requestData.eventDate
                    ? new Date(requestData.eventDate).toLocaleDateString(
                        "en-GB"
                      )
                    : "N/A"
                }</td></tr>
              </table>
            </div>
            <p>Please log in to the system to review and process this request.</p>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/requests/${
      requestData.id
    }" class="button">Review Request</a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated message from the Sasakawa Restaurant Service Request System.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  requestApproved: (requestData: any) => ({
    subject: `Service Request Approved: ${
      requestData.description || "Service Request"
    }`,
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
                <tr><td style="padding: 5px 0; font-weight: bold;">Request ID:</td><td>#${
                  requestData.requestNo || requestData.id || "N/A"
                }</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Description:</td><td>${
                  requestData.description || "N/A"
                }</td></tr>
                ${
                  requestData.packageName
                    ? `<tr><td style="padding: 5px 0; font-weight: bold;">Food Package:</td><td>${
                        requestData.packageName
                      } ${
                        requestData.pricePerPerson
                          ? `(₵${Number(requestData.pricePerPerson).toFixed(
                              2
                            )}/person)`
                          : ""
                      }</td></tr>`
                    : ""
                }
                <tr><td style="padding: 5px 0; font-weight: bold;">Attendees:</td><td>${
                  requestData.attendees || "N/A"
                } people</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Approved by:</td><td>${
                  requestData.approver?.name || "N/A"
                }</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Budget:</td><td>₵${Number(
                  requestData.estimateAmount || 0
                ).toFixed(2)}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Event Date:</td><td>${
                  requestData.eventDate
                    ? new Date(requestData.eventDate).toLocaleDateString(
                        "en-GB"
                      )
                    : "N/A"
                }</td></tr>
              </table>
            </div>
            <p>Your request is now ready for processing. You'll receive further updates as progress is made.</p>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/requests/${
      requestData.id
    }" class="button">View Request</a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated message from the Sasakawa Restaurant Service Request System.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  requestRejected: (requestData: any) => ({
    subject: `Service Request Update: ${
      requestData.description || "Service Request"
    }`,
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
                <tr><td style="padding: 5px 0; font-weight: bold;">Request ID:</td><td>#${
                  requestData.requestNo || requestData.id || "N/A"
                }</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Description:</td><td>${
                  requestData.description || "N/A"
                }</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Reviewed by:</td><td>${
                  requestData.approver?.name || "N/A"
                }</td></tr>
                ${
                  requestData.rejectionReason
                    ? `<tr><td style="padding: 5px 0; font-weight: bold;">Feedback:</td><td>${requestData.rejectionReason}</td></tr>`
                    : ""
                }
              </table>
            </div>
            <p>Please review the feedback and update your request accordingly. You can resubmit after making the necessary changes.</p>
            <div style="text-align: center;">
              <a href="${
                process.env.FRONTEND_URL
              }/requests" class="button">Update Request</a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated message from the Sasakawa Restaurant Service Request System.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  invoiceGenerated: (invoiceData: any) => ({
    subject: `Invoice Generated: ${
      invoiceData.description || "Service Request"
    }`,
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
            <p>An invoice has been generated for your completed service request.</p>
            <div class="details">
              <table>
                <tr><td style="padding: 5px 0; font-weight: bold;">Invoice #:</td><td>${
                  invoiceData.invoiceNo || "N/A"
                }</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Description:</td><td>${
                  invoiceData.description || "Service Request"
                }</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Amount:</td><td>₵${Number(
                  invoiceData.netAmount || invoiceData.amount || 0
                ).toFixed(2)}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Due Date:</td><td>${
                  invoiceData.dueDate
                    ? new Date(invoiceData.dueDate).toLocaleDateString("en-GB")
                    : "N/A"
                }</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Department:</td><td>${
                  invoiceData.request?.department?.name || "N/A"
                }</td></tr>
              </table>
            </div>
            <p>Please process payment by the due date to avoid any service interruptions.</p>
            <div style="text-align: center;">
              <a href="${
                process.env.FRONTEND_URL
              }/invoices" class="button">View Invoice</a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated message from the Sasakawa Restaurant Service Request System.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Alias for backward compatibility with invoice controller
  invoiceCreated: (invoiceData: any) => {
    return emailTemplates.invoiceGenerated(invoiceData);
  },

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
                <tr><td style="padding: 5px 0; font-weight: bold;">Payment ID:</td><td>#${
                  paymentData.id
                }</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Invoice #:</td><td>${
                  paymentData.invoice?.invoiceNumber
                }</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Amount:</td><td>₵${Number(
                  paymentData.amount || 0
                ).toFixed(2)}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Payment Method:</td><td>${
                  paymentData.paymentMethod
                }</td></tr>
                ${
                  paymentData.chequeNumber
                    ? `<tr><td style="padding: 5px 0; font-weight: bold;">Cheque Number:</td><td>${paymentData.chequeNumber}</td></tr>`
                    : ""
                }
                <tr><td style="padding: 5px 0; font-weight: bold;">Date:</td><td>${new Date(
                  paymentData.paymentDate
                ).toLocaleDateString("en-GB")}</td></tr>
              </table>
            </div>
            <p>Your payment has been processed and your invoice has been marked as paid.</p>
            <div style="text-align: center;">
              <a href="${
                process.env.FRONTEND_URL
              }/payments" class="button">View Payment</a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated message from the Sasakawa Restaurant Service Request System.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  paymentRecorded: (paymentData: any) => {
    const invoiceNumber = paymentData.invoice?.invoiceNo || "N/A";
    const paymentId = paymentData.paymentNo || paymentData.id || "N/A";
    const paymentMethod = paymentData.method || "N/A";
    const paymentDate = paymentData.paymentDate
      ? new Date(paymentData.paymentDate).toLocaleDateString("en-GB")
      : "N/A";

    // Handle Prisma Decimal types - convert to number
    const paidAmount = Number(paymentData.amount) || 0;
    const invoiceAmount = Number(paymentData.invoice?.netAmount) || 0;

    // Calculate total paid from all payments (convert Decimals to numbers)
    const totalPaid =
      paymentData.invoice?.payments?.reduce((sum: number, p: any) => {
        return sum + (Number(p.amount) || 0);
      }, 0) || paidAmount;

    const outstanding = Math.max(invoiceAmount - totalPaid, 0);
    const isFullyPaid = outstanding === 0 && invoiceAmount > 0;
    const description = paymentData.invoice?.description || "Service Invoice";

    return {
      subject: `Payment Recorded: Invoice ${invoiceNumber}`,
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
              <h1>💰 Payment Recorded</h1>
            </div>
            <div class="content">
              <p>We have received and recorded your payment for invoice <strong>#${invoiceNumber}</strong> (${description}).</p>
              <div class="details">
                <table>
                  <tr><td style="padding: 5px 0; font-weight: bold;">Payment ID:</td><td>#${paymentId}</td></tr>
                  <tr><td style="padding: 5px 0; font-weight: bold;">Invoice #:</td><td>${invoiceNumber}</td></tr>
                  <tr><td style="padding: 5px 0; font-weight: bold;">Payment Amount:</td><td>₵${paidAmount.toFixed(
                    2
                  )}</td></tr>
                  <tr><td style="padding: 5px 0; font-weight: bold;">Total Paid to Date:</td><td>₵${totalPaid.toFixed(
                    2
                  )}</td></tr>
                  <tr><td style="padding: 5px 0; font-weight: bold;">Invoice Total:</td><td>₵${invoiceAmount.toFixed(
                    2
                  )}</td></tr>
                  <tr><td style="padding: 5px 0; font-weight: bold;">Outstanding Balance:</td><td>₵${outstanding.toFixed(
                    2
                  )}</td></tr>
                  <tr><td style="padding: 5px 0; font-weight: bold;">Payment Method:</td><td>${paymentMethod}</td></tr>
                  ${
                    paymentData.chequeNumber
                      ? `<tr><td style="padding: 5px 0; font-weight: bold;">Cheque Number:</td><td>${paymentData.chequeNumber}</td></tr>`
                      : ""
                  }
                  <tr><td style="padding: 5px 0; font-weight: bold;">Date:</td><td>${paymentDate}</td></tr>
                </table>
              </div>
              <p>
                ${
                  isFullyPaid
                    ? "Your invoice is now <strong>fully paid</strong>. Thank you!"
                    : `Thank you for your payment. <br>If you have an outstanding balance, please pay the remaining amount at your earliest convenience.`
                }
              </p>
              <div style="text-align: center;">
                <a href="${
                  process.env.FRONTEND_URL
                }/payments" class="button">View Payment Details</a>
              </div>
            </div>
            <div class="footer">
              <p>This is an automated message from the Sasakawa Restaurant Service Request System.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  },

  requestApprovedForFinance: (requestData: any, comments?: string) => ({
    subject: `Request Approved - Ready for Finance: ${
      requestData.description || "Service Request"
    }`,
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
            <h1>💼 Request Approved - Finance Action Required</h1>
          </div>
          <div class="content">
            <p>A service request has been approved and is now ready for finance processing.</p>
            <div class="details">
              <table>
                <tr><td style="padding: 5px 0; font-weight: bold;">Request ID:</td><td>#${
                  requestData.requestNo || requestData.id || "N/A"
                }</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Description:</td><td>${
                  requestData.description || "N/A"
                }</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Service Type:</td><td>${
                  requestData.serviceType || "N/A"
                }</td></tr>
                ${
                  requestData.packageName
                    ? `<tr><td style="padding: 5px 0; font-weight: bold;">Food Package:</td><td>${
                        requestData.packageName
                      } ${
                        requestData.pricePerPerson
                          ? `(₵${Number(requestData.pricePerPerson).toFixed(
                              2
                            )}/person)`
                          : ""
                      }</td></tr>`
                    : ""
                }
                <tr><td style="padding: 5px 0; font-weight: bold;">Attendees:</td><td>${
                  requestData.attendees || "N/A"
                } people</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Department:</td><td>${
                  requestData.department?.name || "N/A"
                }</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Approved by:</td><td>${
                  requestData.approver?.name || "N/A"
                }</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Budget:</td><td>₵${Number(
                  requestData.estimateAmount || 0
                ).toFixed(2)}</td></tr>
                ${
                  comments
                    ? `<tr><td style="padding: 5px 0; font-weight: bold;">Comments:</td><td>${comments}</td></tr>`
                    : ""
                }
              </table>
            </div>
            <p>Please proceed with financial processing and invoice generation.</p>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/requests/${
      requestData.id
    }" class="button">Process Request</a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated message from the Sasakawa Restaurant Service Request System.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  requestRevision: (requestData: any, comments?: string) => ({
    subject: `Revision Required: ${
      requestData.description || "Service Request"
    }`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .details table { width: 100%; }
          .details td { padding: 5px 0; vertical-align: top; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 10px 20px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 Revision Required</h1>
          </div>
          <div class="content">
            <p>Your service request requires some revisions before it can be processed further.</p>
            <div class="details">
              <table>
                <tr><td style="padding: 5px 0; font-weight: bold;">Request ID:</td><td>#${
                  requestData.requestNo || requestData.id || "N/A"
                }</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Description:</td><td>${
                  requestData.description || "N/A"
                }</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Service Type:</td><td>${
                  requestData.serviceType || "N/A"
                }</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Department:</td><td>${
                  requestData.department?.name || "N/A"
                }</td></tr>
                ${
                  comments
                    ? `<tr><td style="padding: 5px 0; font-weight: bold;">Revision Notes:</td><td>${comments}</td></tr>`
                    : ""
                }
              </table>
            </div>
            <p>Please review the revision notes and update your request accordingly. You can then resubmit for approval.</p>
            <div style="text-align: center;">
              <a href="${
                process.env.FRONTEND_URL
              }/requests" class="button">Edit Request</a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated message from the Sasakawa Restaurant Service Request System.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};
