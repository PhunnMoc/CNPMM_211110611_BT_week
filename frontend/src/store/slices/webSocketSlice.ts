import { io, Socket } from 'socket.io-client';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// WebSocket connection state
interface WebSocketState {
  isConnected: boolean;
  connectionError: string | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
}

// Notification types
export interface Notification {
  id: number;
  type: 'order_update' | 'review_notification' | 'price_change' | 'stock_alert' | 'coupon_expiry' | 'admin_notification' | 'general';
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

// WebSocket slice
const initialState: WebSocketState = {
  isConnected: false,
  connectionError: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
};

const webSocketSlice = createSlice({
  name: 'webSocket',
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      if (action.payload) {
        state.connectionError = null;
        state.reconnectAttempts = 0;
      }
    },
    setConnectionError: (state, action: PayloadAction<string | null>) => {
      state.connectionError = action.payload;
    },
    incrementReconnectAttempts: (state) => {
      state.reconnectAttempts += 1;
    },
    resetReconnectAttempts: (state) => {
      state.reconnectAttempts = 0;
    },
  },
});

export const {
  setConnected,
  setConnectionError,
  incrementReconnectAttempts,
  resetReconnectAttempts,
} = webSocketSlice.actions;

// WebSocket service class
class WebSocketService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private dispatch: any = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.reconnect = this.reconnect.bind(this);
  }

  // Initialize with Redux dispatch
  initialize(dispatch: any) {
    this.dispatch = dispatch;
  }

  // Connect to WebSocket server
  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.token = token;
    const serverUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000'
      : 'ws://localhost:5000';

    this.socket = io(serverUrl, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    this.setupEventListeners();
  }

  // Setup event listeners
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.dispatch?.(setConnected(true));
      this.dispatch?.(resetReconnectAttempts());
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.dispatch?.(setConnected(false));
      
      // Attempt to reconnect if not manually disconnected
      if (reason !== 'io client disconnect' && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.dispatch?.(setConnectionError(error.message));
      this.dispatch?.(incrementReconnectAttempts());
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnect();
      }
    });

    this.socket.on('notification', (notification: Notification) => {
      console.log('Received notification:', notification);
      // Dispatch notification to Redux store
      this.dispatch?.(addNotification(notification));
    });

    this.socket.on('order_update', (data) => {
      console.log('Order update received:', data);
      // Handle order updates
      this.dispatch?.(updateOrderStatus(data));
    });

    this.socket.on('product_update', (data) => {
      console.log('Product update received:', data);
      // Handle product updates (price changes, stock updates)
      this.dispatch?.(updateProductData(data));
    });
  }

  // Reconnect with exponential backoff
  private reconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    this.reconnectTimeout = setTimeout(() => {
      if (this.token && this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log(`Attempting to reconnect... (attempt ${this.reconnectAttempts + 1})`);
        this.connect(this.token);
      }
    }, delay);
  }

  // Disconnect from WebSocket server
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.dispatch?.(setConnected(false));
    this.dispatch?.(setConnectionError(null));
    this.reconnectAttempts = 0;
  }

  // Join a product room for real-time updates
  joinProductRoom(productId: number) {
    if (this.socket?.connected) {
      this.socket.emit('join_product_room', productId);
    }
  }

  // Leave a product room
  leaveProductRoom(productId: number) {
    if (this.socket?.connected) {
      this.socket.emit('leave_product_room', productId);
    }
  }

  // Get connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket instance
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Create singleton instance
export const webSocketService = new WebSocketService();

// Additional Redux actions for notifications
export const addNotification = (notification: Notification) => ({
  type: 'notifications/addNotification',
  payload: notification,
});

export const updateOrderStatus = (orderData: any) => ({
  type: 'orders/updateOrderStatus',
  payload: orderData,
});

export const updateProductData = (productData: any) => ({
  type: 'products/updateProductData',
  payload: productData,
});

export default webSocketSlice.reducer;
