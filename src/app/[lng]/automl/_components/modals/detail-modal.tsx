"use client";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Box, Grid, IconButton, Modal, Typography } from "@mui/material";
import { useParams } from "next/navigation";

import { useTranslation } from "@/i18n/client";
import { BasicItemInfo } from "@/types/shared";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  width: "80vw",
  height: "90vh",
  gap: 2,
  p: 4,
};

interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  detail: BasicItemInfo;
  additionalDetail?: string[];
  children?: React.ReactNode;
}

export default function DetailModal(
  props: DetailModalProps,
) {
  const p = useParams();
  const { t } = useTranslation(p.lng as string, "general");
  const detailItems = [
    t("created_at") + " : " +
    props.detail.createdAt.toDateString(),
    t("updated_at") + " : " +
    props.detail.updatedAt.toDateString(),
    ...(props.additionalDetail ?? []),
  ];

  const handleClose = () => {
    props.onClose();
  };

  return (
    <div>
      <Modal
        open={props.open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Grid
            container
            spacing={1}
            height={"100%"}
          >
            <Grid
              container
              size={12}
              spacing={1}
              padding={2}
              alignSelf={"stretch"}
            >
              <Grid
                container
                size={5}
                flexDirection={"column"}
                spacing={1}
              >
                <Typography
                  id="modal-modal-name"
                  variant="h4"
                >
                  {props.detail.name +
                    ` (${props.detail.id.toString()})`}
                </Typography>

                {props.detail.type &&
                  (
                    <Typography
                      id="modal-modal-type"
                      variant="caption"
                      component="div"
                    >
                      {t("type")} : {props.detail.type}
                    </Typography>
                  )}

                {detailItems.map((v, i) => {
                  return (
                    <Typography
                      key={i}
                      variant="caption"
                      component="div"
                    >
                      {v}
                    </Typography>
                  );
                })}
              </Grid>

              <Grid
                container
                size={7}
                flexDirection={"column"}
              >
                <Typography
                  variant="h4"
                  id="modal-modal-description"
                >
                  {t("description")}
                </Typography>
                <Typography
                  variant="body1"
                  id="modal-modal-description-content"
                >
                  {props.detail.description}
                </Typography>
              </Grid>
            </Grid>

            <Grid
              container
              size={12}
              alignSelf={"stretch"}
            >
              {props.children &&
                (
                  <Grid
                    container
                    size={12}
                    height={500}
                    overflow={"auto"}
                  >
                    {props.children}
                  </Grid>
                )}
            </Grid>

            <IconButton
              sx={{ position: "absolute", right: 10, bottom: 10 }}
              onClick={() => handleClose()}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Grid>
        </Box>
      </Modal>
    </div>
  );
}
