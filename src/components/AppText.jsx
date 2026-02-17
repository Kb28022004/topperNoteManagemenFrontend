import React, { memo } from "react";
import { Text } from "react-native";

function AppText({
  children,
  style,
  weight = "regular",
  ...props
}) {
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

export default memo(AppText);
