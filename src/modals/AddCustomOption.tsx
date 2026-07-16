import { DialogButton, DialogHeader, Focusable, ModalRoot } from "@decky/ui";
import { type FC, useState } from "react";
import { v4 as uuid } from "uuid";

import type { CustomOption } from "../domain/settings";
import { t } from "../utils/translate";
import { CustomOptionForm, isValidCustomOption, normalizeCustomOption } from "./CustomOptionForm";

export const AddCustomOption: FC<{
  closeModal?: () => void;
  onAdd: (option: CustomOption) => void;
}> = ({ closeModal, onAdd }) => {
  const [option, setOption] = useState<CustomOption>(() => ({
    id: uuid(),
    label: "",
    type: "env",
    key: "",
  }));

  return (
    <ModalRoot onCancel={closeModal}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <DialogHeader>{t("CUSTOM_NEW_TITLE", "Add a New Option")}</DialogHeader>
        <CustomOptionForm value={option} onChange={setOption} />
        <Focusable style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
          <DialogButton
            disabled={!isValidCustomOption(option)}
            onClick={() => {
              onAdd(normalizeCustomOption(option));
              closeModal?.();
            }}
            style={{ alignSelf: "center", marginTop: "20px", fontSize: "14px", textAlign: "center", width: "200px" }}
          >
            {t("SAVE", "Save")}
          </DialogButton>
          <DialogButton
            onClick={closeModal}
            style={{ alignSelf: "center", marginTop: "20px", fontSize: "14px", textAlign: "center", width: "200px" }}
          >
            {t("CANCEL", "Cancel")}
          </DialogButton>
        </Focusable>
      </div>
    </ModalRoot>
  );
};
