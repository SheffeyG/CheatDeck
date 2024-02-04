import { DialogButton, DialogHeader, Field, Focusable, ModalRoot, TextField } from "decky-frontend-lib";
import { FC, useEffect, useState } from "react";

import { CustomOption, getEmptyCusOpt } from "../../utils/Custom";
import logger from "../../utils/Logger";


export const Modals: FC<{
  closeModal?: () => void,
  id?: string,
  optList: CustomOption[],
  onSave: (data: CustomOption[]) => void,
  type: string
}> = ({
  closeModal,
  id,
  optList,
  onSave,
  type
}) => {
    const [targetOpt, setTargetOpt] = useState<CustomOption>(getEmptyCusOpt());

    useEffect(() => {
      if (type === "Mod" && id) {
        setTargetOpt(optList.filter((otp) => otp.id === id)[0]);
      }
    }, []);

    const handleSave = () => {
      const updatedOpts = [...optList];
      const existingIndex = updatedOpts.findIndex((otp) => otp.id === targetOpt.id);

      if (existingIndex !== -1) {
        updatedOpts[existingIndex] = targetOpt;
      } else {
        updatedOpts.push(targetOpt);
      }
      onSave(updatedOpts);
      closeModal?.();
    };

    const handleDelete = () => {
      const updatedOpts = [...optList];
      const existingIndex = updatedOpts.findIndex((otp) => otp.id === targetOpt.id);
      if (existingIndex !== -1) {
        updatedOpts.splice(existingIndex, 1);
      } else {
        logger.error("Delete cus opt doesn't exist");
      }
      onSave(updatedOpts);
      closeModal?.();
    };


    return (
      <ModalRoot onCancel={closeModal}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <DialogHeader>
            {type}
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
                  })
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
                  })
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', margin: '3px' }}>
                <b>=</b>
              </div>
              <TextField
                style={{ padding: "10px", fontSize: "14px", width: "200px" }}
                value={targetOpt.value}
                onChange={(e) => {
                  setTargetOpt({
                    ...targetOpt,
                    value: e.target.value,
                  })
                }}
              />
            </Focusable>
          </Field >
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
            <DialogButton
              onClick={handleSave}
              style={{ alignSelf: "center", marginTop: "20px", fontSize: "14px", textAlign: "center", width: "200px" }}
            >
              Save
            </DialogButton>
            {(type === "Mod" && id) ? (
              <DialogButton
                onClick={handleDelete}
                style={{ alignSelf: "center", marginTop: "20px", fontSize: "14px", textAlign: "center", width: "200px" }}
              >
                Delete
              </DialogButton>
            ) : (
              <DialogButton
                onClick={closeModal}
                style={{ alignSelf: "center", marginTop: "20px", fontSize: "14px", textAlign: "center", width: "200px" }}
              >
                Cancel
              </DialogButton>
            )}
          </div >
        </div>
      </ModalRoot>


    );
  };