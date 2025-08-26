import {
  FilePickerRes,
  FileSelectionType,
  openFilePicker,
  ToastData,
  toaster,
} from "@decky/api";

export type FilePickerFilter = RegExp | ((file: File) => boolean) | undefined;

export const browseFiles = (
  startPath: string,
  includeFiles?: boolean,
  validFileExtensions?: string[],
  filter?: FilePickerFilter,
  defaultHidden?: boolean,
): Promise<FilePickerRes> => {
  return new Promise((resolve, reject) => {
    openFilePicker(
      FileSelectionType.FILE,
      startPath,
      includeFiles,
      true,
      filter,
      validFileExtensions,
      defaultHidden,
      false,
    ).then(resolve, () => reject("User Canceled"));
  });
};

export const sendNotice = (msg: string) => {
  const toastData: ToastData = {
    title: "CheatDeck",
    body: msg,
    duration: 2000,
    playSound: true,
    showToast: true,
  };
  toaster.toast(toastData);
};
