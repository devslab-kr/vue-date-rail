# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-07-25

### Added

- `<DateRail>` — horizontal infinite-scroll day strip with scroll-position compensation, min/max clamping, `disabledDate`, marker/cell slots, keyboard navigation, `Intl`-based i18n
- `<MonthRail>` — horizontal month strip sharing the same theming system
- `useDateRail()` headless composable exposing the infinite-scroll mechanics
- Desktop input support — vertical wheel → horizontal scroll translation and mouse drag-to-scroll (`useDragScroll()`)
- Utility-CSS (Tailwind) support — `unstyled` / `cellClass` / `itemClass` props and `data-selected` / `data-today` / `data-current` / `data-disabled` cell attributes
- `createFormatters()` and date utilities (`dateKey`, `generateDates`, `addMonths`, …)
- CSS custom property theming (`--vdr-*`) with dark-mode support
