import { Resend } from 'resend';

class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  /**
   * Send magic link email for authentication
   */
  async sendMagicLink(email: string, magicLink: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'Arsenal Fan Platform <noreply@yourddomain.com>',
        to: [email],
        subject: 'Your Arsenal Fan Platform Login Link',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background: linear-gradient(135deg, #EF0107 0%, #023474 100%);
                  color: white;
                  padding: 30px;
                  text-align: center;
                  border-radius: 8px 8px 0 0;
                }
                .content {
                  background: #f9f9f9;
                  padding: 30px;
                  border-radius: 0 0 8px 8px;
                }
                .button {
                  display: inline-block;
                  padding: 15px 30px;
                  background: #EF0107;
                  color: white;
                  text-decoration: none;
                  border-radius: 5px;
                  margin: 20px 0;
                  font-weight: bold;
                }
                .footer {
                  text-align: center;
                  margin-top: 20px;
                  font-size: 12px;
                  color: #666;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔴⚪ Arsenal Fan Platform</h1>
                </div>
                <div class="content">
                  <h2>Login to Your Account</h2>
                  <p>Click the button below to securely log in to your Arsenal Fan Platform account:</p>
                  <p style="text-align: center;">
                    <a href="${magicLink}" class="button">Log In Now</a>
                  </p>
                  <p>Or copy and paste this link into your browser:</p>
                  <p style="word-break: break-all; background: white; padding: 10px; border-radius: 4px; font-size: 12px;">
                    ${magicLink}
                  </p>
                  <p><strong>This link expires in 15 minutes.</strong></p>
                  <p>If you didn't request this login link, you can safely ignore this email.</p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Arsenal Fan Platform. Not affiliated with Arsenal FC.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      if (error) {
        console.error('Error sending magic link:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to send magic link:', error);
      throw error;
    }
  }

  /**
   * Send welcome email after registration
   */
  async sendWelcomeEmail(email: string, username: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'Arsenal Fan Platform <noreply@yourdomain.com>',
        to: [email],
        subject: 'Welcome to Arsenal Fan Platform! 🔴⚪',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background: linear-gradient(135deg, #EF0107 0%, #023474 100%);
                  color: white;
                  padding: 30px;
                  text-align: center;
                  border-radius: 8px 8px 0 0;
                }
                .content {
                  background: #f9f9f9;
                  padding: 30px;
                  border-radius: 0 0 8px 8px;
                }
                .feature-list {
                  list-style: none;
                  padding: 0;
                }
                .feature-list li {
                  padding: 10px 0;
                  border-bottom: 1px solid #ddd;
                }
                .feature-list li:before {
                  content: "✅ ";
                  margin-right: 10px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Welcome, ${username}! 🔴⚪</h1>
                </div>
                <div class="content">
                  <h2>You're Now Part of the Global Arsenal Family!</h2>
                  <p>Thanks for joining Arsenal Fan Platform. Here's what you can do:</p>
                  <ul class="feature-list">
                    <li>Check in to matches from anywhere in the world</li>
                    <li>Earn badges for every match you attend virtually</li>
                    <li>See Arsenal fans on a live global map</li>
                    <li>Compete on leaderboards and unlock achievements</li>
                    <li>Track your lucky charm status</li>
                    <li>Make predictions and earn points</li>
                  </ul>
                  <p><strong>Next match check-in opens 5 minutes before kickoff!</strong></p>
                  <p>COYG! 🔴⚪</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      if (error) {
        console.error('Error sending welcome email:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw error;
    }
  }

  /**
   * Send badge earned notification
   */
  async sendBadgeNotification(
    email: string,
    username: string,
    matchDetails: { opponent: string; score: string; date: string }
  ) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'Arsenal Fan Platform <noreply@yourdomain.com>',
        to: [email],
        subject: `🏅 You earned a badge: Arsenal vs ${matchDetails.opponent}`,
        html: `
          <!DOCTYPE html>
          <html>
            <body>
              <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                <div style="background: linear-gradient(135deg, #EF0107 0%, #023474 100%); color: white; padding: 30px; text-align: center; border-radius: 8px;">
                  <h1>🏅 Badge Earned!</h1>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
                  <h2>Congratulations, ${username}!</h2>
                  <p>You've earned your badge for:</p>
                  <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <h3 style="color: #EF0107; margin: 0;">Arsenal vs ${matchDetails.opponent}</h3>
                    <p style="font-size: 24px; font-weight: bold; margin: 10px 0;">${matchDetails.score}</p>
                    <p style="color: #666; margin: 0;">${matchDetails.date}</p>
                  </div>
                  <p>View your badge collection and check your progress on your profile.</p>
                  <p>Keep the streak going! 🔥</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      if (error) {
        console.error('Error sending badge notification:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to send badge notification:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
export default emailService;
