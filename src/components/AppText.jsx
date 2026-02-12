import React from "react";
import { Text } from "react-native";

export default function AppText({
  children,
  style,
  weight = "regular",
  ...props
}) {
  // let fontFamily = "Poppins_Regular";
  // if (weight === "bold") fontFamily = "Poppins_Bold";
  // if (weight === "semibold") fontFamily = "Poppins_SemiBold";

  const fontWeight = weight === "bold" ? "bold" : weight === "semibold" ? "600" : "400";

  return (
    <Text
      {...props}
      style={[{ fontWeight, color: "white" }, style]}
    >
      {children}
    </Text>
  );
}
