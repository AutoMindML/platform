import { Box, LinearProgress, Typography } from "@mui/material";

import { GeneralStatus } from "@/server/api/models/shared";

interface StatusProgressProps {
  title: string;
  status: GeneralStatus;
}

export default function StatusProgress(props: StatusProgressProps) {
  return (
    <Box>
      {(props.status === "generating" || props.status === "complete") && (
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
          >
            <Typography variant="body2">{props.title}</Typography>
            {props.status === "complete" && (
              <Typography variant="body2" fontWeight={500}>Complete</Typography>
            )}
          </Box>
          {props.status === "generating"
            ? <LinearProgress variant="indeterminate" color="info" />
            : (
              <LinearProgress
                variant="determinate"
                value={100}
                color="success"
              />
            )}
        </Box>
      )}
    </Box>
  );
}
