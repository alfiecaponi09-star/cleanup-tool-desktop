# Cleanup Tool

Desktop utility for common Windows network reset and system maintenance tasks.

## Features

- One-click task runner for DNS, Winsock, TCP/IP, ARP, DHCP renew, and temp cleanup
- Live output panel for command logs
- Task progress and completion states
- Built as an Electron + React app

## Download Options

- Source code: available from the repository as ZIP/TAR archives (`Code` -> `Download ZIP`) and from GitHub release source assets.
- Windows installer (`.exe`): available in GitHub Releases as `CleanupTool-Setup.exe`.

## Local Development

```bash
npm install
npm run dev
```

## Build Windows Installer

```bash
npm run build
```

The installer output is written to `release/`.

## Publish a GitHub Release

A workflow is included at `.github/workflows/windows-release.yml`.

1. Push the repository to GitHub.
2. Create and push a version tag (example: `v1.0.0`).
3. Create a GitHub Release for that tag.
4. The workflow builds and uploads `.exe` assets to the release automatically.

## Notes

- Some tasks run system networking commands and may need administrator privileges.
- This tool is provided as-is; review command behavior before running in sensitive environments.
