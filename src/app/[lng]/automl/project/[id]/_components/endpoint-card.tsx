import { Box, Card, CardContent, Chip, Typography } from "@mui/material";

import { Endpoint } from "@/store/project/project-store";

interface EndpointCardProps {
  endpoint: Endpoint;
  selected?: boolean;
  onClick?: () => void;
}

export default function EndpointCard(props: EndpointCardProps) {
  return (
    <Card
      key={props.endpoint.id}
      sx={{
        cursor: "pointer",
        border: props.selected ? 2 : 1,
        borderColor: props.selected ? "primary.main" : "divider",
        bgcolor: props.selected ? "action.selected" : "background.paper",
        "&:hover": {
          bgcolor: "action.hover",
        },
      }}
      onClick={() => props.onClick && props.onClick()}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <Chip
            label={props.endpoint.method}
            color={props.endpoint.method === "GET" ? "primary" : "secondary"}
            size="small"
          />
          <Typography variant="body2" fontFamily="monospace">
            {props.endpoint.path}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {props.endpoint.description}
        </Typography>
        {/* <Box sx={{ display: "flex", gap: 2, mt: 1 }}> */}
        {/*   <Typography variant="body2" color="text.secondary"> */}
        {/*     {endpoint.calls.toLocaleString()} calls */}
        {/*   </Typography> */}
        {/*   <Typography variant="body2" color="text.secondary"> */}
        {/*     • */}
        {/*   </Typography> */}
        {/*   <Typography variant="body2" color="text.secondary"> */}
        {/*     {endpoint.avgLatency} avg */}
        {/*   </Typography> */}
        {/* </Box> */}
      </CardContent>
    </Card>
  );
}
