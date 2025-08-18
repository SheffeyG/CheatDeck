import {
  DialogButton,
  DialogHeader,
  Dropdown,
  Field,
  Focusable,
  ModalRoot,
  TextField,
} from "@decky/ui";
import { FC, useState } from "react";

import { CustomOption, setCustomOptions } from "../../utils/custom";
import { ParamType } from "../../utils/options";
import t from "../../utils/translate";

export const ModalEdit: FC<{
  closeModal?: () => void;
  id?: string;
  optList: CustomOption[];
  onSave: (data: CustomOption[]) => void;
}> = ({
  closeModal,
  id,
  optList,
  onSave,
}) => {
  const optIndex = optList.findIndex(otp => otp.id === id);
  const [targetOpt, setTargetOpt] = useState<CustomOption>(
    optList[optIndex],
  );

  const paramTypeOptions: { label: string; data: ParamType; }[] = [
    { label: t("CUSTOM_TYPE_ENV", "Environment Variable"), data: "env" },
    { label: t("CUSTOM_TYPE_CMD", "Prefix Commands"), data: "pre_cmd" },
    { label: t("CUSTOM_TYPE_FLAG", "Flag & Arguments"), data: "flag_args" },
  ];

  const handleSave = async (action = "Save") => {
    const updatedOpts = [...optList];
    if (action === "Delete") updatedOpts.splice(optIndex, 1);
    if (action === "Save") updatedOpts[optIndex] = targetOpt;
    await setCustomOptions(updatedOpts);
    onSave(updatedOpts);
    closeModal?.();
  };

  return (
    <ModalRoot onCancel={closeModal}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <DialogHeader>{t("CUSTOM_EDIT_TITLE", "Edit Option")}</DialogHeader>
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
                setTargetOpt({ ...targetOpt, label: e.target.value });
              }}
            />
          </Focusable>
        </Field>
        <Field
          label={t("CUSTOM_OPTION_TYPE", "Type")}
          padding="none"
          bottomSeparator="none"
        >
          <Focusable
            style={{ boxShadow: "none", display: "flex", justifyContent: "right", padding: "5px 0" }}
          >
            <Dropdown
              rgOptions={paramTypeOptions}
              selectedOption={targetOpt.type}
              onChange={(selected) => {
                setTargetOpt({ ...targetOpt, type: selected.data });
              }}
            />
          </Focusable>
        </Field>
        <Field
          label={t("CUSTOM_OPTION_Fields", "Field & Value")}
          padding="none"
          bottomSeparator="none"
        >
          <Focusable style={{ boxShadow: "none", display: "flex", justifyContent: "right", padding: "5px 0" }}>
            <TextField
              style={{ padding: "10px", fontSize: "14px", width: targetOpt.type === 'pre_cmd' ? "435px" : "200px" }}
              value={targetOpt.key}
              onChange={(e) => {
                setTargetOpt({ ...targetOpt, key: e.target.value });
              }}
            />
            {targetOpt.type !== 'pre_cmd' && (
              <>
                <div style={{ display: "flex", alignItems: "center", margin: "3px" }}>
                  <b>{targetOpt.type === 'env' ? '=' : ' '}</b>
                </div>
                <TextField
                  style={{ padding: "10px", fontSize: "14px", width: "200px" }}
                  value={targetOpt.value || ''}
                  onChange={(e) => {
                    setTargetOpt({ ...targetOpt, value: e.target.value });
                  }}
                />
              </>
            )}
          </Focusable>
        </Field>
        <Focusable style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
          <DialogButton
            onClick={() => handleSave("Save")}
            style={{ alignSelf: "center", marginTop: "20px", fontSize: "14px", textAlign: "center", width: "200px" }}
          >
            {t("SAVE", "Save")}
          </DialogButton>
          <DialogButton
            onClick={() => handleSave("Delete")}
            style={{ alignSelf: "center", marginTop: "20px", fontSize: "14px", textAlign: "center", width: "200px" }}
          >
            {t("DELETE", "Delete")}
          </DialogButton>
        </Focusable>
      </div>
    </ModalRoot>
  );
};
