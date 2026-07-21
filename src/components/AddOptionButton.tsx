import { ButtonItem } from "@decky/ui";
import type { FC } from "react";
import { BsPlusSquareFill } from "react-icons/bs";

import { t } from "../utils/translate";

// SteamOS-native "add" row: a ButtonItem renders the standard settings row
// (label on the left, action button on the right) matching the system's own
// action rows.
export interface AddOptionButtonProps {
  onClick: () => void;
}

export const AddOptionButton: FC<AddOptionButtonProps> = ({ onClick }) => (
  <ButtonItem label={t("CUSTOM_ADD_LABEL")} description={t("CUSTOM_ADD_DESC")} onClick={onClick}>
    <BsPlusSquareFill />
  </ButtonItem>
);
