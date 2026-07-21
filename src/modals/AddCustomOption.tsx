import { DialogButton, DialogHeader, Focusable, ModalRoot } from "@decky/ui";
import { type CSSProperties, type FC, useState } from "react";
import { v4 as uuid } from "uuid";

import type { CustomOption } from "../domain/settings";
import { t } from "../utils/translate";
import { CustomOptionForm, compileCustomOption, createCustomOptionDraft } from "./CustomOptionForm";

const contentStyle = {
  display: "flex",
  flexDirection: "column",
} satisfies CSSProperties;

const actionsStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
} satisfies CSSProperties;

const actionButtonStyle = {
  alignSelf: "center",
  fontSize: "14px",
  marginTop: "20px",
  textAlign: "center",
  width: "200px",
} satisfies CSSProperties;

export const AddCustomOption: FC<{
  closeModal?: () => void;
  onAdd: (option: CustomOption) => void;
}> = ({ closeModal, onAdd }) => {
  const [option, setOption] = useState(() => createCustomOptionDraft(uuid()));
  const compiled = compileCustomOption(option);

  return (
    <ModalRoot onCancel={closeModal}>
      <div style={contentStyle}>
        <DialogHeader>{t("CUSTOM_NEW_TITLE")}</DialogHeader>
        <CustomOptionForm value={option} onChange={setOption} />
        <Focusable style={actionsStyle}>
          <DialogButton
            disabled={!compiled}
            onClick={() => {
              if (compiled) onAdd(compiled);
              closeModal?.();
            }}
            style={actionButtonStyle}
          >
            {t("SAVE")}
          </DialogButton>
          <DialogButton onClick={closeModal} style={actionButtonStyle}>
            {t("CANCEL")}
          </DialogButton>
        </Focusable>
      </div>
    </ModalRoot>
  );
};
