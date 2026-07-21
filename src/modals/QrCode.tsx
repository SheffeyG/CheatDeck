import { ModalRoot } from "@decky/ui";
import { QRCodeSVG } from "qrcode.react";
import type { CSSProperties, FC } from "react";

const qrCodeStyle = {
  margin: "0 auto 1.5em auto",
} satisfies CSSProperties;

const urlStyle = {
  textAlign: "center",
  wordBreak: "break-word",
} satisfies CSSProperties;

export const QrCode: FC<{
  closeModal?: () => void;
  url: string;
}> = ({ closeModal = () => {}, url }) => (
  <ModalRoot closeModal={closeModal}>
    <QRCodeSVG style={qrCodeStyle} value={url || ""} marginSize={4} size={256} />
    <span style={urlStyle}>{url}</span>
  </ModalRoot>
);
