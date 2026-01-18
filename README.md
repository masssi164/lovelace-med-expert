# Med Expert Card

A custom Lovelace card for [Home Assistant](https://www.home-assistant.io/) that provides a beautiful dashboard for managing medications with the [med-expert](https://github.com/flotterotter/med-expert) integration.

[![GitHub Release][releases-shield]][releases]
[![License][license-shield]](LICENSE)
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)

![Project Maintenance][maintenance-shield]
[![GitHub Activity][commits-shield]][commits]

## Features

- 📋 **Medication Dashboard** - View all your medications at a glance
- ✅ **Quick Actions** - Take, skip, or snooze medications with one tap
- 📊 **Adherence Tracking** - See your medication adherence rate
- 📦 **Inventory Warnings** - Get notified when supplies are running low
- 🧙 **CRUD Wizard** - Add and edit medications with an intuitive step-by-step wizard
- 🎨 **Themeable** - Inherits your Home Assistant theme colors
- 🌍 **Localized** - Available in English and German
- 📱 **Responsive** - Looks great on mobile, tablet, and desktop

## Screenshots

*Coming soon*

## Prerequisites

This card requires the [med-expert integration](https://github.com/flotterotter/med-expert) to be installed and configured in Home Assistant.

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Go to "Frontend" section
3. Click the "+" button
4. Search for "Med Expert Card"
5. Click "Download"
6. Restart Home Assistant

### Manual Installation

1. Download `med-expert-card.js` from the [latest release](https://github.com/flotterotter/lovelace-med-expert/releases)
2. Copy it to `/config/www/community/med-expert-card/med-expert-card.js`
3. Add the resource in your Lovelace configuration:

```yaml
resources:
  - url: /local/community/med-expert-card/med-expert-card.js
    type: module
```

4. Restart Home Assistant

## Configuration

Add the card to your dashboard using the UI editor or YAML.

### Using the UI Editor

1. Click "Add Card" in your dashboard
2. Search for "Med Expert Card"
3. Select your med-expert profile
4. Configure display options as desired

### YAML Configuration

```yaml
type: custom:med-expert-card
entry_id: YOUR_ENTRY_ID
title: My Medications
show_header: true
show_adherence: true
show_inventory_warnings: true
show_prn: true
compact: false
```

## Options

| Name                     | Type    | Required | Default      | Description                                      |
| ------------------------ | ------- | -------- | ------------ | ------------------------------------------------ |
| `type`                   | string  | Yes      |              | `custom:med-expert-card`                         |
| `entry_id`               | string  | Yes      |              | The med-expert integration entry ID              |
| `title`                  | string  | No       | Profile name | Custom title for the card                        |
| `show_header`            | boolean | No       | `true`       | Show the card header with title and adherence    |
| `show_adherence`         | boolean | No       | `true`       | Show adherence percentage badge in header        |
| `show_inventory_warnings`| boolean | No       | `true`       | Show low inventory warnings on medications       |
| `show_prn`               | boolean | No       | `true`       | Show PRN (as-needed) medications                 |
| `compact`                | boolean | No       | `false`      | Use compact display mode for narrow spaces       |

## Theming

The card uses CSS custom properties that inherit from your Home Assistant theme. You can customize these in your theme or using [card-mod](https://github.com/thomasloven/lovelace-card-mod):

```yaml
type: custom:med-expert-card
entry_id: YOUR_ENTRY_ID
card_mod:
  style: |
    :host {
      --med-expert-primary-color: #ff6b6b;
      --med-expert-status-ok: #51cf66;
      --med-expert-status-due: #fcc419;
      --med-expert-status-missed: #ff6b6b;
    }
```

### Available CSS Variables

| Variable                          | Default                           | Description                |
| --------------------------------- | --------------------------------- | -------------------------- |
| `--med-expert-primary-color`      | `var(--primary-color)`            | Primary accent color       |
| `--med-expert-background-color`   | `var(--card-background-color)`    | Card background            |
| `--med-expert-text-color`         | `var(--primary-text-color)`       | Main text color            |
| `--med-expert-status-ok`          | `var(--success-color, #4caf50)`   | OK/taken status color      |
| `--med-expert-status-due`         | `var(--warning-color, #ff9800)`   | Due status color           |
| `--med-expert-status-missed`      | `var(--error-color, #f44336)`     | Missed status color        |
| `--med-expert-status-snoozed`     | `var(--info-color, #2196f3)`      | Snoozed status color       |
| `--med-expert-status-prn`         | `#9c27b0`                         | PRN (as-needed) color      |
| `--med-expert-border-radius`      | `var(--ha-card-border-radius)`    | Card corner radius         |

## Localization

The card supports the following languages:

- 🇺🇸 English (en)
- 🇩🇪 German (de)

The language is automatically detected from your Home Assistant settings.

## Development

### Setup

```bash
git clone https://github.com/flotterotter/lovelace-med-expert.git
cd lovelace-med-expert
npm install
```

### Build

```bash
npm run build
```

### Watch mode

```bash
npm run start
```

### Lint

```bash
npm run lint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

- Based on the [boilerplate-card](https://github.com/custom-cards/boilerplate-card) template by [@iantrich](https://github.com/iantrich)
- Built with [Lit](https://lit.dev/)
- Icons from [Material Design Icons](https://materialdesignicons.com/)

---

[commits-shield]: https://img.shields.io/github/commit-activity/y/flotterotter/lovelace-med-expert.svg?style=for-the-badge
[commits]: https://github.com/flotterotter/lovelace-med-expert/commits/main
[license-shield]: https://img.shields.io/github/license/flotterotter/lovelace-med-expert.svg?style=for-the-badge
[maintenance-shield]: https://img.shields.io/maintenance/yes/2025.svg?style=for-the-badge
[releases-shield]: https://img.shields.io/github/release/flotterotter/lovelace-med-expert.svg?style=for-the-badge
[releases]: https://github.com/flotterotter/lovelace-med-expert/releases
