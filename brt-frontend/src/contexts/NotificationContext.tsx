import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import echo from '../utils/echo';  // Temporarily disable Laravel Echo

export interface Notification {
  id: string;
  title: string;
  message: string;
  action: 'created' | 'updated' | 'deleted' | 'redeemed';
  timestamp: string;
  brt: {
    id: string;
    brt_code: string;
    reserved_amount: string | number;
    status: string;
    user: {
      name: string;
      email: string;
    };
  };
  read?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    console.log('🔔 [RAW PUSHER] Setting up real-time notifications...');

    // Test manual browser notification first
    if (Notification.permission === 'granted') {
      console.log('🔔 Testing manual browser notification...');
      try {
        new Notification('🔔 React Setup Test', { 
          body: 'React notifications are working!',
          icon: '/favicon.ico'
        });
        console.log('🔔 ✅ Manual notification works!');
      } catch (error) {
        console.error('🔔 ❌ Manual notification failed:', error);
      }
    }

    // Use raw Pusher like the working test page
    let pusher: any = null;
    let channel: any = null;
    let isDestroyed = false;

    try {
      // Initialize Pusher with exact same config as test page
      // @ts-ignore
      pusher = new window.Pusher('76a59b72f9aad3c44f86', {
        cluster: 'us3',
        forceTLS: true,
        encrypted: true
      });

      console.log('🔔 Raw Pusher created:', pusher);

      // Connection event handlers
      pusher.connection.bind('connected', () => {
        if (isDestroyed) return;
        console.log('🔔 ✅ Raw Pusher connected successfully!');
        console.log('🔔 Socket ID:', pusher.connection.socket_id);
        
        // Subscribe to channel
        channel = pusher.subscribe('brt-notifications');
        console.log('🔔 Channel created:', channel);
        
        // Set up event listener
        channel.bind('brt.notification', (data: Notification) => {
          if (isDestroyed) return;
          
          console.log('🔥 ✅ REACT INCOMING NOTIFICATION EVENT RECEIVED!');
          console.log('🔥 📋 Raw data:', data);
          console.log('🔥 📋 JSON:', JSON.stringify(data, null, 2));
          
          // Add notification to state
          const notification = { ...data, read: false };
          setNotifications(prev => [notification, ...prev.slice(0, 49)]);
          
          // Show browser notification
          if (Notification.permission === 'granted') {
            console.log('🔔 📱 Showing React browser notification...');
            try {
              new Notification(data.title, {
                body: data.message,
                icon: '/favicon.ico',
                tag: data.brt.brt_code,
              });
              console.log('🔔 ✅ React browser notification shown!');
            } catch (error) {
              console.error('🔔 ❌ React browser notification failed:', error);
            }
          }
        });

        // Subscription success handler
        channel.bind('pusher:subscription_succeeded', () => {
          if (isDestroyed) return;
          console.log('🔔 ✅ React successfully subscribed to brt-notifications channel');
        });
        
        // Error handler
        channel.bind('pusher:subscription_error', (error: any) => {
          console.error('🔔 ❌ React subscription error:', error);
        });
      });
      
      pusher.connection.bind('disconnected', () => {
        console.log('🔔 ❌ Raw Pusher disconnected');
      });
      
      pusher.connection.bind('error', (error: any) => {
        console.error('🔔 ❌ Raw Pusher connection error:', error);
      });

      pusher.connection.bind('state_change', (states: any) => {
        console.log('🔔 🔄 Raw Pusher state change:', states);
      });

      console.log('🔔 Initial Raw Pusher state:', pusher.connection.state);

    } catch (error) {
      console.error('🔔 ❌ Failed to initialize Raw Pusher:', error);
    }

    // Request notification permission
    console.log('🔔 Current notification permission:', Notification.permission);
    if (Notification.permission === 'default') {
      console.log('🔔 Requesting notification permission...');
      Notification.requestPermission().then(permission => {
        console.log('🔔 Notification permission granted:', permission);
      });
    } else {
      console.log('🔔 Notification permission already set:', Notification.permission);
    }

    return () => {
      console.log('🔔 Cleaning up Raw Pusher notifications...');
      isDestroyed = true;
      if (channel) {
        pusher.unsubscribe('brt-notifications');
      }
      if (pusher) {
        pusher.disconnect();
      }
    };
  }, []);

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        markAsRead,
        markAllAsRead,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
