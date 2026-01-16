
export const vendorApprovalTemplate = (vendorName: string, storeName: string): string => {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Jozi Market - Welcome to the Collective</title>
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
              border-radius: 40px;
              padding: 0;
              overflow: hidden;
              box-shadow: 0 20px 50px rgba(27, 94, 82, 0.1);
              border: 1px solid rgba(27, 94, 82, 0.05);
          }
          .hero-banner {
              background-color: #1B5E52;
              padding: 60px 48px;
              text-align: center;
              color: #ffffff;
          }
          .logo-text {
              font-size: 16px;
              font-weight: 800;
              color: #C7A16E;
              letter-spacing: 0.3em;
              text-transform: uppercase;
              margin: 0 0 20px 0;
          }
          .hero-title {
              font-size: 38px;
              font-weight: 800;
              line-height: 1.1;
              margin: 0;
              letter-spacing: -0.04em;
          }
          .body-content {
              padding: 48px;
          }
          .greeting {
              font-size: 18px;
              font-weight: 700;
              margin-bottom: 20px;
              color: #1B5E52;
          }
          .content-text {
              font-size: 15px;
              color: #4A5568;
              margin-bottom: 32px;
              line-height: 1.7;
          }
          .status-badge {
              display: inline-block;
              background-color: #F0FDF4;
              color: #16A34A;
              padding: 8px 16px;
              border-radius: 100px;
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              margin-bottom: 32px;
              border: 1px solid #DCFCE7;
          }
          .action-card {
              background-color: #FCFAF7;
              border-radius: 24px;
              padding: 32px;
              margin-bottom: 32px;
              border: 1px solid rgba(199, 161, 110, 0.2);
          }
          .card-title {
              font-size: 13px;
              font-weight: 800;
              color: #1B5E52;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              margin-bottom: 16px;
              display: flex;
              align-items: center;
          }
          .step-item {
              margin-bottom: 12px;
              font-size: 14px;
              color: #4A5568;
              display: block;
          }
          .step-item strong {
              color: #1B5E52;
          }
          .cta-button {
              display: block;
              background-color: #C7A16E;
              color: #1B5E52 !important;
              text-decoration: none;
              text-align: center;
              padding: 20px 32px;
              border-radius: 16px;
              font-weight: 800;
              font-size: 15px;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              margin: 40px 0;
              box-shadow: 0 10px 20px rgba(199, 161, 110, 0.2);
          }
          .footer {
              background-color: #f8f8f8;
              padding: 40px 48px;
              text-align: center;
              border-top: 1px solid #eee;
          }
          .footer-text {
              font-size: 12px;
              color: #94A3B8;
              margin-bottom: 12px;
          }
          .brand-seal {
              font-size: 10px;
              font-weight: 800;
              color: #1B5E52;
              text-transform: uppercase;
              letter-spacing: 0.4em;
          }
      </style>
  </head>
  <body>
      <div class="wrapper">
          <div class="container">
              <div class="hero-banner">
                  <p class="logo-text">Jozi Market</p>
                  <h1 class="hero-title">WELCOME TO THE COLLECTIVE.</h1>
              </div>
  
              <div class="body-content">
                  <div class="status-badge">Account Verified & Active</div>
                  
                  <p class="greeting">Hello ${vendorName},</p>
  
                  <p class="content-text">
                      The wait is over. Our Hub Stewards have verified your artifacts and production process. We are thrilled to officially welcome <strong>${storeName}</strong> to the Jozi Market artisan family.
                  </p>
  
                  <div class="action-card">
                      <h4 class="card-title">Initialization Checklist</h4>
                      <span class="step-item">✅ <strong>Artisan Profile:</strong> Finalize your workshop story and logo.</span>
                      <span class="step-item">🚀 <strong>First Drop:</strong> Upload your initial 5 product listings.</span>
                      <span class="step-item">📦 <strong>Logistics Hub:</strong> Connect your primary dispatch zone.</span>
                  </div>
  
                  <p class="content-text">
                      You now have full access to the Artisan Intelligence suite and Capital Ledger. Your digital storefront is ready for the first wave of Jozi seekers.
                  </p>
  
                  <a href="https://jozimarket.co.za/vendor/portal" class="cta-button">Enter Artisan Cockpit</a>
  
                  <p class="content-text" style="font-size: 13px; color: #888; text-align: center;">
                      Need a guide? Our <strong>Hub Liaisons</strong> are standing by in the Artisan Slack community to help you optimize your first drop.
                  </p>
              </div>
  
              <div class="footer">
                  <p class="footer-text">
                      You are receiving this because your artisan application was approved.<br>
                      © 2024 Jozi Market Collective.
                  </p>
                  <p class="brand-seal">Proudly South African 🇿🇦</p>
              </div>
          </div>
      </div>
  </body>
  </html>`;
  };
  