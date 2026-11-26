import type { RootState } from '..';
export const selectSettings = (state: RootState) => state.settings.items;
export const selectSettingsLoad = (state: RootState) => state.settings.load;
export const selectSettingsMutation = (state: RootState) => state.settings.mutation;
