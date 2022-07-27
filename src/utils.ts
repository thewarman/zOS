import { config } from './config';
interface ElectronWindow extends Window {
  isElectron: boolean;
}

declare let window: ElectronWindow;

export const isElectron = (): boolean => typeof window !== 'undefined' && window?.isElectron;

export const showReleaseVersionInConsole = (): void => {
  console.log('Release version:', config.appVersion);
};
