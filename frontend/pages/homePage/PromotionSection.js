import React from "react";
import { Text, View, Image } from "react-native";

export default function PromotionSection() {
  return (
    <View className="w-full h-[27vh] px-5 py-5 flex gap-2">
      <Text className="font-semibold text-[#3e3e3e]">โปรโมชั่น</Text>
      <View className="w-full h-[90%] bg-gray-200">
        <Image
          source={require("../../assets/promotion.png")}
          className="w-[100%] h-[100%] rounded-md shadow-md shadow-black border border-white"
        />
      </View>
    </View>
  );
}