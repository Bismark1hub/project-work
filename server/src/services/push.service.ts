import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import webpush from 'web-push';

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@gctu.edu.gh',
  process.env.VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export class PushService {
  static async saveSubscription(userId: string, subscription: any) {
    const id = uuidv4();
    // Check if already exists
    const existing = await query(
      'SELECT id FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2',
      [userId, subscription.endpoint]
    );
    if (existing.rows.length > 0) return;

    await query(
      `INSERT INTO push_subscriptions (id, user_id, endpoint, p256dh, auth)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, userId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth]
    );
  }

  static async deleteSubscription(userId: string, endpoint: string) {
    await query(
      'DELETE FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2',
      [userId, endpoint]
    );
  }

  static async sendToUser(userId: string, payload: { title: string; body: string }) {
    const result = await query(
      'SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1',
      [userId]
    );
    const subscriptions = result.rows;
    const notifications = [];
    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        );
        notifications.push({ endpoint: sub.endpoint, status: 'sent' });
      } catch (err: any) {
        // If subscription is invalid, remove it
        if (err.statusCode === 404 || err.statusCode === 410) {
          await query('DELETE FROM push_subscriptions WHERE endpoint = $1', [sub.endpoint]);
        }
        notifications.push({ endpoint: sub.endpoint, status: 'failed', error: err.message });
      }
    }
    return notifications;
  }

  static async sendTest(userId: string) {
    return this.sendToUser(userId, {
      title: 'Test Notification',
      body: 'Push notifications are working!',
    });
  }
}