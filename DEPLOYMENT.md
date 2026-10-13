# GitHub Pages and the Pi display

## Publish the first version

1. Open this folder (the one containing package.json) in VS Code.
2. Use Source Control > Publish to GitHub. Sign in if prompted, choose a public repository named `touch-info-display`, and include the app source and configuration files. The .gitignore excludes node_modules, dist, and .env files.
3. Ensure the published branch is named `main`, matching the deployment workflow.
4. On GitHub, open the repository's Settings > Pages and select GitHub Actions as the source.
5. Open Actions > Publish dashboard > Run workflow, selecting main. This also retries the initial deployment if it ran before Pages was enabled.
6. Wait for a successful deployment and open the website link shown under Settings > Pages.

GitHub builds the React source into static files using the locked dependency versions. Only the built dist folder is deployed. Vite's relative base keeps asset links working beneath the repository URL. Page navigation currently uses React state, so no server-side route fallback is required.

## Changes after publishing

Develop and test in VS Code, commit, and push to main. GitHub rebuilds and publishes the site. Refresh Chromium after the deployment succeeds to load that version. An already-open page does not automatically replace its running React code.

The Pi needs its OS and browser maintained, but it does not need Node.js, npm, or the development server to display the published website.

## Browser data and first use

Tasks, display settings, and the private DAKboard URL live in each browser's local storage. They are not uploaded to GitHub or synced between devices. The published website has different storage from localhost, so configure it separately on the Pi. Do not use incognito mode for a display that should retain settings.

The current Home page expects the `touch-display.dakboardUrl` local-storage entry; without it, Home is blank. The right arrow still opens Daily Space. A setup form is a future improvement. Never commit the private URL or household Wi-Fi credentials to the public source.

DAKboard currently throws cross-origin errors when embedded, interrupting its layout scripts. GitHub Pages, portrait orientation, and Chromium kiosk mode do not bypass that browser rule. Resolve supported embedding or use a separate DAKboard view before treating Home as complete.

## Initial Pi test

Open the published HTTPS site in normal Chromium first. Test the page arrows, portrait layout, theme, checklist, and persistence after a refresh. Then configure kiosk startup using the installed Raspberry Pi OS desktop's startup mechanism. Kiosk startup has not yet been configured by this project.

## Local verification

Run `npm run build`. In restricted environments where esbuild cannot load the config, `npm run build -- --configLoader native` can load this JavaScript configuration directly. GitHub's Linux runner uses the standard build command.
