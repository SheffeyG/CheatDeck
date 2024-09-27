import { DialogButton, DialogHeader, Field, Focusable, ModalRoot, TextField } from "@decky/ui";
import { FC, useEffect, useState } from "react";

import { CustomOption, getEmptyCusOpt, setCustomOptions } from "../../utils/Custom";

export const Modals: FC<{
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
  const [targetOpt, setTargetOpt] = useState<CustomOption>(getEmptyCusOpt());
  const existingIndex = optList.findIndex(otp => otp.id === id);

  useEffect(() => {
    if (existingIndex !== -1) {
      setTargetOpt(optList[existingIndex]);
    }
  }, []);

  const handleSave = async (action = "Mod") => {
    const updatedOpts = [...optList];
    if (existingIndex !== -1) {
      // Delete
      if (action === "Del") updatedOpts.splice(existingIndex, 1);
      // update
      if (action === "Mod") updatedOpts[existingIndex] = targetOpt;
    }
    else {
      // Add
      if (action === "Mod") updatedOpts.push(targetOpt);
    }
    await setCustomOptions(updatedOpts);
    onSave(updatedOpts);
    closeModal?.();
  };

  return (
    <ModalRoot onCancel={closeModal}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <DialogHeader>
          {id === undefined ? "Add" : "Modify"}
        </DialogHeader>
        <Field
          label="label"
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
          label="Field & Value"
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
            onClick={() => handleSave("Mod")}
            style={{ alignSelf: "center", marginTop: "20px", fontSize: "14px", textAlign: "center", width: "200px" }}
          >
            Save
          </DialogButton>
          {(id !== undefined)
            ? (
                <DialogButton
                  onClick={() => handleSave("Del")}
                  style={{ alignSelf: "center", marginTop: "20px", fontSize: "14px", textAlign: "center", width: "200px" }}
                >
                  Delete
                </DialogButton>
              )
            : (
                <DialogButton
                  onClick={closeModal}
                  style={{ alignSelf: "center", marginTop: "20px", fontSize: "14px", textAlign: "center", width: "200px" }}
                >
                  Cancel
                </DialogButton>
              )}
        </Focusable>
      </div>
    </ModalRoot>
  );
};
