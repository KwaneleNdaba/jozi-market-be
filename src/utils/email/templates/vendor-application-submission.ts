
export const vendorApplicationConfirmationTemplate = (vendorName: string, storeName: string): string => {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Jozi Market - Application Received</title>
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
              font-size: 32px;
              font-weight: 800;
              color: #1B5E52;
              text-align: center;
              margin-bottom: 12px;
              letter-spacing: -0.04em;
          }
          .hero-subtitle {
              font-size: 14px;
              font-weight: 700;
              color: #C7A16E;
              text-align: center;
              text-transform: uppercase;
              letter-spacing: 0.2em;
              margin-bottom: 40px;
          }
          .greeting {
              font-size: 16px;
              font-weight: 700;
              margin-bottom: 16px;
          }
          .content-text {
              font-size: 15px;
              color: #555;
              margin-bottom: 24px;
          }
          .status-card {
              background-color: #fcfaf7;
              border-radius: 24px;
              padding: 32px;
              margin: 32px 0;
              border: 1px solid rgba(199, 161, 110, 0.2);
          }
          .status-title {
              font-size: 12px;
              font-weight: 800;
              color: #C7A16E;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              margin-bottom: 8px;
          }
          .status-value {
              font-size: 20px;
              font-weight: 800;
              color: #1B5E52;
              margin: 0;
          }
          .step-list {
              margin: 32px 0;
              padding: 0;
              list-style: none;
          }
          .step-item {
              display: flex;
              align-items: flex-start;
              margin-bottom: 16px;
          }
          .step-number {
              background-color: #1B5E52;
              color: #ffffff;
              width: 24px;
              height: 24px;
              border-radius: 8px;
              font-size: 12px;
              font-weight: 800;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 16px;
              flex-shrink: 0;
          }
          .step-text {
              font-size: 14px;
              color: #555;
              font-weight: 500;
          }
          .cta-button {
              display: block;
              background-color: #1B5E52;
              color: #ffffff !important;
              text-decoration: none;
              text-align: center;
              padding: 18px 32px;
              border-radius: 16px;
              font-weight: 800;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              margin: 40px 0;
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
  
              <h1 class="hero-title">Manifest Logged.</h1>
              <p class="hero-subtitle">Application Sequence Initialized</p>
  
              <p class="greeting">Hello ${vendorName},</p>
  
              <p class="content-text">
                  Thank you for applying to join the Jozi Market collective. We have received your artisan application for <strong>${storeName}</strong>. Our Hub Stewards are currently reviewing your details.
              </p>
  
              <div class="status-card">
                  <p class="status-title">Current Phase</p>
                  <p class="status-value">Artisan Quality Audit</p>
              </div>
  
              <p class="greeting">What happens next?</p>
              
              <div class="step-list">
                  <div class="step-item">
                      <div class="step-number">1</div>
                      <div class="step-text"><strong>Quality Review:</strong> We verify your workshop's local production status (24-48h).</div>
                  </div>
                  <div class="step-item">
                      <div class="step-number">2</div>
                      <div class="step-text"><strong>Activation Call:</strong> If approved, a Liaison will contact you to finalize your storefront.</div>
                  </div>
                  <div class="step-item">
                      <div class="step-number">3</div>
                      <div class="step-text"><strong>First Drop:</strong> Initialize your first inventory vault and start selling!</div>
                  </div>
              </div>
  
              <a href="https://jozimarket.co.za/vendor/portal" class="cta-button">Visit Artisan Portal</a>
  
              <p class="content-text" style="font-size: 13px; color: #888; text-align: center; margin-top: 32px;">
                  While you wait, ensure you have your South African ID and proof of workshop address ready for final verification.
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
  