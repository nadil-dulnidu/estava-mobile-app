# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows Semantic Versioning.

## [Unreleased]

### Added
- Expanded CRUD flows across properties, inquiries, appointments, and reviews.
- Added owner listing status and deletion controls for properties.
- Added delisted listing behavior to property feed handling.
- Added inquiry response edit and clear capabilities.
- Added buyer delete-after-reply behavior for inquiries.
- Added appointment update flow with dual soft-delete semantics.
- Added review edit support and average review display in property details.

### Changed
- Updated role-based lifecycle behavior for property, inquiry, and appointment actions.
- Updated documentation to reflect current Phase 3 status values and behavior rules.

### Fixed
- Improved property form clarity for create and update flows.

### Security
- Hardened property, inquiry, and appointment service authorization checks.
- Strengthened validators for update, status transition, and delete boundaries.