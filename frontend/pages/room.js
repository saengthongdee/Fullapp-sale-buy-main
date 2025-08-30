import { useState, useRef, useCallback, useEffect } from "react";
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
} from "react-native";
  import { SafeAreaView } from "react-native-safe-area-context";
  import * as ImagePicker from "expo-image-picker";
  import ChatData from "../chat.json";
  import { Ionicons } from "@expo/vector-icons";
  import { Clipboard } from 'react-native';

export default function RoomPage({navigation , route}) {

  /** ==============================
   * 1️⃣ กำหนดผู้ใช้ปัจจุบันและห้องแชท
   ===============================*/

  const currentUserId = "101";
  
  const { Idroom  } = route.params || {};

  const roomId = Idroom  ? Idroom .toString() : "";

  const room = ChatData.rooms.find((r) => r.RoomID === roomId);

  if (!room) return <Text>Room not found</Text>;

  const RoomIdname  = room.RoomID;

  const currentUser = room.users[currentUserId];
  const currentUserRole = currentUser?.role || "buyer";

  /** ==============================
   * 2️⃣ สร้าง state ของข้อความและ input
   ===============================*/
  const initialMessages = Object.entries(room.messages).map(([id, msg]) => ({
    id,
    ...msg,
  }));
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef(null);

  /** ==============================
   * 3️⃣ Modal & Quotation State
   ===============================*/
  const [modalVisible, setModalVisible] = useState(false);
  const [quotationData, setQuotationData] = useState({
    productName: "",
    details: "",
    images: "",
    price: "",
  });

  /** ==============================
   * 4️⃣ Modal & Tracking State
   ===============================*/
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");

  /** ==============================
   * 5️⃣ ฟังก์ชันจัดการข้อความ
   ===============================*/
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
    const textToCopy = RoomIdname; // เปลี่ยนเป็นข้อความที่ต้องการ
      Clipboard.setString(textToCopy);
  };


  /** ==============================
   * 6️⃣ ใบเสนอราคา - ตรวจสอบที่ยังไม่ชำระ (สำหรับผู้ซื้อ)
   ===============================*/

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

  /** ==============================
   * 7️⃣ ฟังก์ชันเลือกภาพใบเสนอราคา
   ===============================*/
  const pickImage = async () => {

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return alert("ต้องอนุญาตเข้าถึงรูปภาพ");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setQuotationData({
        ...quotationData,
        images: quotationData.images ? quotationData.images + "," + uri : uri,
      });
    }
  };

  /** ==============================
   * 8️⃣ ส่งใบเสนอราคา
   ===============================*/
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

  /** ==============================
   * 9️⃣ ชำระเงินใบเสนอราคา (ผู้ซื้อ)
   ===============================*/
  const handlePayQuotation = (quotationId) => {

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === quotationId
          ? { ...msg, quotation: { ...msg.quotation, status: true } }
          : msg
      )
    );

    navigation.navigate("PaymentPage", { 
      roomId: roomId 
    });

    
    const paidMsg = {
      id: (Date.now() + 1).toString(),
      type: "system",
      text: "ชำระเงินเสร็จสิ้น สามารถส่งของได้เลยครับ",
      timestamp: Math.floor(Date.now() / 1000),
      receiver: "admin",
    };
    setMessages((prev) => [...prev, paidMsg]);

  };

  /** ==============================
   * 🔟 กรอกเลขขนส่ง (ผู้ขาย)
   ===============================*/
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

  /** ==============================
   * 1️⃣1️⃣ Render หน้าจอ
   ===============================*/
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "bottom"]}>
      
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />

      {/* Header */}
      <View className="bg-blue-500 shadow-sm">
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center justify-between  w-full">
              <TouchableOpacity 
                onPress={() => navigation.navigate("Home")} 
                className="w-10 h-10 bg-blue-400 rounded-full items-center justify-center mr-3"
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            <Text className="text-white font-semibold text-lg">หมายเลขห้อง : {RoomIdname}</Text>
            <TouchableOpacity onPress={handleCopy} className="text-white font-semibold text-lg">
              <Text className="font-semibold text-white border-b-2 border-white/50">คัดลอก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Chat Container */}
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
                <View className={`px-6 py-3 rounded-2xl max-w-[100%] shadow-sm ${
                    isSystemMsg
                      ? "bg-green-100 rounded-lg"
                      : isQuotation
                      ? "bg-white border border-black/10"
                      : isCurrentUser
                      ? "bg-blue-500 rounded-br-md"
                      : "bg-white border border-gray-200 rounded-bl-md"
                  }`}>
                  {isSystemMsg ? (
                    <Text className="text-gray-500 font-semibold">{item.text}</Text>
                  ) : isQuotation ? (
                    <View className="w-60 flex gap-4">
                      <Text className="font-semibold text-black/60">ใบเสนอราคา</Text>
                      <Text className="text-gray-500">{item.quotation.productName}</Text>
                      <View className="flex flex-row justify-between border-t border-b border-black/20 py-4 text-gray-500 text-sm">
                        <Text className="font-semibold text-black/60">ราคารวมสุทธิ</Text>
                        <Text className="font-semibold text-black/60">฿ {item.quotation.price}</Text>
                      </View>
                      <View className="flex flex-row justify-between py-2">
                        <Text className="font-semibold text-blue-500">ดูฉบับเต็ม</Text>
                        <Text className="font-semibold text-blue-500">ดาวโหลด</Text>
                      </View>
                    </View>
                  ) : (
                    <Text className={`text-base ${isCurrentUser ? "text-white" : "text-gray-800"}`}>
                      {item.text}
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

        {/* ปุ่มชำระเงินสำหรับผู้ซื้อ */}
        {pendingQuotations.map((msg) => (
          <View key={msg.id} className="flex-row px-9 mb-2 gap-2 justify-between items-center">
            <TouchableOpacity className="w-1/2 bg-yellow-500 py-3 rounded-lg items-center justify-center shadow">
              <Text className="text-white font-semibold text-center">ใช้เครดิต</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="w-1/2 bg-green-500 py-3 rounded-lg items-center justify-center shadow"
              onPress={() => handlePayQuotation(msg.id)}
            >
              <Text className="text-white font-semibold text-center">ชำระเงิน</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Input & Send Button */}
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}>
          <View className="bg-white border-t border-gray-200 px-4 py-3">
            <View className="flex-row items-end space-x-2 gap-3">
              {/* ปุ่มส่งใบเสนอราคาสำหรับผู้ขาย */}
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

        {/* Floating Button สำหรับผู้ขายกรอกเลขขนส่ง */}
        {currentUserRole === "seller" &&
          messages.some((msg) => msg.type === "quotation" && msg.quotation.status) && (
            <TouchableOpacity
              className="absolute bottom-24 right-4 bg-blue-500 w-16 h-16 rounded-full items-center justify-center shadow-lg"
              onPress={() => setTrackingModalVisible(true)}
            >
              <Text className="text-white font-bold text-lg">🚚</Text>
            </TouchableOpacity>
          )}

        {/* Quotation Modal */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View className="flex-1 justify-center items-center bg-black/50">
            <ScrollView className="bg-white w-11/12 p-4 rounded-lg max-h-[80%]">
              <Text className="text-lg font-semibold mb-2">สร้างใบเสนอราคา</Text>
              <TextInput
                className="border p-2 mb-2 rounded"
                placeholder="ชื่อสินค้า"
                value={quotationData.productName}
                onChangeText={(text) => setQuotationData({ ...quotationData, productName: text })}
              />
              <TextInput
                className="border p-2 mb-2 rounded"
                placeholder="รายละเอียด"
                value={quotationData.details}
                onChangeText={(text) => setQuotationData({ ...quotationData, details: text })}
              />
              <View className="mb-2">
                <Text className="mb-1 font-semibold">รูปภาพสินค้า</Text>
                <View className="flex-row space-x-2">
                  {quotationData.images &&
                    quotationData.images.split(",").map((uri, idx) => (
                      <Image key={idx} source={{ uri: uri.trim() }} className="w-20 h-20 rounded-lg" />
                    ))}
                  <TouchableOpacity className="w-20 h-20 bg-gray-200 rounded-lg items-center justify-center" onPress={pickImage}>
                    <Text className="text-gray-600 text-3xl">+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TextInput
                className="border p-2 mb-2 rounded"
                placeholder="ราคา"
                keyboardType="numeric"
                value={quotationData.price}
                onChangeText={(text) => setQuotationData({ ...quotationData, price: text })}
              />
              <View className="flex-row justify-end mt-2">
                <TouchableOpacity className="bg-gray-300 px-4 py-2 rounded mr-2" onPress={() => setModalVisible(false)}>
                  <Text>ยกเลิก</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-green-500 px-4 py-2 rounded" onPress={sendQuotation}>
                  <Text className="text-white">ส่งใบเสนอราคา</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/* Tracking Modal */}
        <Modal visible={trackingModalVisible} transparent animationType="fade">
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white w-11/12 p-4 rounded-lg">
              <Text className="text-lg font-semibold mb-2">กรอกเลขขนส่ง</Text>
              <TextInput
                className="border p-2 mb-2 rounded"
                placeholder="เลขขนส่ง"
                value={trackingNumber}
                onChangeText={setTrackingNumber}
              />
              <View className="flex-row justify-end mt-2">
                <TouchableOpacity className="bg-gray-300 px-4 py-2 rounded mr-2" onPress={() => setTrackingModalVisible(false)}>
                  <Text>ยกเลิก</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-green-500 px-4 py-2 rounded" onPress={handleSendTrackingNumber}>
                  <Text className="text-white">บันทึก</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
