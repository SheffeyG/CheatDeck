import { Field, Focusable, ModalRoot, TextField } from "decky-frontend-lib";
import { useState, useEffect } from "react";

import { CustomOption, getCustomOptions } from "../../utils/Settings";


export function CusOptSettingsModal(opt: CustomOption) {
  return (
    <ModalRoot onCancel={() => { }} onEscKeypress={() => { }}>
      <OptionSettingsModal opt={opt} />
    </ModalRoot>
  );
}

function OptionSettingsModal({ opt }: { opt: CustomOption }) {
  const [cusOptList, setCusOptList] = useState<CustomOption[]>([]);

  useEffect(() => {
    getCustomOptions().then((result) => {
      setCusOptList(result as CustomOption[]);
    });
  }, []);

  return (
    <>
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
              style={{ padding: "10px", fontSize: "14px", width: "200px" }}
              value={opt.label}
              onChange={(e) => {
                e.persist();
                const updatedCusOptList = cusOptList.map((item) => {
                  if (item.field === opt.field) {
                    return { ...item, label: e.target.value };
                  }
                  return item;
                });
                setCusOptList(updatedCusOptList);
              }}
            />
          </Focusable>
        </Field>
        <Field
          label="Field & Value"
          padding="none"
          bottomSeparator="thick"
        >
          <Focusable
            style={{ boxShadow: "none", display: "flex", justifyContent: "right", padding: "5px 0 10px" }}
          >
            <TextField
              style={{ padding: "10px", fontSize: "14px", width: "200px" }}
              value={opt.field}
              onChange={(e) => {
                e.persist();
                const updatedCusOptList = cusOptList.map((item) => {
                  if (item.field === opt.field) {
                    return { ...item, field: e.target.value };
                  }
                  return item;
                });
                setCusOptList(updatedCusOptList);
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', margin: '3px' }}>
              <b>=</b>
            </div>
            <TextField
              style={{ padding: "10px", fontSize: "14px", width: "200px" }}
              value={opt.value}
              onChange={(e) => {
                e.persist();
                const updatedCusOptList = cusOptList.map((item) => {
                  if (item.field === opt.field) {
                    return { ...item, value: e.target.value };
                  }
                  return item;
                });
                setCusOptList(updatedCusOptList);
              }}
            />
          </Focusable>
        </Field >
      </div>
    </>
  );
}
