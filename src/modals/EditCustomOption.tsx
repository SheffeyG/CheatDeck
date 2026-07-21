import { DialogButton, DialogHeader, Focusable, ModalRoot } from "@decky/ui";
import { type CSSProperties, type FC, useState } from "react";

import type { CustomOption } from "../domain/settings";
import { t } from "../utils/translate";
import { CustomOptionForm, compileCustomOption, draftFromCustomOption } from "./CustomOptionForm";

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

export const EditCustomOption: FC<{
  closeModal?: () => void;
  option: CustomOption;
  onUpdate: (option: CustomOption) => boolean;
  onDelete: (id: string) => boolean;
}> = ({ closeModal, option: initialOption, onUpdate, onDelete }) => {
  const [option, setOption] = useState(() => draftFromCustomOption(initialOption));
  const compiled = compileCustomOption(option);

  return (
    <ModalRoot onCancel={closeModal}>
      <div style={contentStyle}>
        <DialogHeader>{t("CUSTOM_EDIT_TITLE", "Edit Option")}</DialogHeader>
        <CustomOptionForm value={option} onChange={setOption} />
        <Focusable style={actionsStyle}>
          <DialogButton
            disabled={!compiled}
            onClick={() => {
              if (compiled && onUpdate(compiled)) closeModal?.();
            }}
            style={actionButtonStyle}
          >
            {t("SAVE", "Save")}
          </DialogButton>
          <DialogButton
            onClick={() => {
              if (onDelete(initialOption.id)) closeModal?.();
            }}
            style={actionButtonStyle}
          >
            {t("DELETE", "Delete")}
          </DialogButton>
        </Focusable>
      </div>
    </ModalRoot>
  );
};
