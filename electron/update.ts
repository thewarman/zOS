/**
 * Sets up the update service
 */

export function setupUpdates() {
  setTimeout(() => {
    const { updateElectronApp, UpdateSourceType } = require('update-electron-app');
    updateElectronApp({
      updateSource: {
        type: UpdateSourceType.ElectronPublicUpdateService,
        host: 'https://update.electronjs.org',
        repo: 'thewarman/zOS',
      },
      updateInterval: '1 hour',
    });
  }, 10000);
}
