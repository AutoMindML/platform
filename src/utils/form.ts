import { KeyboardEventHandler } from "react";

export const disableEnterAction: KeyboardEventHandler<HTMLFormElement> = (
  e,
) => {
  if (e.key === "Enter") {
    e.preventDefault();
  }
};
