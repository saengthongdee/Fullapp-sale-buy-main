import "./global.css";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// pages
import LoginPage from "./pages/login";
import Homepage from "./pages/home";
import RoomPage from "./pages/room";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Room"
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Home" component={Homepage} />
        <Stack.Screen name="Room" component={RoomPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
