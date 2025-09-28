import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";

import RoomData from "../room_number.json"; 
import Nav from "./nav";

export default function MessagesPage({ navigation, route }) {
  const { userId } = route.params;
  const [rooms, setRooms] = useState([]);

  useEffect(() => {

    if (userId === RoomData.user_id) {
      setRooms(RoomData.rooms);
    } else {
      setRooms([]);
    }
  }, [userId]);

  const handleRoomPress = (room_number) => {

    navigation.navigate("Room", { room_number, userId });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      
      {/* Header */}
      <View className="bg-blue-500 shadow-sm border-b">
        <View className="flex-row items-center px-4 py-4 justify-between">
          <Text className="text-white font-semibold text-lg"></Text>
          <Text className="text-white font-semibold text-lg">Messenger</Text>
          <Text className="text-white font-semibold text-lg"></Text>
        </View>
      </View>

      {/* Room List */}
      <ScrollView className="flex-1 p-4">
        {rooms.length > 0 ? (
          rooms.map((room, index) => (
            <TouchableOpacity key={index}
              onPress={() => handleRoomPress(room.room_number)}
              className="p-4 mb-2 bg-gray-100 rounded-lg"
            >
              <Text className="text-gray-800 font-semibold text-lg"> ห้อง {room.room_number}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text className="text-center mt-8 text-gray-400"> ไม่มีห้องสำหรับ user นี้ </Text>
        )}
      </ScrollView>


      <Nav navigation={navigation} />
    </SafeAreaView>
  );
}
