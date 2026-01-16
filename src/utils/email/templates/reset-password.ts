export const resetPasswordTemplate = (otp: string): string => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Jozi Market - Reset Your Cipher</title>
      <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap');
          
          body {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #1A2E2A;
              margin: 0;
              padding: 0;
              background-color: #FCFAF7;
          }
          .wrapper {
              width: 100%;
              table-layout: fixed;
              background-color: #FCFAF7;
              padding-bottom: 40px;
              padding-top: 40px;
          }
          .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 32px;
              padding: 48px;
              box-shadow: 0 10px 30px rgba(27, 94, 82, 0.05);
              border: 1px solid rgba(27, 94, 82, 0.05);
          }
          .header {
              text-align: center;
              margin-bottom: 40px;
          }
          .logo-text {
              font-size: 20px;
              font-weight: 800;
              color: #1B5E52;
              letter-spacing: 0.2em;
              text-transform: uppercase;
              margin: 0;
          }
          .divider {
              height: 2px;
              width: 40px;
              background-color: #C7A16E;
              margin: 12px auto;
          }
          .hero-title {
              font-size: 28px;
              font-weight: 800;
              color: #1B5E52;
              text-align: center;
              margin-bottom: 24px;
              letter-spacing: -0.02em;
          }
          .greeting {
              font-size: 16px;
              font-weight: 700;
              margin-bottom: 16px;
          }
          .content-text {
              font-size: 15px;
              color: #555;
              margin-bottom: 32px;
          }
          .otp-box {
              background-color: #fcfaf7;
              border: 2px dashed #C7A16E;
              border-radius: 20px;
              padding: 32px;
              text-align: center;
              margin: 32px 0;
          }
          .otp-code {
              font-size: 42px;
              font-weight: 800;
              letter-spacing: 8px;
              color: #1B5E52;
              margin: 0;
          }
          .expiry-note {
              text-align: center;
              font-size: 12px;
              font-weight: 700;
              color: #C7A16E;
              text-transform: uppercase;
              letter-spacing: 0.1em;
          }
          .footer {
              margin-top: 48px;
              padding-top: 32px;
              border-top: 1px solid #f1f1f1;
              text-align: center;
          }
          .footer-text {
              font-size: 13px;
              color: #999;
              margin-bottom: 16px;
          }
          .brand-seal {
              font-size: 11px;
              font-weight: 800;
              color: #1B5E52;
              text-transform: uppercase;
              letter-spacing: 0.3em;
          }
      </style>
  </head>
  <body>
      <div class="wrapper">
          <div class="container">
              <div class="header">
                  <p class="logo-text">Jozi Market</p>
                  <div class="divider"></div>
              </div>
  
              <h1 class="hero-title">Reset Your Cipher.</h1>
  
              <p class="greeting">Hello Neighbor,</p>
  
              <p class="content-text">
                  We received a request to access your Jozi Market account. To ensure your artisanal treasures and reward points remain secure, please use the verification code below:
              </p>
  
              <div class="otp-box">
                  <p class="otp-code">${otp}</p>
              </div>
  
              <p class="expiry-note">This code expires in 10 minutes</p>
  
              <p class="content-text" style="text-align: center; margin-top: 32px;">
                  If you did not request this change, please ignore this email or contact our Hub Stewards if you suspect unauthorized access.
              </p>
  
              <div class="footer">
                  <p class="footer-text">
                      Best regards,<br>
                      <strong>The Jozi Market Collective</strong>
                  </p>
                  <p class="brand-seal">Proudly South African 🇿🇦</p>
                  <p style="font-size: 10px; color: #ccc; margin-top: 20px;">
                      144 Fox Street, Maboneng, Johannesburg, 2001
                  </p>
              </div>
          </div>
      </div>
  </body>
  </html>`;
};
