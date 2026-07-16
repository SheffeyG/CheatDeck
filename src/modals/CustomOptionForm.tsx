import { Dropdown, Field, Focusable, TextField } from "@decky/ui";
import type { FC } from "react";

import type { OptionType } from "../domain/launchOptions";
import type { CustomOption } from "../domain/settings";
import { t } from "../utils/translate";

const optionTypes: { label: string; data: OptionType }[] = [
  { label: t("CUSTOM_TYPE_ENV", "Environment Variable"), data: "env" },
  { label: t("CUSTOM_TYPE_CMD", "Prefix Commands"), data: "pre_cmd" },
  { label: t("CUSTOM_TYPE_FLAG", "Flag & Arguments"), data: "flag_args" },
];

export const isValidCustomOption = (option: CustomOption): boolean =>
  option.label.trim().length > 0 && option.key.trim().length > 0;

export const normalizeCustomOption = (option: CustomOption): CustomOption => ({
  ...option,
  label: option.label.trim(),
  key: option.key.trim(),
});

export const CustomOptionForm: FC<{
  value: CustomOption;
  onChange: (value: CustomOption) => void;
}> = ({ value, onChange }) => (
  <>
    <Field label={t("CUSTOM_OPTION_LABEL", "Label")} padding="none" bottomSeparator="none">
      <Focusable style={{ boxShadow: "none", display: "flex", justifyContent: "right", padding: "5px 0" }}>
        <TextField
          style={{ padding: "10px", fontSize: "14px", width: "435px" }}
          value={value.label}
          onChange={(event) => onChange({ ...value, label: event.target.value })}
        />
      </Focusable>
    </Field>
    <Field label={t("CUSTOM_OPTION_TYPE", "Type")} padding="none" bottomSeparator="none">
      <Focusable style={{ boxShadow: "none", display: "flex", justifyContent: "right", padding: "5px 0" }}>
        <Dropdown
          rgOptions={optionTypes}
          selectedOption={value.type}
          onChange={({ data: type }) => {
            if (value.type !== type) onChange({ ...value, type, key: "", value: undefined });
          }}
        />
      </Focusable>
    </Field>
    <Field label={t("CUSTOM_OPTION_FIELDS", "Field & Value")} padding="none" bottomSeparator="none">
      <Focusable style={{ boxShadow: "none", display: "flex", justifyContent: "right", padding: "5px 0" }}>
        <TextField
          style={{ padding: "10px", fontSize: "14px", width: value.type === "pre_cmd" ? "435px" : "200px" }}
          value={value.key}
          onChange={(event) => onChange({ ...value, key: event.target.value })}
        />
        {value.type !== "pre_cmd" && (
          <>
            <div style={{ display: "flex", alignItems: "center", margin: "3px" }}>
              <b>{value.type === "env" ? "=" : " "}</b>
            </div>
            <TextField
              style={{ padding: "10px", fontSize: "14px", width: "200px" }}
              value={value.value ?? ""}
              onChange={(event) => {
                const optionValue = event.target.value.trim() === "" ? undefined : event.target.value;
                onChange({ ...value, value: optionValue });
              }}
            />
          </>
        )}
      </Focusable>
    </Field>
  </>
);
