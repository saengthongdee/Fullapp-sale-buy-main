import { useState } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function Nav({ navigation }) {
  const [activeTab, setActiveTab] = useState("Home"); // เริ่มต้นที่ Home

  const handlePress = (tab) => {
    setActiveTab(tab);
    navigation.navigate(tab);
  };

  return (
    <View className="h-[8vh] w-screen flex flex-row justify-around items-center bg-white">

      {/* หน้าแรก */}
      <TouchableOpacity
        onPress={() => handlePress("Home")}
        className="w-14 h-20 flex items-center justify-center"
      >
        <AntDesign name="home" size={28} color={activeTab === "Home" ? "#125c91" : "#6B6B6B"} />

        <Text
          className={`text-center text-sm font-semibold ${
            activeTab === "Home" ? "text-sky-600" : "text-black/60"
          }`}
        >
          หน้าแรก
        </Text>
      </TouchableOpacity>

      {/* ข้อความ */}
      <TouchableOpacity
        onPress={() => handlePress("Message")}
        className="w-14 h-20 flex items-center justify-center"
      >
        <AntDesign name="message1" size={28} color={activeTab === "Message" ? "#125c91" : "#6B6B6B"}
        />
        <Text
          className={`text-center text-sm font-semibold ${
            activeTab === "Message" ? "text-sky-600" : "text-black/60"
          }`}
        >
          ข้อความ
        </Text>
      </TouchableOpacity>

      {/* แจ้งเตือน */}
      <TouchableOpacity
        onPress={() => handlePress("Notification")}
        className="w-auto h-20 flex items-center justify-center"
      >
        <AntDesign name="notification" size={28} color={activeTab === "Notification" ? "#125c91" : "#6B6B6B"}
        />
        <Text
          className={`text-center text-sm font-semibold ${
            activeTab === "Notification" ? "text-sky-600" : "text-black/60"
          }`}
        >
          แจ้งเตือน
        </Text>
      </TouchableOpacity>

      {/* ตั้งค่า */}
      <TouchableOpacity
        onPress={() => handlePress("Setting")}
        className="w-14 h-20 flex items-center justify-center"
      >
        <AntDesign name="setting" size={28} color={activeTab === "Setting" ? "#125c91" : "#6B6B6B"}
        />
        <Text
          className={`text-center text-sm font-semibold ${
            activeTab === "Setting" ? "text-sky-600" : "text-black/60"
          }`}
        >
          ตั้งค่า
        </Text>
      </TouchableOpacity>

    </View>
  );
}
