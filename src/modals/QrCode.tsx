import { ModalRoot } from "@decky/ui";
import { QRCodeSVG } from "qrcode.react";
import { FC } from "react";

export const QrCode: FC<{
  closeModal?: () => void;
  url: string;
}> = ({ closeModal = () => { }, url }) => (
  <ModalRoot closeModal={closeModal}>
    <QRCodeSVG
      style={{ margin: "0 auto 1.5em auto" }}
      value={url || ""}
      marginSize={4}
      size={256}
    />
    <span style={{ textAlign: "center", wordBreak: "break-word" }}>
      {url}
    </span>
  </ModalRoot>
);
