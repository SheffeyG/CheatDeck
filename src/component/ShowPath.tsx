import { DialogBodyText, FilePickerRes } from 'decky-frontend-lib';

const ShowPath = ({ updatedValue }: { updatedValue: FilePickerRes }) => {
    return (
      <DialogBodyText>
        <p>Path: {updatedValue.path}</p>
        <p>Realpath: {updatedValue.realpath}</p>
      </DialogBodyText>
    );
  };

export default ShowPath;
