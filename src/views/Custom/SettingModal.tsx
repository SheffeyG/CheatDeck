import { DialogButton, Field, Focusable, ModalRoot, TextField } from "decky-frontend-lib";
import { FC, useState } from "react";

import { CustomOption } from "../../utils/Custom";


export const SettingModal: FC<{
  closeModal?: () => void,
  opt: CustomOption,
  onSave: (data: CustomOption) => void
}> = ({
  closeModal,
  opt,
  onSave
}) => {
    const [editedOpt, setEditedOpt] = useState<CustomOption>(opt)

    const handleSave = () => {
      onSave(editedOpt);
      closeModal?.();
    }

    return (
      <ModalRoot onCancel={handleSave}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Field
            label="label"
            padding="none"
            bottomSeparator="none"
          >
            <Focusable
              style={{ boxShadow: "none", display: "flex", justifyContent: "right", padding: "10px 0 5px" }}
            >
              <TextField
                style={{ padding: "10px", fontSize: "14px", width: "435px" }}
                value={editedOpt.label}
                onChange={(e) => {
                  setEditedOpt({
                    ...editedOpt,
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
              style={{ boxShadow: "none", display: "flex", justifyContent: "right", padding: "5px 0 10px" }}
            >
              <TextField
                style={{ padding: "10px", fontSize: "14px", width: "200px" }}
                value={editedOpt.field}
                onChange={(e) => {
                  setEditedOpt({
                    ...editedOpt,
                    field: e.target.value,
                  })
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', margin: '3px' }}>
                <b>=</b>
              </div>
              <TextField
                style={{ padding: "10px", fontSize: "14px", width: "200px" }}
                value={editedOpt.value}
                onChange={(e) => {
                  setEditedOpt({
                    ...editedOpt,
                    value: e.target.value,
                  })
                }}
              />
            </Focusable>
          </Field >
        </div>
        {/* <DialogButton
          onClick={() => {
            saver(editedOpt);
            closeModal?.();
          }}
          style={{
            alignSelf: "center",
            marginTop: "20px",
            padding: "10px",
            fontSize: "14px",
            textAlign: "center",
            width: "80%"
          }}
        >
          Save Settings
        </DialogButton> */}
      </ModalRoot>
    );
  };