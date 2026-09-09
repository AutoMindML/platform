import { Box, Card, CardContent, Typography } from "@mui/material";
import { ComponentProps, ReactNode } from "react";

type StyledCardProps = {
  title: string;
  children?: ReactNode;
} & ComponentProps<typeof Card>;

export default function StypedCard(props: StyledCardProps) {
  return (
    <Card variant={props.variant ?? "outlined"} sx={{ mt: 2, mb: 2, ...props.sx }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {props.title}
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            mt: 2,
          }}
        >
          {props.children}
        </Box>
      </CardContent>
    </Card>
  );
}
