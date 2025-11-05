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

  /**
   * Send achievement unlocked notification
   */
  async sendAchievementNotification(
    email: string,
    username: string,
    achievement: { name: string; description: string; rarity: string }
  ) {
    try {
      const rarityEmoji = {
        COMMON: '🥉',
        RARE: '🥈',
        EPIC: '🥇',
        LEGENDARY: '💎',
      }[achievement.rarity] || '🏆';

      const { data, error } = await this.resend.emails.send({
        from: 'Arsenal Fan Platform <noreply@yourdomain.com>',
        to: [email],
        subject: `${rarityEmoji} Achievement Unlocked: ${achievement.name}`,
        html: `
          <!DOCTYPE html>
          <html>
            <body>
              <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                <div style="background: linear-gradient(135deg, #EF0107 0%, #023474 100%); color: white; padding: 30px; text-align: center; border-radius: 8px;">
                  <h1>${rarityEmoji} Achievement Unlocked!</h1>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
                  <h2>Congratulations, ${username}!</h2>
                  <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <div style="font-size: 48px; margin-bottom: 10px;">${rarityEmoji}</div>
                    <h3 style="color: #EF0107; margin: 10px 0;">${achievement.name}</h3>
                    <p style="color: #666; margin: 10px 0;">${achievement.description}</p>
                    <p style="background: #f0f0f0; display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                      ${achievement.rarity}
                    </p>
                  </div>
                  <p>Check your profile to see all your achievements!</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      if (error) {
        console.error('Error sending achievement notification:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to send achievement notification:', error);
      throw error;
    }
  }

  /**
   * Send match reminder notification
   */
  async sendMatchReminder(
    email: string,
    username: string,
    match: {
      opponent: string;
      competition: string;
      kickoffTime: string;
      venue: string;
      hoursUntil: number;
    }
  ) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'Arsenal Fan Platform <noreply@yourdomain.com>',
        to: [email],
        subject: `⚽ Match Reminder: Arsenal vs ${match.opponent} in ${match.hoursUntil} hours`,
        html: `
          <!DOCTYPE html>
          <html>
            <body>
              <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                <div style="background: linear-gradient(135deg, #EF0107 0%, #023474 100%); color: white; padding: 30px; text-align: center; border-radius: 8px;">
                  <h1>⚽ Match Day Reminder</h1>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
                  <h2>Hi ${username}!</h2>
                  <p>Arsenal's next match is coming up:</p>
                  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #EF0107; margin: 0;">Arsenal vs ${match.opponent}</h3>
                    <p style="color: #666; margin: 10px 0;">${match.competition}</p>
                    <p style="font-size: 18px; font-weight: bold; margin: 10px 0;">⏰ ${match.kickoffTime}</p>
                    <p style="color: #666; margin: 10px 0;">📍 ${match.venue}</p>
                    <p style="background: #EF0107; color: white; display: inline-block; padding: 10px 20px; border-radius: 5px; font-weight: bold; margin-top: 10px;">
                      Kicks off in ${match.hoursUntil} hours
                    </p>
                  </div>
                  <p><strong>Don't forget to check in!</strong> Check-in opens 5 minutes before kickoff.</p>
                  <p>COYG! 🔴⚪</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      if (error) {
        console.error('Error sending match reminder:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to send match reminder:', error);
      throw error;
    }
  }

  /**
   * Send weekly recap email
   */
  async sendWeeklyRecap(
    email: string,
    username: string,
    stats: {
      checkIns: number;
      badgesEarned: number;
      predictionPoints: number;
      currentStreak: number;
      matches: Array<{ opponent: string; result: string; score: string }>;
    }
  ) {
    try {
      const matchesHtml = stats.matches
        .map(
          (match) => `
          <div style="padding: 15px; border-bottom: 1px solid #ddd;">
            <strong>Arsenal vs ${match.opponent}</strong><br/>
            <span style="color: ${match.result === 'WIN' ? '#4CAF50' : match.result === 'LOSS' ? '#f44336' : '#ff9800'};">
              ${match.result}
            </span> - ${match.score}
          </div>
        `
        )
        .join('');

      const { data, error } = await this.resend.emails.send({
        from: 'Arsenal Fan Platform <noreply@yourdomain.com>',
        to: [email],
        subject: `📊 Your Weekly Arsenal Recap - ${username}`,
        html: `
          <!DOCTYPE html>
          <html>
            <body>
              <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                <div style="background: linear-gradient(135deg, #EF0107 0%, #023474 100%); color: white; padding: 30px; text-align: center; border-radius: 8px;">
                  <h1>📊 Your Weekly Recap</h1>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
                  <h2>Hi ${username}!</h2>
                  <p>Here's your Arsenal activity from the past week:</p>

                  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0;">
                    <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                      <div style="font-size: 32px; font-weight: bold; color: #EF0107;">${stats.checkIns}</div>
                      <div style="color: #666;">Check-ins</div>
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                      <div style="font-size: 32px; font-weight: bold; color: #EF0107;">${stats.badgesEarned}</div>
                      <div style="color: #666;">Badges Earned</div>
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                      <div style="font-size: 32px; font-weight: bold; color: #EF0107;">${stats.predictionPoints}</div>
                      <div style="color: #666;">Prediction Points</div>
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                      <div style="font-size: 32px; font-weight: bold; color: #EF0107;">${stats.currentStreak} 🔥</div>
                      <div style="color: #666;">Current Streak</div>
                    </div>
                  </div>

                  ${stats.matches.length > 0 ? `
                    <h3>This Week's Matches</h3>
                    <div style="background: white; border-radius: 8px; overflow: hidden; margin: 20px 0;">
                      ${matchesHtml}
                    </div>
                  ` : ''}

                  <p>Keep up the great support! COYG! 🔴⚪</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      if (error) {
        console.error('Error sending weekly recap:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to send weekly recap:', error);
      throw error;
    }
  }

  /**
   * Send fixture update notification
   */
  async sendFixtureUpdate(
    email: string,
    username: string,
    update: {
      opponent: string;
      oldKickoff: string;
      newKickoff: string;
      reason: string;
    }
  ) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'Arsenal Fan Platform <noreply@yourdomain.com>',
        to: [email],
        subject: `⚠️ Fixture Update: Arsenal vs ${update.opponent}`,
        html: `
          <!DOCTYPE html>
          <html>
            <body>
              <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                <div style="background: #ff9800; color: white; padding: 30px; text-align: center; border-radius: 8px;">
                  <h1>⚠️ Fixture Update</h1>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
                  <h2>Hi ${username}!</h2>
                  <p>There's been a change to an upcoming Arsenal fixture:</p>
                  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #EF0107; margin: 0;">Arsenal vs ${update.opponent}</h3>
                    <div style="margin: 20px 0; padding: 15px; background: #f0f0f0; border-radius: 5px;">
                      <p style="margin: 5px 0;"><strong>Previous:</strong> ${update.oldKickoff}</p>
                      <p style="margin: 5px 0;"><strong>New Time:</strong> <span style="color: #EF0107; font-weight: bold;">${update.newKickoff}</span></p>
                    </div>
                    <p style="color: #666; margin: 10px 0;"><strong>Reason:</strong> ${update.reason}</p>
                  </div>
                  <p>Make sure to update your calendar! We'll send you a reminder before the match.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      if (error) {
        console.error('Error sending fixture update:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to send fixture update:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
export default emailService;
