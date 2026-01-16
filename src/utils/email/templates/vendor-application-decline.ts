
export const vendorRejectionTemplate = (vendorName: string, storeName: string, reason: string): string => {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Jozi Market - Application Update</title>
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
              font-size: 18px;
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
              margin-bottom: 12px;
              letter-spacing: -0.02em;
          }
          .greeting {
              font-size: 16px;
              font-weight: 700;
              margin-bottom: 16px;
              color: #1B5E52;
          }
          .content-text {
              font-size: 15px;
              color: #4A5568;
              margin-bottom: 32px;
          }
          .reason-box {
              background-color: #FFF5F5;
              border-left: 4px solid #E53E3E;
              border-radius: 12px;
              padding: 24px;
              margin: 32px 0;
          }
          .reason-title {
              font-size: 11px;
              font-weight: 800;
              color: #E53E3E;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              margin-bottom: 8px;
          }
          .reason-text {
              font-size: 14px;
              font-weight: 600;
              color: #1A2E2A;
              margin: 0;
          }
          .note-card {
              background-color: #FCFAF7;
              border-radius: 20px;
              padding: 24px;
              border: 1px solid rgba(27, 94, 82, 0.05);
          }
          .note-title {
              font-size: 13px;
              font-weight: 800;
              color: #1B5E52;
              margin-bottom: 8px;
          }
          .cta-link {
              display: inline-block;
              color: #C7A16E;
              text-decoration: underline;
              font-weight: 700;
              margin-top: 32px;
          }
          .footer {
              margin-top: 48px;
              padding-top: 32px;
              border-top: 1px solid #f1f1f1;
              text-align: center;
          }
          .footer-text {
              font-size: 12px;
              color: #94A3B8;
              margin-bottom: 16px;
          }
          .brand-seal {
              font-size: 10px;
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
  
              <h1 class="hero-title">Manifest Update.</h1>
  
              <p class="greeting">Hello ${vendorName},</p>
  
              <p class="content-text">
                  Thank you for your interest in joining the Jozi Market collective. Our Hub Stewards have carefully audited your artisan application for <strong>${storeName}</strong>. 
                  <br><br>
                  At this stage, we are unable to approve your storefront for the following reason:
              </p>
  
              <div class="reason-box">
                  <p class="reason-title">Steward Notes</p>
                  <p class="reason-text">${reason}</p>
              </div>
  
              <div class="note-card">
                  <p class="note-title">Can I re-apply?</p>
                  <p class="content-text" style="font-size: 13px; margin: 0;">
                      Absolutely. Jozi Market is committed to local growth. Once you have addressed the feedback above, you may initialize a new application sequence via the Artisan Portal.
                  </p>
              </div>
  
              <p class="content-text" style="margin-top: 32px;">
                  We appreciate the craft and dedication required to build a local brand. While we can't welcome you to the collective today, we encourage you to continue refining your workshop's artifacts.
              </p>
  
              <div class="footer">
                  <p class="footer-text">
                      Best regards,<br>
                      <strong>The Jozi Market Collective</strong>
                  </p>
                  <p class="brand-seal">Proudly South African 🇿🇦</p>
              </div>
          </div>
      </div>
  </body>
  </html>`;
  };
  