import { Box, Typography } from "@mui/material";

export default function EmptyBlock() {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        pointerEvents: "none",
        bgcolor: "background.default",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography variant="h5" color="text.secondary" gutterBottom>
        No tables added yet
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
      >
        Click Add Table to start building your data fusion
      </Typography>
    </Box>
  );
}
