import nodemailer from 'nodemailer';

/**
 * Creates and returns a configured nodemailer transporter.
 * Reads SMTP credentials from environment variables.
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for port 465, false for 587 (STARTTLS)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Sends an OTP verification email to the user.
 *
 * @param {string} recipientEmail - The destination email address
 * @param {string} otp            - The 6-digit OTP to include in the email
 * @returns {Promise<void>}
 */
export const sendOtpEmail = async (recipientEmail, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"TechVani" <noreply@techvani.com>`,
    to: recipientEmail,
    subject: 'Your TechVani Verification Code',
    // Plain-text fallback
    text: `Your TechVani verification code is: ${otp}\n\nThis code expires in 10 minutes. Do not share it with anyone.`,
    // Rich HTML email
    html: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>TechVani Verification Code</title>
        </head>
        <body style="margin:0;padding:0;background-color:#0f0f14;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f14;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="520" cellpadding="0" cellspacing="0"
                  style="background:linear-gradient(145deg,#1a1a2e,#16213e);border-radius:16px;
                         border:1px solid #2a2a4a;overflow:hidden;">

                  <!-- Header -->
                  <tr>
                    <td align="center"
                      style="background:linear-gradient(135deg,#6c63ff,#48cfad);
                             padding:32px 40px;">
                      <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700;
                                 letter-spacing:-0.5px;">TechVani</h1>
                      <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                        AI-Powered Learning Platform
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px;">
                      <h2 style="margin:0 0 12px;color:#e8e8f0;font-size:20px;font-weight:600;">
                        Verify your email address
                      </h2>
                      <p style="margin:0 0 28px;color:#9898b8;font-size:15px;line-height:1.6;">
                        Enter the 6-digit code below to complete your registration.
                        This code is valid for <strong style="color:#6c63ff;">10 minutes</strong>.
                      </p>

                      <!-- OTP Box -->
                      <div style="background:#0f0f14;border:2px solid #6c63ff;border-radius:12px;
                                  padding:28px;text-align:center;margin-bottom:28px;">
                        <p style="margin:0 0 8px;color:#9898b8;font-size:12px;
                                  text-transform:uppercase;letter-spacing:2px;">
                          Verification Code
                        </p>
                        <p style="margin:0;color:#ffffff;font-size:42px;font-weight:700;
                                  letter-spacing:12px;font-family:'Courier New',monospace;">
                          ${otp}
                        </p>
                      </div>

                      <!-- Warning -->
                      <div style="background:rgba(255,100,100,0.08);border-left:3px solid #ff6464;
                                  border-radius:6px;padding:14px 16px;margin-bottom:28px;">
                        <p style="margin:0;color:#ff9898;font-size:13px;line-height:1.5;">
                          🔒 <strong>Never share this code.</strong> TechVani will never ask for
                          your verification code via phone or chat.
                        </p>
                      </div>

                      <p style="margin:0;color:#6060a0;font-size:13px;line-height:1.5;">
                        If you didn't create a TechVani account, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:20px 40px;border-top:1px solid #2a2a4a;">
                      <p style="margin:0;color:#4a4a6a;font-size:12px;text-align:center;">
                        © ${new Date().getFullYear()} TechVani. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`[emailService] OTP email sent to ${recipientEmail}`);
};
