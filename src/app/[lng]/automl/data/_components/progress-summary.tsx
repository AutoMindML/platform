import { Warning } from "@mui/icons-material";
import CheckCircle from "@mui/icons-material/CheckCircle";
import { Box, Card, CardContent, Typography } from "@mui/material";

interface ProgressSummaryProps {
  completeStates: boolean[];
  titles: string[];
}

export default function ProgressSummary(props: ProgressSummaryProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Workflow Progress
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            mt: 2,
          }}
        >
          {props.titles.map((v, i) => {
            return (
              <Box
                key={i}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                {props.completeStates.at(i)
                  ? <CheckCircle color="success" fontSize="small" />
                  : <Warning color="disabled" fontSize="small" />}
                <Typography variant="body2">
                  {v}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}
