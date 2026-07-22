import { ConfirmModal } from "@decky/ui";
import { type FC, useState } from "react";

import type { CustomOption } from "../domain/settings";
import { t } from "../utils/translate";
import { CustomOptionForm, compileCustomOption, createCustomOptionDraft } from "./CustomOptionForm";

export const AddCustomOption: FC<{
  closeModal?: () => void;
  onAdd: (option: CustomOption) => void;
}> = ({ closeModal, onAdd }) => {
  const [option, setOption] = useState(() => createCustomOptionDraft(crypto.randomUUID()));
  const compiled = compileCustomOption(option);

  return (
    <ConfirmModal
      strTitle={t("CUSTOM_NEW_TITLE")}
      strOKButtonText={t("SAVE")}
      strCancelButtonText={t("CANCEL")}
      bOKDisabled={!compiled}
      closeModal={closeModal}
      onCancel={closeModal}
      onOK={() => {
        if (!compiled) return;
        onAdd(compiled);
        closeModal?.();
      }}
    >
      <CustomOptionForm value={option} onChange={setOption} />
    </ConfirmModal>
  );
};
