import {
  Card,
  CardContent,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { MouseEventHandler } from "react";

interface StepperSectionProps {
  activeStep: number;
  steps: {
    label?: string;
    description?: string;
  }[];
  children: React.ReactNode[];
  completed?: boolean;
}

export type StepperSectionEvent = {
  onContinue: MouseEventHandler;
  onBack: MouseEventHandler;
};

export default function StepperSection(props: StepperSectionProps) {
  return (
    <Card>
      <CardContent>
        <Stepper activeStep={props.activeStep} orientation="vertical">
          {props.steps.map((v, i) => {
            return (
              <Step key={v.label + i.toString()} completed={props.completed}>
                <StepLabel
                  slotProps={{
                    stepIcon: {
                      sx: {
                        "&.Mui-completed": {
                          color: "secondary.main",
                        },
                        "&.Mui-active": {
                          color: "info.main",
                        },
                      },
                    },
                  }}
                >
                  <Typography variant="h6">
                    {v.label}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {v.description}
                  </Typography>
                  {props.children?.at(i) ?? <></>}
                </StepContent>
              </Step>
            );
          })}
        </Stepper>
      </CardContent>
    </Card>
  );
}
