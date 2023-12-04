import { ServerAPI, FileSelectionType } from 'decky-frontend-lib';

export type FilePickerFilter = RegExp | ((file: File) => boolean) | undefined;

export const openFilePicker = (
  startPath: string,
  includeFiles?: boolean,
  filter?: FilePickerFilter,
  filePickerSettings?: {
    validFileExtensions?: string[]; 
    defaultHidden?: boolean;
  },
  serverApi?: ServerAPI
): Promise<{ path: string; realpath: string }> => {
  return new Promise((resolve, reject) => {
    if (!serverApi) return reject('No server API');

    serverApi.openFilePickerV2(
      FileSelectionType.FILE,
      startPath,
      includeFiles,
      true,
      filter,
      filePickerSettings?.validFileExtensions,
      filePickerSettings?.defaultHidden,
      false
    ).then(resolve, () => reject('User Canceled'));
  });
};

export default openFilePicker