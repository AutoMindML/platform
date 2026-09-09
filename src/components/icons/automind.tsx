import { Icon } from "@mui/material";
import Image from "next/image";
import * as React from "react";

export default function AutoMindIcon(
  props: React.ComponentProps<typeof Icon> & { size?: number },
) {
  const { size, ...iconProps } = props;
  const defaultSize = 32;

  return (
    <Icon
      {...iconProps}
      sx={{
        width: size ?? defaultSize,
        height: size ?? defaultSize,
        ...iconProps.sx,
      }}
    >
      <Image
        src="/assets/icons/automind.svg"
        width={size ?? defaultSize}
        height={size ?? defaultSize}
        alt="automind"
        priority
      />
    </Icon>
  );
}
