import {
  DialogButton,
  DialogHeader,
  Dropdown,
  Field,
  Focusable,
  ModalRoot,
  TextField,
  ToggleField,
} from "@decky/ui";
import { FC, useState } from "react";

import { CustomOption, getEmptyCustomOption, setCustomOptions, ParamType } from "../../utils/custom";
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
  const [targetOpt, setTargetOpt] = useState<CustomOption>(getEmptyCustomOption());

  const paramTypeOptions = [
    { label: t("CUSTOM_TYPE_ENV", "Environment Variable (KEY=VALUE)"), data: "env" as ParamType },
    { label: t("CUSTOM_TYPE_FLAG", "Flag Parameter (--flag)"), data: "flag" as ParamType },
    { label: t("CUSTOM_TYPE_KEYVALUE", "Key-Value Parameter (--key value)"), data: "keyvalue" as ParamType },
  ];

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
                setTargetOpt({
                  ...targetOpt,
                  type: selected.data,
                  value: selected.data === 'flag' ? undefined : targetOpt.value,
                  position: selected.data === 'env' ? 'before' : targetOpt.position
                });
              }}
            />
          </Focusable>
        </Field>
        <Field
          label={t("CUSTOM_OPTION_POSITION", "Position")}
          padding="none"
          bottomSeparator="none"
        >
          <Focusable
            style={{ boxShadow: "none", display: "flex", justifyContent: "right", padding: "5px 0" }}
          >
            <ToggleField
              label={targetOpt.position === 'before' ? t("CUSTOM_POSITION_BEFORE", "Before %command%") : t("CUSTOM_POSITION_AFTER", "After %command%")}
              checked={targetOpt.position === 'after'}
              disabled={targetOpt.type === 'env'}
              onChange={(checked) => {
                if (targetOpt.type !== 'env') {
                  setTargetOpt({
                    ...targetOpt,
                    position: checked ? 'after' : 'before'
                  });
                }
              }}
            />
          </Focusable>
        </Field>
        <Field
          label={t("CUSTOM_OPTION_Fields", "Field & Value")}
          padding="none"
          bottomSeparator="none"
        >
          <Focusable
            style={{ boxShadow: "none", display: "flex", justifyContent: "right", padding: "5px 0" }}
          >
            <TextField
              style={{ padding: "10px", fontSize: "14px", width: targetOpt.type === 'flag' ? "435px" : "200px" }}
              value={targetOpt.key}
              onChange={(e) => {
                setTargetOpt({
                  ...targetOpt,
                  key: e.target.value,
                });
              }}
            />
            {targetOpt.type !== 'flag' && (
              <>
                <div style={{ display: "flex", alignItems: "center", margin: "3px" }}>
                  <b>{targetOpt.type === 'env' ? '=' : ' '}</b>
                </div>
                <TextField
                  style={{ padding: "10px", fontSize: "14px", width: "200px" }}
                  value={targetOpt.value || ''}
                  onChange={(e) => {
                    setTargetOpt({
                      ...targetOpt,
                      value: e.target.value,
                    });
                  }}
                />
              </>
            )}
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
