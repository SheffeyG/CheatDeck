import { Focusable, SliderField, ToggleField } from "@decky/ui";
import type { FC, ReactNode } from "react";

interface ToggleSliderProps {
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  checked: boolean;
  disabled?: boolean;
  onToggle: (checked: boolean) => void;
  fieldLabel?: ReactNode;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  resetValue?: number;
  valueSuffix?: string;
  onInput: (value: number) => void;
}

export const ToggleSlider: FC<ToggleSliderProps> = ({
  label,
  description,
  icon,
  checked,
  disabled,
  onToggle,
  fieldLabel,
  value,
  min,
  max,
  step,
  resetValue,
  valueSuffix,
  onInput,
}) => {
  return (
    <>
      <ToggleField
        label={label}
        description={description}
        icon={icon}
        checked={checked}
        disabled={disabled}
        bottomSeparator={checked ? "none" : "standard"}
        onChange={onToggle}
      />
      {checked && (
        <Focusable style={{ boxShadow: "none", marginTop: "-4px" }}>
          <SliderField
            label={fieldLabel}
            value={value}
            min={min}
            max={max}
            step={step}
            resetValue={resetValue}
            valueSuffix={valueSuffix}
            disabled={disabled}
            showValue
            editableValue
            validValues="steps"
            bottomSeparator="standard"
            onChange={onInput}
          />
        </Focusable>
      )}
    </>
  );
};
