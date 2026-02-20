import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import WelcomeScreen from '../screens/WelcomeScreen';
import StudentHome from '../screens/student/StudentHome';
import SendOtp from '../screens/SendOtp';
import VerifyOtp from '../screens/VerifyOtp';
import StudentProfileSetup from '../screens/student/StudentProfileSetup';
import TopperProfileSetup from '../screens/topper/TopperProfileSetup';
import TopperVerification from '../screens/topper/TopperVerification';
import TopperApprovalPending from '../screens/topper/TopperApprovalPending';
import TopperHome from '../screens/topper/TopperHome';
import TopperDashboard from '../screens/topper/TopperDashboard';
import TopperProfile from '../screens/topper/TopperProfile';
import NotePreview from '../screens/topper/NotePreview';
import UploadNotes from '../screens/topper/UploadNotes';
import AdminProfileSetup from '../screens/admin/AdminProfileSetup';
import AdminDashboard from '../screens/admin/AdminDashboard';
import Store from '../screens/student/Store';
import MyLibrary from '../screens/student/MyLibrary';
import Profile from '../screens/student/Profile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

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

const Tab = createBottomTabNavigator();

function TopperTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopWidth: 1,
          borderTopColor: '#1E293B',
          height: 70,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#00B1FC',
        tabBarInactiveTintColor: '#64748B',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'TopperHome') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'TopperDashboard') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'TopperUploads') iconName = focused ? 'cloud-upload' : 'cloud-upload-outline';
          else if (route.name === 'TopperProfile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="TopperHome" component={TopperHome} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="TopperDashboard" component={TopperDashboard} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="TopperUploads" component={UploadNotes} options={{ tabBarLabel: 'Uploads' }} />
      <Tab.Screen name="TopperProfile" component={TopperProfile} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

function StudentTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopWidth: 1,
          borderTopColor: '#1E293B',
          height: 70,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#00B1FC',
        tabBarInactiveTintColor: '#64748B',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'StudentHome') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'MyLibrary') iconName = focused ? 'library' : 'library-outline';
          else if (route.name === 'Store') iconName = focused ? 'storefront' : 'storefront-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="StudentHome" component={StudentHome} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="MyLibrary" component={MyLibrary} options={{ tabBarLabel: 'My Library' }} /> 
      <Tab.Screen name="Store" component={Store} options={{ tabBarLabel: 'Store' }} />
      <Tab.Screen name="Profile" component={Profile} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

function DashboardWrapper(props) {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const getRole = async () => {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        setRole(JSON.parse(user).role);
      }
    };
    getRole();
  }, []);

  if (role === 'TOPPER') return <TopperTabNavigator />;
  return <StudentTabNavigator />;
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" />

      <Stack.Navigator
        initialRouteName="Welcome"
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
        <Stack.Screen name="Welcome">
          {() => (
            <GradientWrapper>
              <WelcomeScreen />
            </GradientWrapper>
          )}
        </Stack.Screen>

        <Stack.Screen name="Home">
          {(props) => <DashboardWrapper {...props} />}
        </Stack.Screen>

        <Stack.Screen name="NotePreview" component={NotePreview} />
        <Stack.Screen name="StudentNoteDetails" component={require('../screens/student/StudentNoteDetails').default} />

        <Stack.Screen name="UploadNotes">
          {(props) => <UploadNotes {...props} />}
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

        <Stack.Screen name="TopperApprovalPending">
          {(props) => (
            <GradientWrapper>
              <TopperApprovalPending {...props} />
            </GradientWrapper>
          )}
        </Stack.Screen>

        <Stack.Screen name="PublicTopperProfile" component={require('../screens/topper/PublicTopperProfile').default} />

        <Stack.Screen name="AdminProfileSetup">
          {(props) => (
            <GradientWrapper>
              <AdminProfileSetup {...props} />
            </GradientWrapper>
          )}
        </Stack.Screen>

        <Stack.Screen name="AdminDashboard">
          {(props) => (
            <GradientWrapper>
              <AdminDashboard {...props} />
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
