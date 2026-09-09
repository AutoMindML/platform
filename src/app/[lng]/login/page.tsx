import LoginContent from "../_components/login-content";

import { Box } from "@mui/material";

export default function LoginPage() {
  return (
    <Box sx={{ position: "absolute", display: "flex", height: "100vh" }}>
      <LoginContent />
    </Box>
  );
}
