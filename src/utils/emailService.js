// Email service for sending notifications
import api from '../services/api';

class EmailService {
  static async sendWelcomeEmail(userEmail, companyName) {
    try {
      await api.post('/admin/send-email', {
        to: userEmail,
        template: 'welcome',
        data: { companyName }
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  }

  static async sendSubscriptionExpiry(userEmail, daysRemaining) {
    try {
      await api.post('/admin/send-email', {
        to: userEmail,
        template: 'subscription_expiry',
        data: { daysRemaining }
      });
    } catch (error) {
      console.error('Failed to send expiry email:', error);
    }
  }

  static async sendUserInvitation(userEmail, companyName, temporaryPassword) {
    try {
      await api.post('/admin/send-email', {
        to: userEmail,
        template: 'user_invitation',
        data: { companyName, temporaryPassword }
      });
    } catch (error) {
      console.error('Failed to send invitation email:', error);
    }
  }
}

export default EmailService;
