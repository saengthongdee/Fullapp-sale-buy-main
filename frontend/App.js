import "./global.css";
import React, {useState , useEffect} from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// pages
import LoginPage from "./pages/login";
import Homepage from "./pages/home";
import RoomPage from "./pages/room";
import PaymentPage from "./pages/Qrcode";
import MessengerPage from "./pages/messenger";

const Stack = createNativeStackNavigator();


export default function App() {

  const [userId , setUserId] = useState("205");

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Messager"

        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        <Stack.Screen name="Login" component={LoginPage} initialParams={{ userId: userId }} />
        <Stack.Screen name="Home" component={Homepage} initialParams={{ userId: userId }}  />
        <Stack.Screen name="Room" component={RoomPage} initialParams={{ userId: userId }}  />
        <Stack.Screen name="Messager" component={MessengerPage} initialParams={{userId: userId}}></Stack.Screen>

        <Stack.Screen 
            name="PaymentPage" 
            component={PaymentPage} 
            options={{
              animation: "slide_from_right",
            }} 
          />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
