import { authService } from "./auth";

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  color: string;
  showToast?: boolean;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private listeners: { [key: string]: ((data: any) => void)[] } = {};
  private notifications: Notification[] = [];
  private notificationCallbacks: ((notifications: Notification[]) => void)[] = [];
  private toastCallbacks: ((notification: Notification) => void)[] = [];
  private isConnected = false;

  connect(): void {
    console.log("🔌 WebSocket connect() called");
    console.log("Current WebSocket state:", this.ws?.readyState);
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log("✅ WebSocket already connected");
      return;
    }

    try {
      const token = authService.getAccessToken();
      console.log("🔑 Access token:", token ? `${token.substring(0, 20)}...` : "No token");
      
      if (!token) {
        console.error("❌ No access token available for WebSocket connection");
        return;
      }

      // Connect to WebSocket with token as query parameter
      const wsUrl = `ws://localhost:8000/ws/idatagenerator?token=${token}`;
      console.log("🌐 Connecting to WebSocket:", wsUrl);
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("🎉 WebSocket connected successfully!");
        console.log("✅ Connection established");
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Subscribe to all idatagenerator events
        this.subscribeToEvents();
      };

      this.ws.onmessage = (event) => {
        try {
          console.log("📨 Raw WebSocket message received:", event.data);
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log("📋 Parsed WebSocket message:", message);
          
          this.handleMessage(message);
        } catch (error) {
          console.error("❌ Error parsing WebSocket message:", error);
        }
      };

      this.ws.onclose = (event) => {
        console.log("🔌 WebSocket connection closed:", event);
        console.log("📊 Close code:", event.code);
        console.log("📝 Close reason:", event.reason);
        this.isConnected = false;
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        this.isConnected = false;
      };
    } catch (error) {
      console.error("❌ Failed to connect to WebSocket:", error);
      this.handleReconnect();
    }
  }

  private subscribeToEvents(): void {
    console.log("📡 Subscribing to events...");
    const events = [
      'idatagenerator_project_created',
      'idatagenerator_test_case_created',
      'idatagenerator_mdd_processing_start',
      'idatagenerator_mdd_processing_update',
      'idatagenerator_mdd_processed',
      'idatagenerator_test_case_processing_start',
      'idatagenerator_data_generation_progress',
      'idatagenerator_respondent_completed',
      'idatagenerator_test_case_completed',
      'idatagenerator_error'
    ];

    events.forEach(event => {
      console.log(`📝 Subscribing to => ${event}`);
      this.subscribe(event);
    });
    
    console.log("✅ All event subscriptions sent");
  }

  private subscribe(eventType: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const subscribeMessage = {
        type: 'subscribe',
        event: eventType
      };
      console.log("📤 Sending subscription message:", subscribeMessage);
      this.ws.send(JSON.stringify(subscribeMessage));
    } else {
      console.error("❌ Cannot subscribe: WebSocket not connected");
      console.log("WebSocket state:", this.ws?.readyState);
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    console.log("🔄 Handling message:", message);
    
    // Create notification from message
    const notification = this.createNotification(message);
    if (notification) {
      console.log("🔔 Created notification:", notification);
      this.addNotification(notification);
      
      // ONLY trigger toast callbacks - NO direct DOM manipulation
      if (notification.showToast) {
        console.log("🍞 Triggering toast callbacks for notification:", notification.title);
        console.log("🍞 Number of toast callbacks:", this.toastCallbacks.length);
        
        // Trigger callbacks synchronously to prevent duplicates
        this.toastCallbacks.forEach((callback, index) => {
          try {
            console.log(`🍞 Calling toast callback ${index + 1}/${this.toastCallbacks.length} for:`, notification.id);
            callback(notification);
          } catch (error) {
            console.error(`❌ Error in toast callback ${index + 1}:`, error);
          }
        });
      }
    } else {
      console.log("⚠️ No notification created for message type:", message.type);
    }

    // Trigger event listeners
    if (this.listeners[message.type]) {
      console.log(`🎯 Triggering ${this.listeners[message.type].length} listeners for:`, message.type);
      this.listeners[message.type].forEach(callback => {
        console.log(`📤 Calling listener with data:`, message);
        callback(message);
      });
    } else {
      console.log(`⚠️ No listeners found for message type: ${message.type}`);
    }
  }

  private createNotification(message: WebSocketMessage): Notification | null {
    const notificationConfig = this.getNotificationConfig(message.type);
    if (!notificationConfig) {
      console.log("⚠️ No notification config found for:", message.type);
      return null;
    }

    // Create unique ID to prevent duplicates
    const uniqueId = `${message.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const notification = {
      id: uniqueId,
      type: message.type,
      title: notificationConfig.title,
      message: notificationConfig.getMessage(message),
      timestamp: message.timestamp || new Date().toISOString(),
      read: false,
      priority: notificationConfig.priority,
      color: notificationConfig.color,
      showToast: notificationConfig.showToast
    };

    console.log("✨ Created notification:", notification);
    return notification;
  }

  private getNotificationConfig(eventType: string) {
    const configs = {
      'idatagenerator_project_created': {
        title: 'Project Created',
        getMessage: (data: any) => `New project "${data.project_name || 'Unknown'}" has been created successfully`,
        priority: 'medium' as const,
        color: 'border-green-500',
        showToast: true
      },
      'idatagenerator_test_case_created': {
        title: 'Test Case Created',
        getMessage: (data: any) => `Test case "${data.test_case_name || 'Unknown'}" has been created successfully`,
        priority: 'medium' as const,
        color: 'border-blue-500',
        showToast: true
      },
      'idatagenerator_mdd_processing_start': {
        title: 'MDD Processing Started',
        getMessage: (data: any) => `MDD processing has started for project "${data.project_name || 'project'}"`,
        priority: 'medium' as const,
        color: 'border-yellow-500',
        showToast: false
      },
      'idatagenerator_mdd_processing_update': {
        title: 'MDD Processing Update',
        getMessage: (data: any) => `MDD processing: ${data.progress || 0}% complete`,
        priority: 'low' as const,
        color: 'border-blue-500',
        showToast: false
      },
      'idatagenerator_mdd_processed': {
        title: 'MDD Processing Completed',
        getMessage: (data: any) => `MDD processing completed for "${data.project_name || 'project'}" - Found ${data.variables_count || 0} variables`,
        priority: 'medium' as const,
        color: 'border-green-500',
        showToast: true
      },
      'idatagenerator_test_case_processing_start': {
        title: 'Test Case Processing Started',
        getMessage: (data: any) => `Test case processing started for "${data.test_case_name || 'test case'}"`,
        priority: 'medium' as const,
        color: 'border-purple-500',
        showToast: false
      },
      'idatagenerator_data_generation_progress': {
        title: 'Data Generation Progress',
        getMessage: (data: any) => `Data generation: ${data.progress || 0}% complete (${data.records_generated || 0} records)`,
        priority: 'low' as const,
        color: 'border-indigo-500',
        showToast: false
      },
      'idatagenerator_respondent_completed': {
        title: 'Respondent Completed',
        getMessage: (data: any) => `Respondent ${data.respondent_id || 'Unknown'} completed successfully`,
        priority: 'low' as const,
        color: 'border-green-500',
        showToast: false
      },
      'idatagenerator_test_case_completed': {
        title: 'Test Case Completed',
        getMessage: (data: any) => `Test case "${data.test_case_name || 'Unknown'}" completed successfully`,
        priority: 'high' as const,
        color: 'border-green-500',
        showToast: true
      },
      'idatagenerator_error': {
        title: 'Error Occurred',
        getMessage: (data: any) => `Error: ${data.error_message || 'Unknown error occurred'}`,
        priority: 'high' as const,
        color: 'border-red-500',
        showToast: true
      }
    };

    return configs[eventType as keyof typeof configs];
  }

  private addNotification(notification: Notification): void {
    console.log("➕ Adding notification to list:", notification);
    this.notifications.unshift(notification);
    
    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    console.log(`📊 Total notifications: ${this.notifications.length}`);
    console.log(`🔔 Notifying ${this.notificationCallbacks.length} callbacks`);
    
    // Notify all callbacks
    this.notificationCallbacks.forEach(callback => callback(this.notifications));
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error("❌ Max reconnection attempts reached");
    }
  }

  // Add status method for debugging
  getStatus(): object {
    return {
      isConnected: this.isConnected,
      wsState: this.ws?.readyState,
      reconnectAttempts: this.reconnectAttempts,
      notificationCount: this.notifications.length,
      listenerCount: Object.keys(this.listeners).length,
      callbackCount: this.notificationCallbacks.length,
      toastCallbackCount: this.toastCallbacks.length
    };
  }

  // Rest of your methods remain the same...
  addEventListener(eventType: string, callback: (data: any) => void): void {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(callback);
  }

  removeEventListener(eventType: string, callback: (data: any) => void): void {
    if (this.listeners[eventType]) {
      this.listeners[eventType] = this.listeners[eventType].filter(cb => cb !== callback);
    }
  }

  onNotificationsChange(callback: (notifications: Notification[]) => void): void {
    this.notificationCallbacks.push(callback);
  }

  removeNotificationsListener(callback: (notifications: Notification[]) => void): void {
    this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
  }

  onToastNotification(callback: (notification: Notification) => void): void {
    console.log("📝 Registering toast callback. Total callbacks will be:", this.toastCallbacks.length + 1);
    
    // Check if this callback is already registered to prevent duplicates
    if (!this.toastCallbacks.includes(callback)) {
      this.toastCallbacks.push(callback);
      console.log("✅ Toast callback registered successfully");
    } else {
      console.log("⚠️ Toast callback already registered, skipping");
    }
  }

  removeToastListener(callback: (notification: Notification) => void): void {
    const initialLength = this.toastCallbacks.length;
    this.toastCallbacks = this.toastCallbacks.filter(cb => cb !== callback);
    console.log(`📝 Removed toast callback. Callbacks: ${initialLength} → ${this.toastCallbacks.length}`);
  }

  // Debug method to check callback count
  getToastCallbackCount(): number {
    return this.toastCallbacks.length;
  }

  getNotifications(): Notification[] {
    return this.notifications;
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notificationCallbacks.forEach(callback => callback(this.notifications));
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.notificationCallbacks.forEach(callback => callback(this.notifications));
  }

  disconnect(): void {
    console.log("🔌 Disconnecting WebSocket");
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}

export const webSocketService = new WebSocketService();

// Add global access for debugging
// (window as any).webSocketService = webSocketService;