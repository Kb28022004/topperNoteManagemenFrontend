import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from './AppText';

const TermsAndPrivacy = () => {
    return (
        <View style={styles.bottomContainer}>
            <AppText style={styles.bottomText}>
                By continuing, you agree to ToppersNotes{" "}
                <AppText style={styles.bottomLink} onPress={() => console.log("Terms")}>
                    Terms of Service
                </AppText>
                {" & "}
                <AppText style={styles.bottomLink} onPress={() => console.log("Privacy")}>
                    Privacy Policy
                </AppText>
            </AppText>
        </View>
    );
};

const styles = StyleSheet.create({
    bottomContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    bottomText: {
        fontSize: 13,
        color: "#718096",
        textAlign: "center",
        lineHeight: 20,
    },
    bottomLink: {
        color: "#3b82f6",
        fontWeight: "bold",
    },
});

export default TermsAndPrivacy;
