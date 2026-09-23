import MuiStepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Typography from "@mui/material/Typography";
export type StepOption = { label: string; description?: string };
export type StepperProps = {
  steps: readonly (string | StepOption)[];
  activeStep?: number;
  orientation?: "horizontal" | "vertical";
};
export function Stepper({
  steps,
  activeStep = 0,
  orientation = "horizontal",
}: StepperProps) {
  return (
    <MuiStepper
      activeStep={activeStep}
      orientation={orientation}
      alternativeLabel={false}
    >
      {steps.map((step) => {
        const option = typeof step === "string" ? { label: step } : step;
        return (
          <Step key={option.label}>
            <StepLabel
              optional={
                orientation === "horizontal" && option.description ? (
                  <Typography variant="caption">
                    {option.description}
                  </Typography>
                ) : undefined
              }
            >
              {option.label}
            </StepLabel>
            {orientation === "vertical" && option.description && (
              <StepContent>
                <Typography variant="body2" color="text.secondary">
                  {option.description}
                </Typography>
              </StepContent>
            )}
          </Step>
        );
      })}
    </MuiStepper>
  );
}
