export interface UserSettings {
  name: string;
  email: string;
  institution: string;
  researchField: string;
  citationFormat: 'APA' | 'MLA' | 'Chicago';
  defaultDepth: 1 | 2 | 3;
  emailDigest: boolean;
  analysisAlerts: boolean;
}

const STORAGE_KEY = 'user_settings';

export const saveSettingsToStorage = (settings: Partial<UserSettings>): void => {
  try {
    const existingSettings = loadSettingsFromStorage();
    const updatedSettings = { ...existingSettings, ...settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
  } catch (error) {
    console.error('Failed to save settings to local storage:', error);
  }
};

export const loadSettingsFromStorage = (): UserSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load settings from local storage:', error);
  }
  
  // Return default settings if nothing is stored
  return {
    name: '',
    email: '',
    institution: '',
    researchField: 'Computer Science',
    citationFormat: 'APA',
    defaultDepth: 2,
    emailDigest: true,
    analysisAlerts: true,
  };
};

export const clearSettingsFromStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear settings from local storage:', error);
  }
};
