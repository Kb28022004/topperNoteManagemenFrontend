import { View, Text, StyleSheet, Image } from "react-native";
import React, { useState, useEffect } from "react";
import ReusableButton from "../components/ReausableButton";
import SelectUserCard from "../components/SelectUserCard";
import AppText from "../components/AppText";
import Loader from "../components/Loader";

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Adjust duration as needed

    return () => clearTimeout(timer);
  }, []);

  return (

    <View style={styles.container}>
      <Loader visible={isLoading} />
      {/* top section */}
      <View style={styles.top}>
        <View style={styles.topFirstSection}>
          <Image
            source={require("../../assets/topperNotes.avif")}
            style={styles.logo}
          />
          <AppText style={styles.topFirstSectionText}>ToppersNote</AppText>
        </View>

        <View style={styles.topSecondSection}>
          <AppText style={styles.topSecondSectionText}>
            Welcome to TopperNotes
          </AppText>
          <AppText style={styles.topSecondSectionLastText}>
            Help others study or start learning today !
          </AppText>
        </View>
      </View>

      {/* middle section */}
      <View style={styles.middle}>
        <SelectUserCard
          imageSource={require("../../assets/student.avif")}
          title="I'm a Student"
          description="Find verified notes & ace your exams"
          routeName="SendOtp"
          params={{ role: 'STUDENT' }}
        />

        <SelectUserCard
          imageSource={require("../../assets/topper.avif")}
          title="I'm a Topper"
          description="Uploads your notes & earn"
          routeName="SendOtp"
          params={{ role: 'TOPPER' }}
        />
      </View>

      {/* bottom section */}
      <View style={styles.bottom}>
        <ReusableButton
          title="Get Started"
          onPress={() => console.log("Pressed")}

        />
        <AppText
          style={styles.bottomText}
          onPress={() => console.log("Pressed")}>
          Already have an account ? &nbsp;
          <AppText
            style={styles.bottomTextLogin}>
            Log in</AppText>
        </AppText>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 55,


  },

  top: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  topFirstSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,

  },

  topSecondSection: {
    alignItems: "center",
    justifyContent: "center",

  },

  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginRight: 15,
  },

  topFirstSectionText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },

  topSecondSectionText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginTop: 25, // number, not string
  },
  topSecondSectionLastText: {
    fontSize: 16,

    color: "#9E9E9E",
    textAlign: "center",
    marginTop: 10,
  },

  middle: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },

  bottom: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",

  },

  bottomText: {
    fontSize: 18,
    color: "white",
    marginTop: 20,
    textAlign: "center",
  },

  bottomTextLogin: {
    fontSize: 18,
    color: "#00b1fcff",
    fontWeight: "bold",
  },
});

