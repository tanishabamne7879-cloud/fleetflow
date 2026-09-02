class WebSocketService {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.listeners = {};
        this.isConnected = false;
    }

    connect(clientId = null) {
        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
        const url = clientId ? `${wsUrl}/ws?client_id=${clientId}` : `${wsUrl}/ws`;
        
        try {
            this.ws = new WebSocket(url);
            
            this.ws.onopen = () => {
                console.log('✅ WebSocket connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.emit('connected', { message: 'WebSocket connected successfully' });
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('WebSocket message error:', error);
                }
            };
            
            this.ws.onclose = () => {
                console.log('❌ WebSocket disconnected');
                this.isConnected = false;
                this.emit('disconnected', { message: 'WebSocket disconnected' });
                this.reconnect();
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.emit('error', error);
            };
            
        } catch (error) {
            console.error('WebSocket connection error:', error);
            this.reconnect();
        }
    }

    reconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnect attempts reached');
            return;
        }
        
        this.reconnectAttempts++;
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
        
        setTimeout(() => {
            this.connect();
        }, this.reconnectDelay);
    }

    handleMessage(data) {
        const { type, ...payload } = data;
        
        switch(type) {
            case 'ping':
                this.send({ type: 'pong' });
                break;
            case 'pong':
                // Heartbeat received
                break;
            case 'location_update':
                this.emit('location_update', payload.data);
                break;
            case 'vehicle_update':
                this.emit('vehicle_update', payload.data);
                break;
            case 'notification':
                this.emit('notification', payload.data);
                break;
            default:
                this.emit('message', data);
        }
    }

    send(data) {
        if (this.isConnected && this.ws) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket is not connected');
        }
    }

    subscribe(vehicleId) {
        this.send({
            type: 'subscribe',
            vehicle_id: vehicleId
        });
    }

    unsubscribe(vehicleId) {
        this.send({
            type: 'unsubscribe',
            vehicle_id: vehicleId
        });
    }

    sendLocation(data) {
        this.send({
            type: 'location_update',
            data: data
        });
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    emit(event, data) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Event handler error:', error);
            }
        });
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
    }

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts
        };
    }
}

const wsService = new WebSocketService();
export default wsService;