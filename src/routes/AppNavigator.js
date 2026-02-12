import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import HomeScreen from '../screens/HomeScreen';
import SendOtp from '../screens/SendOtp';
import VerifyOtp from '../screens/VerifyOtp';
import StudentProfileSetup from '../screens/student/StudentProfileSetup';
import TopperProfileSetup from '../screens/topper/TopperProfileSetup';
import TopperVerification from '../screens/topper/TopperVerification';

const Stack = createNativeStackNavigator();

function GradientWrapper({ children }) {
  return (
    <LinearGradient
      colors={["#141E30", "#000000"]} // Blue → Black
      style={styles.gradient}
    >
      {children}
    </LinearGradient>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" />

      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: "transparent",
          },
          headerTintColor: "#fff",
          headerTransparent: true,
          contentStyle: {
            backgroundColor: "transparent",
          },
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Home"
          // options={{ title: "Notes" }}
        >
          {() => (
            <GradientWrapper>
              <HomeScreen />
            </GradientWrapper>
          )}
        </Stack.Screen>

        <Stack.Screen name="SendOtp">
          {(props) => (
            <GradientWrapper>
              <SendOtp {...props} />
            </GradientWrapper>
          )}
        </Stack.Screen>

        <Stack.Screen name="VerifyOtp">
          {(props) => (
            <GradientWrapper>
              <VerifyOtp {...props} />
            </GradientWrapper>
          )}
        </Stack.Screen>

        <Stack.Screen name="StudentProfileSetup">
          {(props) => (
            <GradientWrapper>
              <StudentProfileSetup {...props} />
            </GradientWrapper>
          )}
        </Stack.Screen>

        <Stack.Screen name="TopperProfileSetup">
          {(props) => (
            <GradientWrapper>
              <TopperProfileSetup {...props} />
            </GradientWrapper>
          )}
        </Stack.Screen>

        <Stack.Screen name="TopperVerification">
          {(props) => (
            <GradientWrapper>
              <TopperVerification {...props} />
            </GradientWrapper>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>  
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
