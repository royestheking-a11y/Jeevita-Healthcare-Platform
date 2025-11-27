// Browser Notification Service
export class NotificationService {
  private static permission: NotificationPermission = 'default';

  // Request notification permission
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted';
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }

    return false;
  }

  // Check if notifications are supported and permitted
  static isSupported(): boolean {
    return 'Notification' in window;
  }

  static hasPermission(): boolean {
    return Notification.permission === 'granted';
  }

  // Show notification
  static async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.isSupported()) {
      console.warn('Notifications not supported');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    const notificationOptions: NotificationOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    };

    try {
      // Try to use Service Worker registration first (for mobile support)
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration) {
          await registration.showNotification(title, notificationOptions);
          return;
        }
      }

      // Fallback to standard Notification API
      const notification = new Notification(title, notificationOptions);

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  // Predefined notification types
  static notifyOrderConfirmed(orderId: string, amount: number): void {
    this.showNotification('Order Confirmed! 🎉', {
      body: `Your order #${orderId} has been confirmed. Total: ৳${amount.toFixed(2)}`,
      tag: `order-${orderId}`,
      requireInteraction: false,
    });
  }

  static notifyOrderShipped(orderId: string): void {
    this.showNotification('Order Shipped! 📦', {
      body: `Your order #${orderId} has been shipped and is on its way.`,
      tag: `order-shipped-${orderId}`,
      requireInteraction: false,
    });
  }

  static notifyOrderDelivered(orderId: string): void {
    this.showNotification('Order Delivered! ✅', {
      body: `Your order #${orderId} has been delivered successfully.`,
      tag: `order-delivered-${orderId}`,
      requireInteraction: true,
    });
  }

  static notifyPrescriptionReady(userName: string): void {
    this.showNotification('Prescription Medicines Ready! 💊', {
      body: `Hi ${userName}, your prescription has been approved. Medicines have been added to your cart. Check your cart to complete the order.`,
      tag: 'prescription-ready',
      requireInteraction: true,
    });
  }

  static notifyAppointmentConfirmed(doctorName: string, date: string, time: string): void {
    this.showNotification('Appointment Confirmed! 📅', {
      body: `Your appointment with Dr. ${doctorName} is confirmed for ${date} at ${time}.`,
      tag: `appointment-${date}`,
      requireInteraction: false,
    });
  }

  static notifyPaymentVerified(amount: number, type: string): void {
    this.showNotification('Payment Verified! 💳', {
      body: `Your ${type} payment of ৳${amount.toFixed(2)} has been verified successfully.`,
      tag: `payment-verified`,
      requireInteraction: false,
    });
  }
}

