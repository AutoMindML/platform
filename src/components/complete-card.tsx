import CheckCircle from "@mui/icons-material/CheckCircle";
import { Box, Card, CardContent, Typography } from "@mui/material";

import { GeneralStatus } from "@/server/api/models/shared";

interface CompleteCardProps {
  status: GeneralStatus;
  message: string;
}

export default function CompleteCard(props: CompleteCardProps) {
  return (
    <Box>
      {props.status === "complete" && (
        <Card
          variant="outlined"
          sx={{ mb: 2, bgcolor: "success.main", color: "success.contrastText" }}
        >
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircle />
              <Typography variant="body2">
                {props.message}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
