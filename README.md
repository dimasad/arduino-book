# Arduino Book & MQTT Dashboard

This repository contains an Arduino programming textbook and an MQTT dashboard for monitoring temperature readings from student Arduino projects.

## Components

### 📚 Arduino Programming Textbook
A comprehensive LaTeX-based textbook covering Arduino programming fundamentals.

- **Location**: Root directory (`main.tex`, supporting files)
- **Build**: Automated via GitHub Actions (produces PDF releases)
- **Examples**: Arduino code examples in `code/` directory

### 🌡️ MQTT Temperature Dashboard
A web-based dashboard for real-time monitoring of Arduino temperature sensors via MQTT.

- **Location**: `dashboard/` directory
- **Features**: 
  - Real-time MQTT broker connectivity
  - Temperature gauge displays
  - Support for multiple sensor groups
  - Responsive design for desktop viewing

#### Quick Start
1. Open `dashboard/index.html` in a web browser
2. Connect to the default EMQX public broker
3. Add gauges for your Arduino sensor topics

#### Default Configuration
- **MQTT Broker**: EMQX public broker (broker.emqx.io:8083)
- **Default Topic**: `wvu-mae411L/group_1`
- **Protocol**: MQTT over WebSockets

## Usage

### For Students
1. Program your Arduino to publish temperature data to MQTT topics
2. Use the web dashboard to monitor your sensor readings
3. Follow the textbook for programming guidance

### For Instructors
1. Access the dashboard to monitor all student groups
2. Add new gauge displays for additional groups
3. Configure custom MQTT brokers as needed

## Development
See `Agents.md` for detailed development guidelines and architecture information.
