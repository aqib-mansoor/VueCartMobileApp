import React from "react";
import { View, Text } from "react-native";
import { Check } from "lucide-react-native";
import { THEME } from "../../constants/theme";
import { checkoutStyles as s } from "../../styles/checkoutStyles";

export const CheckoutSteps: React.FC = () => {
  const steps = [
    { num: "1", label: "Cart", done: true },
    { num: "2", label: "Address", active: true },
    { num: "3", label: "Payment" },
  ];

  return (
    <View style={s.stepsBar}>
      {steps.map((step, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && (
            <View
              style={[
                s.stepConn,
                step.done && s.stepConnDone,
                (step as any).active && s.stepConnDone,
              ]}
            />
          )}
          <View style={s.stepCol}>
            <View
              style={[
                s.stepCircle,
                step.done && s.stepDone,
                (step as any).active && s.stepActive,
              ]}
            >
              {step.done ? (
                <Check size={14} color="#FFF" strokeWidth={3} />
              ) : (
                <Text style={[s.stepNum, (step as any).active && s.stepNumActive]}>
                  {step.num}
                </Text>
              )}
            </View>
            <Text
              style={[
                s.stepLabel,
                step.done && s.stepLabelDone,
                (step as any).active && s.stepLabelActive,
              ]}
            >
              {step.label}
            </Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
};
