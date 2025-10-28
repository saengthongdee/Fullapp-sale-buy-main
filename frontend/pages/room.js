import React from "react";
import RoomPage from "./roomPage/RoomPage";

export default function Room({ route, navigation }) {
  
  const { room_number, user_id, Idroom } = route.params || {};

  return (
    <RoomPage 
      route={{ params: { userId: user_id, Idroom, room_number } }} 
      navigation={navigation}
    />
  );
}