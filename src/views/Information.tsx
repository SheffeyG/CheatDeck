import { DialogBodyText,  } from 'decky-frontend-lib';

const Information = ({ appid }: { appid: number | string }) => {
  return (
    <DialogBodyText>
      <p>App ID: {appid}</p>
    </DialogBodyText>
  );
};

export default Information;
