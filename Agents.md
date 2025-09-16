# AI Agents Development Guide

## Repository Overview
This repository contains an Arduino programming textbook and an MQTT dashboard for displaying temperature readings from student Arduino projects.

## Components
1. **LaTeX Textbook**: Located in the root directory (main.tex, etc.)
2. **Arduino Examples**: Located in the `code/` directory 
3. **MQTT Dashboard**: Located in the `dashboard/` directory

## MQTT Dashboard
The dashboard is a static webpage that connects to an MQTT broker to display real-time temperature readings from Arduino devices.

### Features
- Real-time MQTT broker connection
- Temperature gauge displays
- Support for multiple sensor groups
- Responsive design for desktop viewing

### Development
- Pure HTML/CSS/JavaScript implementation
- Uses MQTT.js library for broker connectivity
- Default connection to EMQX public broker
- Configurable topics and gauge management

### Testing
- Open `dashboard/index.html` in a web browser
- Test MQTT connectivity with public broker
- Verify gauge functionality with test data

## Contributing
When making changes:
1. Test all functionality thoroughly
2. Update documentation as needed
3. Ensure responsive design works across browsers
4. Test MQTT connectivity with various brokers