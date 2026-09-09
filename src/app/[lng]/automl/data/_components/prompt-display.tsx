import { Paper, Typography } from "@mui/material";

interface PromptDisplayProps {
  content: string;
}

export const PromptDisplay = ({ content }: PromptDisplayProps) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        overflow: "scroll",
        maxHeight: 350,
      }}
    >
      <Typography
        variant="body1"
        sx={{
          whiteSpace: "pre-wrap",
          fontFamily: "monospace",
        }}
      >
        {content}
      </Typography>
    </Paper>
  );
};
