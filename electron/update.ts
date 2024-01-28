/**
 * Sets up the update service
 */
export function setupUpdates() {
  // We delay this work by 30s to ensure that the
  // app doesn't have to worry about updating during launch
  setTimeout(() => {
    const updateApp = require('update-electron-app');

    updateApp({
      repo: 'thewarman/zOS',
      updateInterval: '1 hour',
    });
  }, 30000);
}
