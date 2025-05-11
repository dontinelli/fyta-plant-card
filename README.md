# Home Assistant Fyta Plant Card

A custom card for displaying [Fyta plant](https://fyta.de/) information on your Home Assistant dashboard.

![Screenshot](assets/card-image.png)

## Prerequisites

- [Fyta integration](https://www.home-assistant.io/integrations/fyta/) must be installed and configured in Home Assistant

## Features

- Displays plant image, name, and health status
- Shows sensor values with color-coded status indicators
- Customizable sensor display (moisture, light, temperature, nutrition, salinity)
- Interactive elements - click any sensor to view detailed data
- Battery status indicator with configurable threshold
- Compact display mode for smaller dashboards

## Installation

### HACS Installation (Recommended)

1. Add this repository as a custom repository in HACS:
   - Go to HACS → Frontend
   - Click the three dots in the top right corner
   - Select "Custom repositories"
   - Add `FYTA-GmbH/fyta-plant-card` with category "Lovelace"
2. Install "Fyta Plant Card" from HACS
3. Refresh your browser

### Manual Installation

1. Download `fyta-plant-card.js` from the `dist` folder in this repository
2. Copy it to your `config/www` directory
3. Add the resource in your dashboard:
   - Go to your dashboard
   - Click "Edit Dashboard" → "Manage Resources"
   - Add `/local/fyta-plant-card.js` as a JavaScript module
4. Refresh your browser

## Configuration

The card includes a visual editor for easy configuration. For manual YAML configuration, use these options:

| Name              | Type    | Description                                         | Default     |
|-------------------|---------|-----------------------------------------------------|-------------|
| type              | string  | `custom:fyta-plant-card`                            | (required)  |
| device_id         | string  | Device ID of the Fyta plant                         | (required)  |
| title             | string  | Card title                                          | Plant name  |
| display_mode      | string  | `full` or `compact`                                 | `full`      |
| battery_threshold | number  | Battery level (%) at which icon appears (0-100)     | `10`        |
| show_light        | boolean | Show light sensor                                   | `true`      |
| light_order       | string  | Display order for light (1-5)                       | `2`         |
| show_moisture     | boolean | Show moisture sensor                                | `true`      |
| moisture_order    | string  | Display order for moisture (1-5)                    | `1`         |
| show_temperature  | boolean | Show temperature sensor                             | `true`      |
| temperature_order | string  | Display order for temperature (1-5)                 | `3`         |
| show_nutrition    | boolean | Show nutrition status                               | `true`      |
| nutrition_order   | string  | Display order for nutrition (1-5)                   | `4`         |
| show_salinity     | boolean | Show salinity sensor                                | `false`     |
| salinity_order    | string  | Display order for salinity (1-5)                    | `5`         |

### Display Order

Sensors are arranged based on their order value (1-5). When there's an odd number of visible sensors, the one with the highest order number will appear full-width at the bottom.

### Battery Display

Set `battery_threshold` to control when the battery icon appears:
- `0`: Never show the battery icon
- `10` (default): Show only when battery is 10% or below
- `100`: Always show the battery icon
- Any value in between: Show when battery level is at or below this percentage

## Example Configuration

```yaml
type: 'custom:fyta-plant-card'
device_id: 12345abc67890def123456
title: My Monstera
display_mode: compact
battery_threshold: 20
show_light: true
light_order: '2'
show_moisture: true
moisture_order: '1'
show_temperature: true
temperature_order: '3'
show_nutrition: true
nutrition_order: '4'
show_salinity: false
```

## Video Tutorial

For a visual guide on installation and configuration:

[![Fyta Plant Card Installation Tutorial](https://img.youtube.com/vi/KS1u91yYSsE/0.jpg)](https://youtu.be/KS1u91yYSsE)

## Troubleshooting

- Make sure your Fyta integration is properly set up with connected plants
- Verify your plant's device ID is correct
- Check browser console for any error messages
- If card doesn't appear after installation, clear your browser cache

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0).
