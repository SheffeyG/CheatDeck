import { ModalRoot } from "@decky/ui";
import { QRCodeSVG } from "qrcode.react";
import { FC } from "react";

export const defaultUrl = "https://github.com/SheffeyG/CheatDeck";

const QrCode: FC<{ url?: string }> = ({ url = defaultUrl }) => (
  <ModalRoot onClose={() => { }}>
    <QRCodeSVG
      style={{ margin: "0 auto 1.5em auto" }}
      value={url || " "}
      includeMargin
      size={256}
    />
    <span style={{ textAlign: "center", wordBreak: "break-word" }}>
      {url}
    </span>
  </ModalRoot>
);

export default QrCode;
