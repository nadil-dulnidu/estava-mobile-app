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
- Favorites now support note editing in mobile UI using the existing favorites PATCH endpoint.

### Changed

- Updated role-based lifecycle behavior for property, inquiry, and appointment actions.
- Updated documentation to reflect current Phase 3 status values and behavior rules.
- Adjusted delisted visibility so owners can still view/manage their own delisted listings while buyers cannot see delisted properties in public views.
- Extended property creation flow to accept features input.
- Added mobile flow shortcuts: a top "Post Property" CTA on properties listing and a "Review this property" shortcut from property detail with preselected property in reviews.

### Fixed

- Improved property form clarity for create and update flows.
- Refined inquiry delete confirmation copy to use professional, user-facing wording.
- Fixed appointment deletion so completed appointments can be deleted via existing actor-scoped soft-delete flow, while pending and confirmed appointments remain blocked.

### Security

- Hardened property, inquiry, and appointment service authorization checks.
- Strengthened validators for update, status transition, and delete boundaries.
