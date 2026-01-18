# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-18

### Added

- **Medication Dashboard** - Display all medications in a clean, organized list
- **Status Badges** - Visual indicators for OK, Due, Missed, Snoozed, and PRN states
- **Quick Actions** - Take, Skip, and Snooze buttons for immediate medication management
- **Dosage Form Icons** - Distinctive icons for tablets, capsules, injections, inhalers, and more
- **Inventory Tracking** - Visual warnings when medication supplies are running low
- **Adherence Badge** - Shows medication adherence percentage in the card header
- **CRUD Wizard** - Step-by-step wizard for adding new medications
  - Step 1: Basic info (name, form)
  - Step 2: Schedule configuration (daily, weekly, interval, PRN)
  - Step 3: Dosage details
  - Step 4: Optional settings (inventory, notes)
  - Step 5: Review and save
- **Visual Editor** - UI-based card configuration
  - Profile selection dropdown
  - Display option toggles
  - Custom title support
- **Theming Support** - CSS custom properties for full theme customization
  - Status colors
  - Typography scale
  - Spacing system
  - Border radius and shadows
- **Localization** - Full English and German translations
- **Responsive Design** - Optimized for mobile, tablet, and desktop views
  - Automatic layout adjustments at 600px breakpoint
  - Compact mode for narrow spaces
- **HACS Integration** - Ready for installation via Home Assistant Community Store

### Technical Features

- Built with Lit 2.x for efficient rendering
- TypeScript for type safety
- Rollup bundler with optimized single-file output
- ESLint for code quality
- Component-based architecture for maintainability

## [0.1.0] - 2025-01-18

### Added

- Initial development release
- Project scaffolding from boilerplate-card template
- Basic type system and API wrapper

---

[1.0.0]: https://github.com/flotterotter/lovelace-med-expert/releases/tag/v1.0.0
[0.1.0]: https://github.com/flotterotter/lovelace-med-expert/releases/tag/v0.1.0
