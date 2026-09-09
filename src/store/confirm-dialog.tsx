import { create } from "zustand";

type ConfirmDialogStoreProps = {
  title?: string;
  children?: string;
  open: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
};

type ConfirmDialogStorePropsWithSetState = {
  setState: (v: ConfirmDialogStoreProps) => void
} & ConfirmDialogStoreProps

export const useConfirmDialogStore = create<ConfirmDialogStorePropsWithSetState>()((
  set,
) => ({
  title: "",
  children: "",
  open: false,
  onConfirm() {
  },
  onClose() {
  },
  setState(v) {
    set(v);
  },
}));
