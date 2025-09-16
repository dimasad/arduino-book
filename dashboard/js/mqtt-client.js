class MQTTClient {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.isConnecting = false;
        this.config = {
            host: 'broker.emqx.io',
            port: 8083,
            protocol: 'ws',
            clientId: 'arduino_dashboard_' + Math.random().toString(16).substring(2, 8)
        };
        this.subscribers = new Map();
        this.messageCallbacks = new Map();
        
        this.loadConfig();
        this.setupEventListeners();
    }

    loadConfig() {
        const savedConfig = localStorage.getItem('mqttConfig');
        if (savedConfig) {
            this.config = { ...this.config, ...JSON.parse(savedConfig) };
        }
        this.updateConfigUI();
    }

    saveConfig() {
        localStorage.setItem('mqttConfig', JSON.stringify(this.config));
        this.updateMqttUrlDisplay();
    }

    updateConfigUI() {
        document.getElementById('brokerHost').value = this.config.host;
        document.getElementById('brokerPort').value = this.config.port;
        document.getElementById('brokerProtocol').value = this.config.protocol;
        document.getElementById('clientId').value = this.config.clientId;
        this.updateMqttUrlDisplay();
    }

    updateMqttUrlDisplay() {
        const urlDisplay = document.getElementById('mqttUrl');
        urlDisplay.textContent = `${this.config.host}:${this.config.port}`;
    }

    setupEventListeners() {
        const connectBtn = document.getElementById('connectBtn');
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        const configPanel = document.getElementById('configPanel');
        const saveConfigBtn = document.getElementById('saveConfig');

        connectBtn.addEventListener('click', () => {
            if (this.isConnected) {
                this.disconnect();
            } else {
                this.connect();
            }
        });

        hamburgerMenu.addEventListener('click', () => {
            configPanel.classList.toggle('show');
        });

        saveConfigBtn.addEventListener('click', () => {
            this.updateConfigFromUI();
            this.saveConfig();
            configPanel.classList.remove('show');
            
            // Reconnect if currently connected
            if (this.isConnected) {
                this.disconnect();
                setTimeout(() => this.connect(), 1000);
            }
        });
    }

    updateConfigFromUI() {
        this.config.host = document.getElementById('brokerHost').value.trim();
        this.config.port = parseInt(document.getElementById('brokerPort').value);
        this.config.protocol = document.getElementById('brokerProtocol').value;
        const clientIdInput = document.getElementById('clientId').value.trim();
        if (clientIdInput) {
            this.config.clientId = clientIdInput;
        }
    }

    connect() {
        if (this.isConnecting || this.isConnected) return;

        this.isConnecting = true;
        this.updateConnectionUI('connecting');

        const brokerUrl = `${this.config.protocol}://${this.config.host}:${this.config.port}/mqtt`;
        
        console.log('Connecting to MQTT broker:', brokerUrl);

        this.client = mqtt.connect(brokerUrl, {
            clientId: this.config.clientId,
            keepalive: 60,
            connectTimeout: 30 * 1000,
            reconnectPeriod: 5000,
            clean: true
        });

        this.client.on('connect', () => {
            console.log('Connected to MQTT broker');
            this.isConnected = true;
            this.isConnecting = false;
            this.updateConnectionUI('connected');
            
            // Resubscribe to existing topics
            this.resubscribeAll();
        });

        this.client.on('error', (error) => {
            console.error('MQTT connection error:', error);
            this.isConnecting = false;
            this.isConnected = false;
            this.updateConnectionUI('error');
        });

        this.client.on('close', () => {
            console.log('MQTT connection closed');
            this.isConnected = false;
            this.isConnecting = false;
            this.updateConnectionUI('disconnected');
        });

        this.client.on('message', (topic, message) => {
            this.handleMessage(topic, message.toString());
        });
    }

    disconnect() {
        if (this.client) {
            this.client.end();
            this.client = null;
        }
        this.isConnected = false;
        this.isConnecting = false;
        this.updateConnectionUI('disconnected');
    }

    updateConnectionUI(status) {
        const connectBtn = document.getElementById('connectBtn');
        const statusIndicator = document.getElementById('statusIndicator');

        // Remove all status classes
        connectBtn.classList.remove('connecting', 'connected');
        statusIndicator.classList.remove('connecting', 'connected', 'error');

        switch (status) {
            case 'connecting':
                connectBtn.textContent = 'Connecting...';
                connectBtn.classList.add('connecting');
                statusIndicator.classList.add('connecting');
                break;
            case 'connected':
                connectBtn.textContent = 'Disconnect';
                connectBtn.classList.add('connected');
                statusIndicator.classList.add('connected');
                break;
            case 'error':
                connectBtn.textContent = 'Connect';
                statusIndicator.classList.add('error');
                break;
            case 'disconnected':
            default:
                connectBtn.textContent = 'Connect';
                break;
        }
    }

    subscribe(topic, callback) {
        if (!this.isConnected) {
            console.warn('Cannot subscribe: not connected to MQTT broker');
            return false;
        }

        this.messageCallbacks.set(topic, callback);
        
        this.client.subscribe(topic, (err) => {
            if (err) {
                console.error('Subscription error for topic', topic, ':', err);
                return;
            }
            console.log('Subscribed to topic:', topic);
            this.subscribers.set(topic, true);
        });

        return true;
    }

    unsubscribe(topic) {
        if (!this.isConnected || !this.client) {
            return;
        }

        this.client.unsubscribe(topic, (err) => {
            if (err) {
                console.error('Unsubscription error for topic', topic, ':', err);
                return;
            }
            console.log('Unsubscribed from topic:', topic);
        });

        this.subscribers.delete(topic);
        this.messageCallbacks.delete(topic);
    }

    resubscribeAll() {
        for (const [topic, callback] of this.messageCallbacks) {
            this.client.subscribe(topic, (err) => {
                if (err) {
                    console.error('Resubscription error for topic', topic, ':', err);
                } else {
                    console.log('Resubscribed to topic:', topic);
                    this.subscribers.set(topic, true);
                }
            });
        }
    }

    handleMessage(topic, message) {
        console.log('Received message on topic', topic, ':', message);
        
        const callback = this.messageCallbacks.get(topic);
        if (callback) {
            try {
                // Try to parse as JSON first, fallback to plain text
                let data;
                try {
                    data = JSON.parse(message);
                } catch (e) {
                    // If not JSON, try to parse as number
                    const numValue = parseFloat(message);
                    if (!isNaN(numValue)) {
                        data = { temperature: numValue };
                    } else {
                        data = { raw: message };
                    }
                }
                
                callback(topic, data);
            } catch (error) {
                console.error('Error handling message for topic', topic, ':', error);
            }
        }
    }

    getConnectionStatus() {
        if (this.isConnecting) return 'connecting';
        if (this.isConnected) return 'connected';
        return 'disconnected';
    }
}

// Global MQTT client instance
window.mqttClient = new MQTTClient();