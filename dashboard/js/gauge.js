class TemperatureGauge {
    constructor(topic, label, container) {
        this.topic = topic;
        this.label = label || topic;
        this.container = container;
        this.currentValue = null;
        this.lastUpdate = null;
        this.element = null;
        
        this.createGaugeElement();
        this.setupMQTTSubscription();
    }

    createGaugeElement() {
        const gaugeId = 'gauge_' + Math.random().toString(16).substring(2, 8);
        
        const gaugeHTML = `
            <div class="gauge-container" id="${gaugeId}">
                <div class="gauge-header">
                    <div class="gauge-title">${this.label}</div>
                    <button class="gauge-remove" onclick="removeGauge('${gaugeId}')">✕</button>
                </div>
                <div class="gauge-display">
                    <div class="gauge-circle">
                        <div class="gauge-inner">
                            <div class="gauge-value">--</div>
                            <div class="gauge-unit">°C</div>
                        </div>
                    </div>
                </div>
                <div class="gauge-topic">${this.topic}</div>
                <div class="gauge-status disconnected">No data</div>
            </div>
        `;
        
        this.container.insertAdjacentHTML('beforeend', gaugeHTML);
        this.element = document.getElementById(gaugeId);
        
        // Store reference to this gauge instance
        this.element.gaugeInstance = this;
    }

    setupMQTTSubscription() {
        const callback = (topic, data) => {
            this.updateValue(data);
        };
        
        // Try to subscribe immediately if connected
        if (window.mqttClient && window.mqttClient.getConnectionStatus() === 'connected') {
            window.mqttClient.subscribe(this.topic, callback);
        } else {
            // Store callback for when connection is established
            if (!window.pendingSubscriptions) {
                window.pendingSubscriptions = [];
            }
            window.pendingSubscriptions.push({ topic: this.topic, callback });
        }
    }

    updateValue(data) {
        let temperature;
        
        // Handle different data formats
        if (typeof data === 'number') {
            temperature = data;
        } else if (data && typeof data === 'object') {
            // Try different possible property names
            temperature = data.temperature || data.temp || data.value || data.data;
            
            // If still no temperature found, try to parse the first numeric value
            if (temperature === undefined) {
                const values = Object.values(data);
                const numValue = values.find(v => typeof v === 'number' || !isNaN(parseFloat(v)));
                if (numValue !== undefined) {
                    temperature = parseFloat(numValue);
                }
            }
        } else if (typeof data === 'string') {
            temperature = parseFloat(data);
        }
        
        if (temperature !== undefined && !isNaN(temperature)) {
            this.currentValue = parseFloat(temperature.toFixed(1));
            this.lastUpdate = new Date();
            this.renderValue();
            this.updateStatus('connected');
        } else {
            console.warn('Could not parse temperature from data:', data);
            this.updateStatus('no-data');
        }
    }

    renderValue() {
        if (!this.element) return;
        
        const valueElement = this.element.querySelector('.gauge-value');
        const circleElement = this.element.querySelector('.gauge-circle');
        
        if (valueElement && this.currentValue !== null) {
            valueElement.textContent = this.currentValue.toFixed(1);
            
            // Update gauge color based on temperature range
            let color;
            if (this.currentValue < 0) {
                color = '#007bff'; // Blue for freezing
            } else if (this.currentValue < 10) {
                color = '#17a2b8'; // Cyan for cold
            } else if (this.currentValue < 20) {
                color = '#28a745'; // Green for cool
            } else if (this.currentValue < 30) {
                color = '#ffc107'; // Yellow for warm
            } else if (this.currentValue < 40) {
                color = '#fd7e14'; // Orange for hot
            } else {
                color = '#dc3545'; // Red for very hot
            }
            
            // Update the gauge circle background
            if (circleElement) {
                const percentage = Math.min(Math.max((this.currentValue + 10) / 60, 0), 1); // Map -10°C to 50°C to 0-1
                circleElement.style.background = `conic-gradient(from 180deg, ${color} 0deg, ${color} ${percentage * 270}deg, #e9ecef ${percentage * 270}deg, #e9ecef 360deg)`;
            }
        }
    }

    updateStatus(status) {
        if (!this.element) return;
        
        const statusElement = this.element.querySelector('.gauge-status');
        if (!statusElement) return;
        
        // Remove all status classes
        statusElement.classList.remove('connected', 'disconnected', 'no-data');
        
        switch (status) {
            case 'connected':
                statusElement.classList.add('connected');
                statusElement.textContent = `Updated: ${this.lastUpdate ? this.lastUpdate.toLocaleTimeString() : 'Now'}`;
                break;
            case 'no-data':
                statusElement.classList.add('no-data');
                statusElement.textContent = 'Waiting for data...';
                break;
            case 'disconnected':
            default:
                statusElement.classList.add('disconnected');
                statusElement.textContent = 'MQTT Disconnected';
                break;
        }
    }

    destroy() {
        // Unsubscribe from MQTT topic
        if (window.mqttClient) {
            window.mqttClient.unsubscribe(this.topic);
        }
        
        // Remove DOM element
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }

    // Method to handle MQTT connection status changes
    onMQTTStatusChange(status) {
        if (status === 'connected') {
            // Resubscribe when connection is restored
            this.setupMQTTSubscription();
            this.updateStatus('connected');
        } else {
            this.updateStatus('disconnected');
        }
    }
}

// Global function to remove gauge (called from HTML)
function removeGauge(gaugeId) {
    const element = document.getElementById(gaugeId);
    if (element && element.gaugeInstance) {
        element.gaugeInstance.destroy();
    }
}