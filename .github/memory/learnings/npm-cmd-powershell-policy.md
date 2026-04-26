---
title: "npm-cmd-powershell-policy"
date: 2026-04-26
type: learning
status: active
agent: coder
task: "run backend tests in Windows PowerShell"
tags:
  - learning
  - tooling
  - windows
aliases: []
---

# npm-cmd-powershell-policy

## What Happened
Running npm install from agent terminal failed with PSSecurityException in PowerShell.

## Root Cause
PowerShell execution policy blocked npm.ps1 script invocation.

## Fix / Workaround
Use npm.cmd directly in terminal commands:
- npm.cmd install
- npm.cmd test

## Prevention
On Windows agent runs, prefer npm.cmd in scripted terminal calls when policy state unknown.

## Related
- [[sessions/2026-04-26-profile-home-user-profile]] — session where this surfaced
