import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
} from "react-native";

import Nav from "./nav";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import Feather from '@expo/vector-icons/Feather';

export default function HomePage({ navigation }) {
  const [Idroom, setIdroom] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [errorRole, setErrorRole] = useState(true);

  const handleInput = () => {
    Keyboard.dismiss();
    if (Idroom === "42565412") {
      setNotFound(false);
      navigation.navigate("Room", { Idroom });
    } else {
      setNotFound(true);
    }
  };

  const handleCreate = () => {
    setModalVisible(true);
  };

  const handleCreatesubmit = () => {
    if (selectedRole !== null && selectedRole !== "") {
      setSelectedRole("");
      navigation.navigate("Room", { Idroom: "42565412" });
      setModalVisible(false);
    } else {
      setErrorRole(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedRole("");
    setErrorRole(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View className="flex-1">
            {/* Scrollable Content */}
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <View className="w-full min-h-[180px] bg-[#197dc5] flex  justify-center items-center ">
                <View className="w-[95%] min-h-[140px] p-4 flex flex-row bg-white rounded-2xl">
                  <View className="w-4/6 flex justify-center gap-2 p-4">
                    <Text className="text-[28px] text-sky-800 font-bold">
                      ยินดีต้อนรับสู่
                    </Text>
                    <Text className="text-2xl text-sky-800 font-medium">
                      Safe PRO
                    </Text>
                    <Text className="font-medium text-[14px] text-sky-800">
                      Point ของคุณ = 50 Point
                    </Text>
                  </View>
                  <View className="w-2/6 bg-white border"></View>
                </View>
              </View>

              {/* Search Room */}
              <View className="w-full flex justify-center items-center px-4 py-8 pb-10">
                <View className="w-full h-[50px] border border-black/50 rounded-full flex flex-row items-center px-1">
                  <View className="w-1/5 h-full flex justify-center items-center">
                    <EvilIcons name="search" size={40} color="#125c91" />
                  </View>
                  <View className="w-3/5 h-full flex justify-center">
                    <TextInput
                      value={Idroom}
                      onChangeText={(text) => {
                        setIdroom(text);
                        setNotFound(false);
                      }}
                      placeholder="ใส่รหัสห้องธุรกรรม"
                      returnKeyType="search"
                      onSubmitEditing={handleInput}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={handleInput}
                    className="w-1/5 h-[90%] bg-[#125c91] flex justify-center items-center rounded-full"
                  >
                    <Text className="text-lg  font-medium text-white">ค้นหา</Text>
                  </TouchableOpacity>
                </View>

                {notFound && (
                  <Text className="text-red-500 text-sm mt-2 absolute bottom-2 text-center">
                    ไม่พบห้องนี้ กรุณาตรวจสอบรหัสอีกครั้ง
                  </Text>
                )}
              </View>
{/* ธุรกรรม */}
              <View className="h-auto w-full flex flex-row flex-wrap gap-2 justify-between px-6">
                <TouchableOpacity
                  onPress={handleCreate}
                  className="w-[25%] aspect-square mb-2 flex justify-center items-center gap-2"
                >
                  <View className="w-[60%] h-[60%] flex justify-center items-center">
                    <Image
                      source={require("../assets/icons8-transaction-1002.png")}
                      className="w-[70%] h-[70%]"
                    />
                  </View>
                  <Text className="font-semibold text-[#3e3e3e] text-sm"> สร้างธุรกรรม</Text>
                </TouchableOpacity>
{/* แพ็คเก็ต */}
                <TouchableOpacity className="w-[25%] aspect-square mb-2 flex justify-center items-center gap-2">
                  <View className="w-[60%] h-[60%] flex justify-center items-center">
                    <Image
                      source={require("../assets/icons8-package-96.png")}
                      className="w-[80%] h-[80%]"
                    />
                  </View>
                  <Text className="font-semibold text-[#3e3e3e] text-sm"> แพ็คเกจสุดคุ้ม</Text>
                </TouchableOpacity>
{/* ค่าบริการ */}
                <TouchableOpacity className="w-[25%] aspect-square mb-2 flex justify-center items-center gap-2">
                  <View className="w-[60%] h-[60%] flex justify-center items-center">
                    <Image
                      source={require("../assets/icons8-money-96.png")}
                      className="w-[70%] h-[70%]"
                    />
                  </View>
                  <Text className="font-semibold text-[#3e3e3e] text-sm"> อัตราค่าบริการ </Text>
                </TouchableOpacity>
{/* ธนาคาร */}
                <TouchableOpacity className="w-[25%] aspect-square mb-2 flex justify-center items-center gap-2">
                  <View className="w-[60%] h-[60%] flex justify-center items-center">
                    <Image
                      source={require("../assets/icons8-bank-100.png")}
                      className="w-[70%] h-[70%]"
                    />
                  </View>
                  <Text className="font-semibold text-[#3e3e3e] text-sm"> เพิ่มธนาคาร </Text>
                </TouchableOpacity>
              </View>

              <View className="w-full h-[27vh] px-5 py-5 flex  gap-2">
                <Text className="font-semibold text-[#3e3e3e]">โปรโมชั่น</Text>
                <View className="w-full h-[90%] bg-gray-200">
                  <Image
                      source={require("../assets/promotion.png")}
                      className="w-[100%] h-[100%] rounded-md  shadow-md shadow-black border border-white"
                    />
                </View>
              </View>
              
            </ScrollView>

            {/* Fixed Nav */}
            <View className="absolute bottom-0 left-0 right-0">
              <Nav navigation={navigation} />
            </View>

            {/* Modal */}
            <Modal
              visible={modalVisible}
              animationType="fade"
              transparent={true}
              onRequestClose={handleCloseModal}
            >
              <TouchableOpacity
                className="flex-1 justify-center items-center bg-black/50"
                activeOpacity={1}
                onPress={() => setModalVisible(false)}
              >
                <TouchableOpacity
                  activeOpacity={1}
                  className="w-[80%] bg-white p-4 rounded-2xl"
                >
                  <Text className="text-lg font-bold text-center mb-4">
                    เลือกบทบาทของคุณ
                  </Text>

                  <View className="w-full h-[20vh] p-2 py-4 flex justify-center items-center flex-row gap-3">
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedRole("seller");
                        setErrorRole(true);
                      }}
                      className={`w-1/2 h-full border flex justify-center items-center gap-2 rounded-lg border-black/40 ${
                        selectedRole === "seller" ? "bg-sky-200" : "bg-white"
                      }`}
                    >
                      <Image
                        source={require("../assets/icons8-agent-100.png")}
                        className="w-[70%] h-[70%]"
                      />
                      <Text className="font-bold text-[#125c91]">ผู้ขาย</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setSelectedRole("buyer");
                        setErrorRole(true);
                      }}
                      className={`w-1/2 h-full border flex justify-center items-center gap-2 rounded-lg border-black/40 ${
                        selectedRole === "buyer" ? "bg-sky-200" : "bg-white"
                      }`}
                    >
                      <Image
                        source={require("../assets/icons8-businessman-100.png")}
                        className="w-[70%] h-[70%]"
                      />
                      <Text className="font-bold text-[#125c91]">ผู้ซื้อ</Text>
                    </TouchableOpacity>
                  </View>

                  {errorRole ? (
                    <Text></Text>
                  ) : (
                    <Text className="text-center py-2 text-red-500 font-semibold">
                      กรุณาเลือกบทบาทผู้สร้างธุรกรรม
                    </Text>
                  )}

                  <TouchableOpacity
                    onPress={() => handleCreatesubmit()}
                    className="bg-[#125c91] p-3 py-4 rounded-md"
                  >
                    <Text className="text-white text-center font-bold">
                      สร้างธุรกรรม
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </TouchableOpacity>
            </Modal>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
