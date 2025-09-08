import { useState, useRef, useCallback } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Modal,
  ScrollView,
  Image,
  Keyboard,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import ChatData from "../chat.json";
import { Ionicons } from "@expo/vector-icons";
import { Clipboard } from "react-native";

export default function RoomPage({ navigation, route }) {
  const currentUserId = "101";
  const { Idroom } = route.params || {};
  const roomId = Idroom ? Idroom.toString() : "";
  const room = ChatData.rooms.find((r) => r.RoomID === roomId);
  if (!room) return <Text>Room not found</Text>;

  const RoomIdname = room.RoomID;
  const currentUser = room.users[currentUserId];
  const currentUserRole = currentUser?.role || "buyer";

  const initialMessages = Object.entries(room.messages).map(([id, msg]) => ({
    id,
    ...msg,
  }));

  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [quotationData, setQuotationData] = useState({
    productName: "",
    details: "",
    images: "",
    price: "",
  });

  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleTextChange = useCallback((text) => setInputText(text), []);

  const sendMessage = () => {
    if (inputText.trim() === "") return;

    const newMsg = {
      id: Date.now().toString(),
      sender_id: currentUserId,
      text: inputText,
      timestamp: Math.floor(Date.now() / 1000),
    };

    setMessages([...messages, newMsg]);
    setInputText("");
    Keyboard.dismiss();
  };

  const formatTime = (timestamp) =>
    new Date(timestamp * 1000).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleInputFocus = () => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 300);
  };

  const handleCopy = () => {
    Clipboard.setString(RoomIdname);
  };

  // ตรวจสอบใบเสนอราคาที่ยังไม่ได้ชำระ
  const pendingQuotations = messages.filter(
    (msg) =>
      msg.type === "quotation" &&
      msg.sender_id !== currentUserId &&
      currentUserRole === "buyer" &&
      msg.quotation.status === false
  );

  const hasSentQuotation = messages.some(
    (msg) => msg.type === "quotation" && msg.sender_id === currentUserId
  );

  // ตรวจสอบเลขขนส่ง
  const hasTracking = messages.some(
    (msg) =>
      msg.type === "system" &&
      msg.text?.startsWith("ผู้ขายได้กรอกเลขขนส่ง")
  );

  // ตรวจสอบการยืนยันได้รับสินค้า
  const hasConfirmedDelivery = messages.some(
    (msg) =>
      msg.type === "system" &&
      msg.text?.startsWith("ผู้ซื้อยืนยันการได้รับของแล้ว")
  );

  // เพิ่มบรรทัดนี้ก่อน return
const paidQuotations = messages.filter(
  (msg) =>
    msg.type === "quotation" &&
    msg.quotation.status === true
);

const showTrackingButton = currentUserRole === "seller" && paidQuotations.length > 0 && !hasTracking;


  // รูปภาพใบเสนอราคา
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return alert("ต้องอนุญาตเข้าถึงรูปภาพ");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map((asset) => asset.uri);
      const existingUris = quotationData.images ? quotationData.images.split(",") : [];
      const combined = [...existingUris, ...selectedUris].slice(0, 3);
      setQuotationData({ ...quotationData, images: combined.join(",") });
    }
  };

  const sendQuotation = () => {
    if (!quotationData.productName || !quotationData.price) {
      return alert("กรุณากรอกชื่อสินค้าและราคา");
    }

    const newQuotation = {
      id: Date.now().toString(),
      sender_id: currentUserId,
      type: "quotation",
      quotation: { ...quotationData, status: false },
      timestamp: Math.floor(Date.now() / 1000),
    };

    setMessages([...messages, newQuotation]);
    setQuotationData({ productName: "", details: "", images: "", price: "" });
    setModalVisible(false);
  };

  const handlePayQuotation = (quotationId) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === quotationId
          ? { ...msg, quotation: { ...msg.quotation, status: true } }
          : msg
      )
    );

    navigation.navigate("PaymentPage", { roomId: roomId });

    const paidMsg = {
      id: (Date.now() + 1).toString(),
      type: "system",
      text: "ชำระเงินเสร็จสิ้น สามารถส่งของได้เลยครับ",
      timestamp: Math.floor(Date.now() / 1000),
    };
    setMessages((prev) => [...prev, paidMsg]);
  };

  const handleSendTrackingNumber = () => {
    if (!trackingNumber) return alert("กรุณากรอกเลขขนส่ง");

    const systemMsg = {
      id: Date.now().toString(),
      type: "system",
      text: `ผู้ขายได้กรอกเลขขนส่ง: ${trackingNumber}`,
      timestamp: Math.floor(Date.now() / 1000),
    };

    setMessages((prev) => [...prev, systemMsg]);
    setTrackingNumber("");
    setTrackingModalVisible(false);
  };

  const handleConfirmDelivery = () => {
    const confirmMsg = {
      id: Date.now().toString(),
      type: "system",
      text: "ผู้ซื้อยืนยันการได้รับของแล้ว การซื้อขายเสร็จสมบูรณ์",
      timestamp: Math.floor(Date.now() / 1000),
    };

    setMessages((prev) => [...prev, confirmMsg]);
  };

  const showDeliveryButton =
    pendingQuotations.length === 0 && hasTracking && currentUserRole === "buyer" && !hasConfirmedDelivery;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />

      {/* Header */}
      <View className="bg-blue-500 shadow-sm">
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center justify-between w-full">
            <TouchableOpacity
              onPress={() => navigation.navigate("Home")}
              className="w-10 h-10 bg-blue-400 rounded-full items-center justify-center mr-3"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white font-semibold text-lg">
              หมายเลขห้อง : {RoomIdname}
            </Text>
            <TouchableOpacity onPress={handleCopy}>
              <Text className="font-semibold text-white border-b-2 border-white/50">คัดลอก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Chat */}
      <View className="flex-1">
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          className="flex-1 bg-gray-50"
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50)
          }
          renderItem={({ item }) => {
            const isQuotation = item.type === "quotation";
            const isCurrentUser = item.sender_id === currentUserId;
            const isSystemMsg = item.type === "system";

            return (
              <View className={`mb-3 ${isSystemMsg ? "items-center" : isCurrentUser ? "items-end" : "items-start"}`}>
                <View
                  className={`px-6 py-3 rounded-2xl max-w-[100%] shadow-sm ${
                    isSystemMsg
                      ? "bg-green-100 rounded-lg"
                      : isQuotation
                      ? "bg-white border border-black/10"
                      : isCurrentUser
                      ? "bg-blue-500 rounded-br-md"
                      : "bg-white border border-gray-200 rounded-bl-md"
                  }`}
                >
                  {isSystemMsg ? (
                    <Text className="text-gray-500 font-semibold">{item.text || ""}</Text>
                  ) : isQuotation ? (
                    <View className="w-60 flex gap-4">
                      <Text className="font-semibold text-black/60">ใบเสนอราคา</Text>
                      <Text className="text-gray-500">{item.quotation.productName || ""}</Text>
                      <View className="flex flex-row justify-between border-t border-b border-black/20 py-4 text-gray-500 text-sm">
                        <Text className="font-semibold text-black/60">ราคารวมสุทธิ</Text>
                        <Text className="font-semibold text-black/60">฿ {item.quotation.price || ""}</Text>
                      </View>
                      <View className="flex flex-row justify-between py-2">
                        <Text className="font-semibold text-blue-500">ดูฉบับเต็ม</Text>
                        <Text className="font-semibold text-blue-500">ดาวโหลด</Text>
                      </View>
                    </View>
                  ) : (
                    <Text className={`text-base ${isCurrentUser ? "text-white" : "text-gray-800"}`}>
                      {item.text || ""}
                    </Text>
                  )}
                </View>
                {!isSystemMsg && (
                  <Text className={`text-xs text-gray-400 mt-1 ${isCurrentUser ? "text-right" : "text-left"}`}>
                    {formatTime(item.timestamp)}
                  </Text>
                )}
              </View>
            );
          }}
        />

        {/* ปุ่มชำระเงิน */}
        {pendingQuotations.map((msg) => (
          <View key={msg.id} className="flex-row px-9 mb-2 gap-2 justify-between items-center">
            <TouchableOpacity
              className="w-full bg-green-500 py-3 rounded-lg items-center justify-center shadow"
              onPress={() => handlePayQuotation(msg.id)}
            >
              <Text className="text-white font-semibold text-center">ชำระเงิน</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* ปุ่มผู้ซื้อ: ยืนยัน / ยกเลิก */}
        {showDeliveryButton && (
          <View className="px-6 py-2 flex-row justify-center gap-3">

            <TouchableOpacity
              className="w-1/2 bg-red-400 py-3 border border-black/50 px-4 rounded-lg items-center justify-center"
              onPress={() => alert("ยกเลิกสินค้าเรียบร้อย")}
            >
              <Text className="text-white font-semibold">ยกเลิกสินค้า</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-1/2 bg-green-400 py-3 px-4  border border-black/50 rounded-lg items-center justify-center"
              onPress={handleConfirmDelivery}
            >
              <Text className="text-white font-semibold">ยืนยันได้รับสินค้า</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input */}
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}>
          <View className="bg-white border-t border-gray-200 px-4 py-3">
            <View className="flex-row items-end space-x-2 gap-3">
              {currentUserRole === "seller" && !hasSentQuotation && (
                <TouchableOpacity className="px-3 py-2 rounded-full bg-green-500" onPress={() => setModalVisible(true)}>
                  <Text className="text-white py-1 font-semibold">ส่งใบเสนอราคา</Text>
                </TouchableOpacity>
              )}
              <View className="flex-1 bg-gray-100 rounded-3xl px-4 max-h-24">
                <TextInput
                  className="text-base text-gray-800"
                  placeholder="พิมพ์ข้อความ..."
                  placeholderTextColor="#9CA3AF"
                  value={inputText}
                  onChangeText={handleTextChange}
                  multiline
                  textAlignVertical="center"
                  onFocus={handleInputFocus}
                  returnKeyType="send"
                  onSubmitEditing={sendMessage}
                />
              </View>
              <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center mb-1 bg-blue-500" onPress={sendMessage}>
                <Text className="text-white text-lg">➤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Quotation Modal */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white w-11/12 h-[65vh] rounded-lg overflow-hidden">
              <ScrollView className="px-4 pt-4 pb-24">
                <Text className="text-lg font-semibold mb-2 text-center p-2 border-b text-[#125c91] border-gray-300">สร้างใบเสนอราคา</Text>

                <Text className="font-semibold text-black/70 py-2">ชื่อสินค้า</Text>
                <TextInput
                  className="border border-black/50 p-2 mb-2 rounded"
                  placeholder="ชื่อสินค้า"
                  value={quotationData.productName}
                  onChangeText={(text) => setQuotationData({ ...quotationData, productName: text })}
                />

                <Text className="font-semibold text-black/70 py-2">รายละเอียดสินค้า</Text>
                <TextInput
                  className="border border-black/50 p-2 mb-2 rounded"
                  placeholder="รายละเอียด"
                  value={quotationData.details}
                  onChangeText={(text) => setQuotationData({ ...quotationData, details: text })}
                />

                <View className="mb-2">
                  <Text className="mb-1 font-semibold text-black/70 py-2">รูปภาพสินค้า (สูงสุด 3 รูป)</Text>
                  <View className="flex-row space-x-2 gap-3">
                    {quotationData.images &&
                      quotationData.images.split(",").map((uri, idx) => (
                        <View key={idx} className="relative">
                          <Image source={{ uri: uri.trim() }} className="w-20 h-20 rounded-lg border border-black/70" />
                          <TouchableOpacity
                            onPress={() => {
                              const newImages = quotationData.images
                                .split(",")
                                .filter((_, i) => i !== idx)
                                .join(",");
                              setQuotationData({ ...quotationData, images: newImages });
                            }}
                            className="absolute -top-2 -right-2 bg-red-400 w-5 h-5 rounded-full items-center justify-center"
                          >
                            <Text className="text-white text-xs">x</Text>
                          </TouchableOpacity>
                        </View>
                      ))}

                    {(!quotationData.images || quotationData.images.split(",").length < 3) && (
                      <TouchableOpacity
                        className="w-20 h-20 ml-3 bg-gray-200 rounded-lg items-center justify-center"
                        onPress={pickImage}
                      >
                        <Text className="text-gray-600 text-3xl">+</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <Text className="font-semibold text-black/70 py-2">ราคา</Text>
                <TextInput
                  className="border border-black/50 p-2 mb-2 rounded"
                  placeholder="ราคา"
                  keyboardType="numeric"
                  value={quotationData.price}
                  onChangeText={(text) => setQuotationData({ ...quotationData, price: text })}
                />
              </ScrollView>

              <View className="flex-row justify-center items-center gap-2 p-4 border-t border-gray-200 bg-white">
                <TouchableOpacity
                  className="flex-1 bg-gray-300 px-4 py-3 rounded"
                  onPress={() => {
                    setModalVisible(false);
                    setQuotationData({ productName: "", details: "", images: "", price: "" });
                  }}
                >
                  <Text className="text-center font-semibold">ยกเลิก</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-[#2251a2] px-4 py-3 rounded" onPress={sendQuotation}>
                  <Text className="text-white text-center font-semibold">ส่งใบเสนอราคา</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ปุ่มลอยกรอกเลขขนส่งผู้ขาย */}
        {showTrackingButton && (
          <View className="absolute bottom-20 px-4 w-full">
            <TouchableOpacity
              className="bg-[#125c91] border border-black/50 py-3 px-4 rounded-lg shadow-lg items-center justify-center"
              onPress={() => setTrackingModalVisible(true)}
            >
              <Text className="text-white font-semibold">กรอกเลขขนส่ง</Text>
            </TouchableOpacity>
          </View>
        )}


        {/* Tracking Modal */}
        <Modal visible={trackingModalVisible} transparent animationType="fade">
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white w-11/12 p-4 rounded-lg">
              <Text className="text-lg font-semibold pb-3 text-center text-[#125c91]">กรอกเลขขนส่ง</Text>
              <TextInput
                className="border p-2 mb-2 rounded border-black/50"
                placeholder="เลขขนส่ง"
                value={trackingNumber}
                onChangeText={setTrackingNumber}
              />
              <View className="flex-row justify-center mt-2 gap-2">
                <TouchableOpacity className="w-1/2 bg-gray-300 px-4 py-2 rounded" onPress={() => setTrackingModalVisible(false)}>
                  <Text className="text-center">ยกเลิก</Text>
                </TouchableOpacity>
                <TouchableOpacity className="w-1/2 bg-[#125c91] px-4 py-2 rounded" onPress={handleSendTrackingNumber}>
                  <Text className="text-white text-center">บันทึก</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
