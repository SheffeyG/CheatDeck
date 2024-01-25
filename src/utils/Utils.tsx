import { showModal, ModalRoot, Navigation } from 'decky-frontend-lib';
import { QRCodeSVG } from 'qrcode.react';

export const navLink = (url: string) => {
  Navigation.CloseSideMenus();
  Navigation.NavigateToExternalWeb(url);
};

export const showQrModal = (url: string) => {
  showModal(
    <ModalRoot>
      <QRCodeSVG
        style={{ margin: '0 auto 1.5em auto' }}
        value={url}
        includeMargin
        size={256}
      />
      <span style={{ textAlign: 'center', wordBreak: 'break-word' }}>{url}</span>
    </ModalRoot>,
    window
  );
};
