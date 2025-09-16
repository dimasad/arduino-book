class Dashboard {
    constructor() {
        this.gauges = [];
        this.gaugesContainer = document.getElementById('gaugesGrid');
        
        this.setupEventListeners();
        this.loadSavedGauges();
        this.createDefaultGauge();
        this.setupMQTTEventHandlers();
    }

    setupEventListeners() {
        // Add gauge button
        const addGaugeBtn = document.getElementById('addGaugeBtn');
        addGaugeBtn.addEventListener('click', () => {
            this.showAddGaugeModal();
        });

        // Modal controls
        const createGaugeBtn = document.getElementById('createGauge');
        const cancelGaugeBtn = document.getElementById('cancelGauge');
        const modal = document.getElementById('addGaugeModal');

        createGaugeBtn.addEventListener('click', () => {
            this.createGaugeFromModal();
        });

        cancelGaugeBtn.addEventListener('click', () => {
            this.hideAddGaugeModal();
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideAddGaugeModal();
            }
        });

        // Handle Enter key in modal inputs
        document.getElementById('gaugeTopic').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.createGaugeFromModal();
            }
        });

        document.getElementById('gaugeLabel').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.createGaugeFromModal();
            }
        });
    }

    setupMQTTEventHandlers() {
        // Listen for MQTT connection events
        const originalConnect = window.mqttClient.connect.bind(window.mqttClient);
        const originalDisconnect = window.mqttClient.disconnect.bind(window.mqttClient);

        window.mqttClient.connect = () => {
            originalConnect();
            // Update all gauges when connection is established
            setTimeout(() => {
                if (window.mqttClient.getConnectionStatus() === 'connected') {
                    this.onMQTTConnected();
                }
            }, 1000);
        };

        window.mqttClient.disconnect = () => {
            originalDisconnect();
            this.onMQTTDisconnected();
        };
    }

    onMQTTConnected() {
        console.log('Dashboard: MQTT connected, updating all gauges');
        
        // Process any pending subscriptions
        if (window.pendingSubscriptions) {
            window.pendingSubscriptions.forEach(({ topic, callback }) => {
                window.mqttClient.subscribe(topic, callback);
            });
            window.pendingSubscriptions = [];
        }
        
        // Update all gauge statuses
        this.gauges.forEach(gauge => {
            gauge.onMQTTStatusChange('connected');
        });
    }

    onMQTTDisconnected() {
        console.log('Dashboard: MQTT disconnected, updating all gauges');
        this.gauges.forEach(gauge => {
            gauge.onMQTTStatusChange('disconnected');
        });
    }

    showAddGaugeModal() {
        const modal = document.getElementById('addGaugeModal');
        modal.classList.add('show');
        
        // Clear previous values
        document.getElementById('gaugeTopic').value = '';
        document.getElementById('gaugeLabel').value = '';
        
        // Focus on topic input
        document.getElementById('gaugeTopic').focus();
    }

    hideAddGaugeModal() {
        const modal = document.getElementById('addGaugeModal');
        modal.classList.remove('show');
    }

    createGaugeFromModal() {
        const topic = document.getElementById('gaugeTopic').value.trim();
        const label = document.getElementById('gaugeLabel').value.trim();

        if (!topic) {
            alert('Please enter an MQTT topic');
            return;
        }

        // Check if topic already exists
        const existingGauge = this.gauges.find(gauge => gauge.topic === topic);
        if (existingGauge) {
            alert('A gauge for this topic already exists');
            return;
        }

        this.createGauge(topic, label || topic);
        this.hideAddGaugeModal();
    }

    createGauge(topic, label) {
        const gauge = new TemperatureGauge(topic, label, this.gaugesContainer);
        this.gauges.push(gauge);
        
        // Override the destroy method to remove from our array
        const originalDestroy = gauge.destroy.bind(gauge);
        gauge.destroy = () => {
            originalDestroy();
            this.removeGaugeFromArray(gauge);
            this.saveGauges();
        };

        this.saveGauges();
        return gauge;
    }

    removeGaugeFromArray(gauge) {
        const index = this.gauges.indexOf(gauge);
        if (index > -1) {
            this.gauges.splice(index, 1);
        }
    }

    createDefaultGauge() {
        // Only create default gauge if no saved gauges exist
        if (this.gauges.length === 0) {
            this.createGauge('wvu-mae411L/group_1', 'Group 1 Temperature');
        }
    }

    saveGauges() {
        const gaugeData = this.gauges.map(gauge => ({
            topic: gauge.topic,
            label: gauge.label
        }));
        localStorage.setItem('dashboardGauges', JSON.stringify(gaugeData));
    }

    loadSavedGauges() {
        const savedGauges = localStorage.getItem('dashboardGauges');
        if (savedGauges) {
            try {
                const gaugeData = JSON.parse(savedGauges);
                gaugeData.forEach(({ topic, label }) => {
                    this.createGauge(topic, label);
                });
            } catch (error) {
                console.error('Error loading saved gauges:', error);
            }
        }
    }

    // Public method to add a gauge programmatically
    addGauge(topic, label) {
        return this.createGauge(topic, label);
    }

    // Public method to remove all gauges
    clearAllGauges() {
        this.gauges.forEach(gauge => gauge.destroy());
        this.gauges = [];
        this.saveGauges();
    }

    // Public method to get all current topics
    getCurrentTopics() {
        return this.gauges.map(gauge => gauge.topic);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
    
    // Add some demo functionality for testing
    console.log('Arduino MQTT Dashboard initialized');
    console.log('Available methods:');
    console.log('- dashboard.addGauge(topic, label) - Add a new gauge');
    console.log('- dashboard.clearAllGauges() - Remove all gauges');
    console.log('- dashboard.getCurrentTopics() - Get list of current topics');
    console.log('- mqttClient.connect() - Connect to MQTT broker');
    console.log('- mqttClient.disconnect() - Disconnect from MQTT broker');
});

// Global function for removing gauges (called from gauge HTML)
window.removeGauge = function(gaugeId) {
    const element = document.getElementById(gaugeId);
    if (element && element.gaugeInstance) {
        element.gaugeInstance.destroy();
    }
};