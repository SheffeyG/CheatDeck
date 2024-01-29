import {
  DialogButton,
  Field,
  Focusable,
  TextField,
} from "decky-frontend-lib";
import { VFC, useEffect, useState } from "react";

import { CustomOption, getCustomOptions, setCustomOptions } from "../../utils/Settings";


const CustomManager: VFC = () => {
  const [cusOptList, setCusOptList] = useState<CustomOption[]>([]);

  useEffect(() => {
    getCustomOptions().then((result) => {
      setCusOptList(result as CustomOption[]);
    });
  }, []);

  return (
    <>
      {(cusOptList.length > 0) ? (
        cusOptList.map((opt: CustomOption) => (
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
        ))
      ) : (
        <p>No options</p>
      )}

      <DialogButton
        onClick={async () => { setCustomOptions(cusOptList) }}
        style={{
          alignSelf: "center",
          marginTop: "20px",
          padding: "10px",
          fontSize: "14px",
          textAlign: "center",
          width: "80%"
        }}
      >
        Save Changes
      </DialogButton>
    </>
  )
}

export default CustomManager;