import * as React from "react";
import { styled } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import { StepIconProps } from "@mui/material/StepIcon";
import { ClipboardCheck, PackageCheck, Soup, Truck } from "lucide-react";
import useMediaQuery from "@mui/material/useMediaQuery";

const ColorlibConnector = styled(StepConnector)(({ theme }) => {
  const isMobile = useMediaQuery("(max-width:800px)");

  return {
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
      top: 22,
    },
    [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        backgroundImage:
          "linear-gradient( 95deg,#c7a200 0%,#c7a200 50%,#01a101 100%)",
      },
    },
    [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        backgroundImage:
          "linear-gradient( 95deg,#c7a200 0%,#c7a200 50%,#c7a200 100%)",
      },
    },
    [`& .${stepConnectorClasses.line}`]: {
      height: 3,
      border: 0,
      backgroundColor: "#eaeaf0",
      borderRadius: 1,
      ...theme.applyStyles("dark", {
        backgroundColor: theme.palette.grey[800],
      }),
    },
    [`&.${stepConnectorClasses.vertical}`]: {
      marginLeft: isMobile ? 17 : 25,
      padding: "0 0 0",
      [`& .${stepConnectorClasses.line}`]: {
        height: "auto",
        width: 3,
        minHeight: 30,
        marginTop: 0,
        marginBottom: 0,
        borderRadius: 1,
      },
      [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
          backgroundImage:
            "linear-gradient( 180deg, #c7a200 0%, #c7a200 50%, #01a101 100%)",
        },
      },
      [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
          backgroundImage:
            "linear-gradient( 180deg, #c7a200 0%, #c7a200 50%, #c7a200 100%)",
        },
      },
    },
  };
});

const ColorlibStepIconRoot = styled("div")<{
  ownerState: { completed?: boolean; active?: boolean; isMobile?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor: "#ccc",
  zIndex: 1,
  color: "#fff",
  width: ownerState.isMobile ? 35 : 50,
  height: ownerState.isMobile ? 35 : 50,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  ...theme.applyStyles("dark", {
    backgroundColor: theme.palette.grey[700],
  }),
  variants: [
    {
      props: ({ ownerState }) => ownerState.active,
      style: {
        backgroundImage:
          "linear-gradient( 136deg, #009500 0%, #009500 50%, #07ff08 100%)",
        boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
      },
    },
    {
      props: ({ ownerState }) => ownerState.completed,
      style: {
        backgroundImage:
          "linear-gradient( 136deg, #c77b00 0%, #c77b00 50%, #c7cb00 100%)",
      },
    },
  ],
}));

function ColorlibStepIcon(props: StepIconProps) {
  const { active, completed, className } = props;
  const isMobile = useMediaQuery("(max-width:800px)");

  const icons: { [index: string]: React.ReactElement<unknown> } = {
    1: <ClipboardCheck size={isMobile ? 18 : 24} />,
    2: <PackageCheck size={isMobile ? 18 : 24} />,
    3: <Soup size={isMobile ? 18 : 24} />,
    4: <Truck size={isMobile ? 18 : 24} />,
    5: <Truck size={isMobile ? 18 : 24} />,
  };

  return (
    <ColorlibStepIconRoot
      ownerState={{ completed, active, isMobile }}
      className={className}
    >
      {icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
}

const steps = [
  { title: "Order Placed", description: "We have received your order" },
  { title: "Order Confirmed", description: "Your order has been confirmed" },
  { title: "Order Processing", description: "Your order is being prepared" },
  { title: "Order is Ready", description: "Your order is ready to be served" },
  { title: "Order Delivered", description: "Enjoy your meal!" },
];

// Adjust steps based on order status
const getStepConfiguration = (activeStep: number, status?: string) => {
  // If order is cancelled, modify the final step
  if (status?.toLowerCase() === "cancelled") {
    return [
      { title: "Order Placed", description: "We received your order" },
      { title: "Order Confirmed", description: "Your order was confirmed" },
      {
        title: "Order Cancelled",
        description: "Your order has been cancelled",
      },
    ];
  }

  // Default steps for normal flow
  return steps;
};

export default function CustomizedSteppers({
  activeStep,
  status,
}: {
  activeStep: number;
  status?: string;
}) {
  const isMobile = useMediaQuery("(max-width:800px)");
  const currentSteps = getStepConfiguration(activeStep, status);

  return (
    <Stack sx={{ width: "100%" }} spacing={4}>
      <Stepper
        alternativeLabel={!isMobile}
        orientation={isMobile ? "vertical" : "horizontal"}
        activeStep={activeStep}
        connector={<ColorlibConnector />}
        sx={{
          ...(isMobile && {
            "& .MuiStepConnector-root": { minHeight: 30 },
            "& .MuiStepLabel-root": { padding: "0px 0" },
            "& .MuiStep-root:not(:last-child)": { paddingBottom: "0px" },
            "& .MuiStepLabel-iconContainer": { paddingRight: "15px" },
          }),
        }}
      >
        {currentSteps.map((step, index) => (
          <Step key={step.title}>
            <StepLabel
              slots={{ stepIcon: ColorlibStepIcon }}
              slotProps={{ stepIcon: { icon: index + 1 } }}
            >
              <div
                className={`font-[400] flex flex-col items-start max-[800px]:w-fit min-[800px]:items-center `}
              >
                <div className="text-sm">{step.title}</div>
                <div className={`text-[10px] text-gray-500 `}>
                  {step.description}
                </div>
              </div>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Stack>
  );
}
