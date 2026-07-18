import { DialogButton, DialogHeader, Focusable, ModalRoot } from "@decky/ui";
import { type FC, useState } from "react";

import type { CustomOption } from "../domain/settings";
import { t } from "../utils/translate";
import { CustomOptionForm, compileCustomOption, draftFromCustomOption } from "./CustomOptionForm";

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
      <div style={{ display: "flex", flexDirection: "column" }}>
        <DialogHeader>{t("CUSTOM_EDIT_TITLE", "Edit Option")}</DialogHeader>
        <CustomOptionForm value={option} onChange={setOption} />
        <Focusable style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
          <DialogButton
            disabled={!compiled}
            onClick={() => {
              if (compiled && onUpdate(compiled)) closeModal?.();
            }}
            style={{ alignSelf: "center", marginTop: "20px", fontSize: "14px", textAlign: "center", width: "200px" }}
          >
            {t("SAVE", "Save")}
          </DialogButton>
          <DialogButton
            onClick={() => {
              if (onDelete(initialOption.id)) closeModal?.();
            }}
            style={{ alignSelf: "center", marginTop: "20px", fontSize: "14px", textAlign: "center", width: "200px" }}
          >
            {t("DELETE", "Delete")}
          </DialogButton>
        </Focusable>
      </div>
    </ModalRoot>
  );
};
