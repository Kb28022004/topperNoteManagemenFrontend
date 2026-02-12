import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "./AppText";

const ReusableButton = ({ title, onPress, style, textStyle, disabled }) => {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <View style={styles.content}>
        <AppText style={[styles.text, textStyle]}>{title}</AppText>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </View>
    </TouchableOpacity>
  );
};

export default ReusableButton;

const styles = StyleSheet.create({
  button: {
    width: "100%",
    backgroundColor: "#4377d8ff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,

  },
  text: {
    color: "#ffffffff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
