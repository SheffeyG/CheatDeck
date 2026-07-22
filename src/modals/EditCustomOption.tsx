import { ConfirmModal, showModal } from "@decky/ui";
import { type FC, useState } from "react";

import type { CustomOption } from "../domain/settings";
import { t } from "../utils/translate";
import { CustomOptionForm, compileCustomOption, draftFromCustomOption } from "./CustomOptionForm";

const DeleteCustomOptionConfirmation: FC<{
  closeModal?: () => void;
  label: string;
  onConfirm: () => boolean;
  onDeleted: () => void;
}> = ({ closeModal, label, onConfirm, onDeleted }) => (
  <ConfirmModal
    strTitle={t("CUSTOM_DELETE_TITLE")}
    strDescription={
      <span>
        {label}
        <br />
        {t("CUSTOM_DELETE_DESC")}
      </span>
    }
    strOKButtonText={t("DELETE")}
    strCancelButtonText={t("CANCEL")}
    bDestructiveWarning={true}
    closeModal={closeModal}
    onCancel={closeModal}
    onOK={() => {
      if (!onConfirm()) return;
      closeModal?.();
      onDeleted();
    }}
  />
);

export const EditCustomOption: FC<{
  closeModal?: () => void;
  option: CustomOption;
  onUpdate: (option: CustomOption) => boolean;
  onDelete: (id: string) => boolean;
}> = ({ closeModal, option: initialOption, onUpdate, onDelete }) => {
  const [option, setOption] = useState(() => draftFromCustomOption(initialOption));
  const compiled = compileCustomOption(option);

  return (
    <ConfirmModal
      strTitle={t("CUSTOM_EDIT_TITLE")}
      strOKButtonText={t("SAVE")}
      strCancelButtonText={t("CANCEL")}
      strMiddleButtonText={t("DELETE")}
      bOKDisabled={!compiled}
      closeModal={closeModal}
      onCancel={closeModal}
      onOK={() => {
        if (compiled && onUpdate(compiled)) closeModal?.();
      }}
      onMiddleButton={() => {
        showModal(
          <DeleteCustomOptionConfirmation
            label={initialOption.label}
            onConfirm={() => onDelete(initialOption.id)}
            onDeleted={() => closeModal?.()}
          />,
          window,
        );
      }}
    >
      <CustomOptionForm value={option} onChange={setOption} />
    </ConfirmModal>
  );
};
