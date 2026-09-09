import { Menu, MenuItem } from "@mui/material";
import {
  createContext,
  MouseEvent,
  useContext,
  useMemo,
  useState,
} from "react";

type ActionMenuItems = Record<string, () => void>;

interface ActionMenuContextProps {
  openActionMenu: boolean;
  anchorActionMenu: HTMLElement | null;
  handleActionMenuClick: (event: MouseEvent<HTMLButtonElement>) => void;
  handleActionMenuClose: () => void;
}

export const ActionMenuContext = createContext<ActionMenuContextProps>({
  openActionMenu: false,
  anchorActionMenu: null,
  handleActionMenuClick: () => {},
  handleActionMenuClose: () => {},
});

export const useActionMenu = () => {
  const [anchorActionMenu, setAnchorActionMenu] = useState<null | HTMLElement>(
    null,
  );
  const openActionMenu = Boolean(anchorActionMenu);

  const handleActionMenuClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorActionMenu(event.currentTarget);
  };
  const handleActionMenuClose = () => {
    setAnchorActionMenu(null);
  };

  const context = useMemo<ActionMenuContextProps>(() => {
    return {
      openActionMenu,
      anchorActionMenu,
      handleActionMenuClick,
      handleActionMenuClose,
    };
  }, [openActionMenu, anchorActionMenu]);

  return context;
};

interface ActionMenuProps {
  actions: ActionMenuItems;
}

export default function ActionMenu(props: ActionMenuProps) {
  const context = useContext(ActionMenuContext);

  return (
    <Menu
      id="action-menu"
      anchorEl={context.anchorActionMenu}
      open={context.openActionMenu}
      onClose={context.handleActionMenuClose}
      slotProps={{
        list: {
          "aria-labelledby": "basic-button",
        },
      }}
    >
      {Object.keys(props.actions).map((key, i) => {
        return (
          <MenuItem
            key={key + "-" + i.toString()}
            onClick={() => {
              if (props.actions[key]) {
                props.actions[key]();
              }

              context.handleActionMenuClose();
            }}
          >
            {key}
          </MenuItem>
        );
      })}
    </Menu>
  );
}
