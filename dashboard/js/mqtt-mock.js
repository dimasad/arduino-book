// Mock MQTT client for demonstration when external libraries are blocked
// This provides the same interface as the real MQTT.js library

class MockMQTTClient {
    constructor(brokerUrl, options) {
        this.brokerUrl = brokerUrl;
        this.options = options;
        this.isConnected = false;
        this.subscriptions = new Map();
        this.messageHandlers = {};
        
        console.log('Mock MQTT: Created client for', brokerUrl);
        
        // Simulate connection delay
        setTimeout(() => {
            this.isConnected = true;
            console.log('Mock MQTT: Connected to broker');
            if (this.messageHandlers.connect) {
                this.messageHandlers.connect();
            }
            
            // Start sending mock temperature data
            this.startMockDataSimulation();
        }, 1000);
    }

    on(event, handler) {
        this.messageHandlers[event] = handler;
        return this;
    }

    subscribe(topic, callback) {
        if (!this.isConnected) {
            console.warn('Mock MQTT: Cannot subscribe - not connected');
            if (callback) callback(new Error('Not connected'));
            return;
        }
        
        console.log('Mock MQTT: Subscribed to', topic);
        this.subscriptions.set(topic, true);
        
        if (callback) {
            setTimeout(() => callback(null), 100);
        }
    }

    unsubscribe(topic, callback) {
        console.log('Mock MQTT: Unsubscribed from', topic);
        this.subscriptions.delete(topic);
        
        if (callback) {
            setTimeout(() => callback(null), 100);
        }
    }

    end() {
        console.log('Mock MQTT: Disconnecting');
        this.isConnected = false;
        if (this.messageHandlers.close) {
            this.messageHandlers.close();
        }
        if (this.mockDataInterval) {
            clearInterval(this.mockDataInterval);
        }
    }

    startMockDataSimulation() {
        // Send mock temperature data every 5 seconds
        this.mockDataInterval = setInterval(() => {
            for (const topic of this.subscriptions.keys()) {
                // Generate realistic temperature data (15-30°C with some variation)
                const baseTemp = 20 + Math.sin(Date.now() / 60000) * 5; // Slow sine wave
                const temperature = baseTemp + (Math.random() - 0.5) * 4; // Add some noise
                
                const message = JSON.stringify({
                    temperature: Math.round(temperature * 10) / 10,
                    timestamp: new Date().toISOString(),
                    sensor: topic.split('/').pop()
                });
                
                console.log('Mock MQTT: Sending message to', topic, ':', message);
                
                if (this.messageHandlers.message) {
                    // Create a simple object that mimics Buffer behavior
                    const messageBuffer = {
                        toString: () => message
                    };
                    this.messageHandlers.message(topic, messageBuffer);
                }
            }
        }, 5000);
    }
}

// Mock the global mqtt object
window.mqtt = {
    connect: (brokerUrl, options) => {
        return new MockMQTTClient(brokerUrl, options);
    }
};

console.log('Mock MQTT library loaded - will simulate temperature data every 5 seconds');