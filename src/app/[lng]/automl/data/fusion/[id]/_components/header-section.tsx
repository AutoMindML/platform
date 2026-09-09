import { CanvasTransform, Connection, TableInstance } from "./schema";

import Add from "@mui/icons-material/Add";
import Save from "@mui/icons-material/Save";
import Visibility from "@mui/icons-material/Visibility";
import ZoomIn from "@mui/icons-material/ZoomIn";
import ZoomOut from "@mui/icons-material/ZoomOut";
import ZoomOutMap from "@mui/icons-material/ZoomOutMap";
import { Button, ButtonGroup, Chip, IconButton, Tooltip } from "@mui/material";
import { Box } from "@mui/system";

interface HeaderSectionProps {
  connections: Connection[];
  handleZoomOut: () => void;
  handleResetZoom: () => void;
  canvasTransform: CanvasTransform;
  handleZoomIn: () => void;
  setAnchorEl: (value: React.SetStateAction<HTMLElement | null>) => void;
  showPreview: boolean;
  setShowPreview: (value: React.SetStateAction<boolean>) => void;
  addedTables: TableInstance[];
  setSaveDialogOpen: (value: React.SetStateAction<boolean>) => void;
}

export default function HeaderSection(
  {
    connections,
    handleZoomOut,
    handleResetZoom,
    canvasTransform,
    handleZoomIn,
    setAnchorEl,
    showPreview,
    setShowPreview,
    addedTables,
    setSaveDialogOpen,
  }: HeaderSectionProps,
) {
  return (
    <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexGrow: 1,
            gap: 2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {connections.length > 0 && (
            <Chip
              label={`${connections.length} Connection${
                connections.length !== 1 ? "s" : ""
              }`}
              color="primary"
              variant="filled"
              size="small"
              sx={{ p: 1 }}
            />
          )}
          <ButtonGroup variant="outlined" size="small" sx={{ gap: 1 }}>
            <Tooltip title="Zoom Out">
              <IconButton onClick={handleZoomOut} size="small">
                <ZoomOut fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button
              onClick={handleResetZoom}
              sx={{ minWidth: 60, borderStyle: "none" }}
            >
              {Math.round(canvasTransform.scale * 100)}%
            </Button>
            <Tooltip title="Zoom In">
              <IconButton onClick={handleZoomIn} size="small">
                <ZoomIn fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reset View">
              <IconButton onClick={handleResetZoom} size="small">
                <ZoomOutMap fontSize="small" />
              </IconButton>
            </Tooltip>
          </ButtonGroup>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            Add Table
          </Button>
          <Button
            variant="outlined"
            startIcon={<Visibility />}
            onClick={() => setShowPreview(!showPreview)}
            disabled={addedTables.length === 0}
          >
            {showPreview ? "Hide" : "Show"} Preview
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Save />}
            onClick={() => setSaveDialogOpen(true)}
            disabled={addedTables.length === 0 ||
              connections.length === 0}
          >
            Create Fused Dataset
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
