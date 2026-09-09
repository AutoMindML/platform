"use client";

import { Box, Button, Container, Typography } from "@mui/material";
import Image from "next/image";
import { useParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { useTranslation } from "@/i18n/client";

const providers = ["Google", "Facebook", "WKESSO"];
const iconSize = 30;

export default function LoginContent() {
  const { lng }: { lng: string } = useParams();
  const { t } = useTranslation(lng, "general");

  return (
    <Container
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          padding: 2,
          border: "divider",
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography variant="h2" sx={{ mb: 2 }}>{t("login")}</Typography>
        {providers.map((provider, i) => {
          return (
            <Button
              sx={{
                display: "flex",
                width: 300,
                alignItems: "center",
                justifyContent: "start",
              }}
              color="primary"
              startIcon={
                <Image
                  src={`/assets/icons/${provider.toLowerCase()}.ico`}
                  height={iconSize}
                  width={iconSize}
                  alt={provider}
                />
              }
              key={i}
              onClick={() =>
                signIn(provider.toLowerCase(), { callbackUrl: "/automl/data" })}
            >
              {provider}
            </Button>
          );
        })}
      </Box>
    </Container>
  );
}
