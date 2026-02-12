import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "./AppText";

const Stepper = ({ currentStep, totalSteps }) => {
    const percentage = Math.min(Math.max((currentStep / totalSteps) * 100, 0), 100);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <AppText style={styles.text}>Step {currentStep} of {totalSteps}</AppText>
                <AppText style={styles.text}>{Math.round(percentage)}%</AppText>
            </View>
            <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 25,
        width: "100%",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    text: {
        color: "#a0aec0", 
        fontSize: 14,
        fontWeight: "600",
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: "#2d3748",
        borderRadius: 3,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: "#3a6eceff",
        borderRadius: 4,
    },
});

export default Stepper;


