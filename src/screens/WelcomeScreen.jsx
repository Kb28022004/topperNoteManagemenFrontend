import { View, Text, StyleSheet, Image } from "react-native";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import ReusableButton from "../components/ReausableButton";
import SelectUserCard from "../components/SelectUserCard";
import AppText from "../components/AppText";
import Loader from "../components/Loader";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      const userStr = await AsyncStorage.getItem("user");
      if (token && userStr) {
        const user = JSON.parse(userStr);
        if (user.role === "STUDENT") {
          navigation.replace("Home");
          return;
        } else if (user.role === "ADMIN") {
          navigation.replace("AdminDashboard");
          return;
        } else if (user.role === "TOPPER") {
          // If topper is verified, they go home, else pending
          if (user.isTopperVerified) {
            navigation.replace("Home"); // Note: Topper might need their own home eventually
          } else {
            navigation.replace("TopperApprovalPending");
          }
          return;
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [navigation]);

  const handleGetStarted = useCallback(() => {
    console.log("Pressed Get Started");
  }, []);

  const handleLogin = useCallback(() => {
    console.log("Pressed Login");
  }, []);

  const studentParams = useMemo(() => ({ role: 'STUDENT' }), []);
  const topperParams = useMemo(() => ({ role: 'TOPPER' }), []);

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
          params={studentParams}
        />

        <SelectUserCard
          imageSource={require("../../assets/topper.avif")}
          title="I'm a Topper"
          description="Uploads your notes & earn"
          routeName="SendOtp"
          params={topperParams}
        />
      </View>

      {/* bottom section */}
      <View style={styles.bottom}>
        <ReusableButton
          title="Get Started"
          onPress={handleGetStarted}
        />
        <AppText
          style={styles.bottomText}
          onPress={handleLogin}>
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

  },

  topSecondSection: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40
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

