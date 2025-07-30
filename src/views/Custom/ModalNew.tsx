import {
  DialogButton,
  DialogHeader,
  Field,
  Focusable,
  ModalRoot,
  TextField,
} from "@decky/ui";
import { FC, useState } from "react";

import { CustomOption, getEmptyCusOpt, setCustomOptions } from "../../utils/custom";
import t from "../../utils/translate";

export const ModalNew: FC<{
  closeModal?: () => void;
  optList: CustomOption[];
  onSave: (data: CustomOption[]) => void;
}> = ({
  closeModal,
  optList,
  onSave,
}) => {
  const [targetOpt, setTargetOpt] = useState<CustomOption>(getEmptyCusOpt());

  const handleSave = async () => {
    const updatedOpts = [...optList];
    updatedOpts.push(targetOpt);
    await setCustomOptions(updatedOpts);
    onSave(updatedOpts);
    closeModal?.();
  };

  return (
    <ModalRoot onCancel={closeModal}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <DialogHeader>{t("CUSTOM_NEW_TITLE", "Add a New Option")}</DialogHeader>
        <Field
          label={t("CUSTOM_OPTION_LABEL", "Label")}
          padding="none"
          bottomSeparator="none"
        >
          <Focusable
            style={{ boxShadow: "none", display: "flex", justifyContent: "right", padding: "5px 0" }}
          >
            <TextField
              style={{ padding: "10px", fontSize: "14px", width: "435px" }}
              value={targetOpt.label}
              onChange={(e) => {
                setTargetOpt({
                  ...targetOpt,
                  label: e.target.value,
                });
              }}
            />
          </Focusable>
        </Field>
        <Field
          label={t("CUSTOM_OPTION_FIELDS", "Field & Value")}
          padding="none"
          bottomSeparator="none"
        >
          <Focusable
            style={{ boxShadow: "none", display: "flex", justifyContent: "right", padding: "5px 0" }}
          >
            <TextField
              style={{ padding: "10px", fontSize: "14px", width: "200px" }}
              value={targetOpt.field}
              onChange={(e) => {
                setTargetOpt({
                  ...targetOpt,
                  field: e.target.value,
                });
              }}
            />
            <div style={{ display: "flex", alignItems: "center", margin: "3px" }}>
              <b>=</b>
            </div>
            <TextField
              style={{ padding: "10px", fontSize: "14px", width: "200px" }}
              value={targetOpt.value}
              onChange={(e) => {
                setTargetOpt({
                  ...targetOpt,
                  value: e.target.value,
                });
              }}
            />
          </Focusable>
        </Field>
        <Focusable style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
          <DialogButton
            onClick={() => handleSave()}
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
