import { DialogBodyText,  } from 'decky-frontend-lib';
import { useEffect, useState } from 'react';

const Information = ({ path }: { path: string }) => {
  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    setCurrentPath(path);
  }, [path]);

  return (
    <DialogBodyText>
      <p>Path: {currentPath}</p>
    </DialogBodyText>
  );
};

export default Information;
