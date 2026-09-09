import ContentCopy from "@mui/icons-material/ContentCopy";
import { Box, IconButton, Typography } from "@mui/material";

interface ExampleCodeProps {
  title?: string;
  exampleCode: string;
}

export default function ExampleCode(props: ExampleCodeProps) {
  const { title = "" } = props;
  const handleCopy = () => {
    navigator.clipboard.writeText(props.exampleCode);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="body2" fontWeight={500}>
          {title}
        </Typography>
        <IconButton size="small" onClick={() => handleCopy()}>
          <ContentCopy fontSize="small" />
        </IconButton>
      </Box>
      <Box
        sx={{
          bgcolor: "background.paper",
          p: 2,
          borderRadius: 1,
          overflow: "auto",
        }}
      >
        <Typography
          component="pre"
          variant="body2"
          fontFamily="monospace"
          sx={{ m: 0 }}
        >
          {props.exampleCode}
        </Typography>
      </Box>
    </Box>
  );
}
