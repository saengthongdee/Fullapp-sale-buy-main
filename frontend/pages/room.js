import { useState, useRef, useEffect, useCallback } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  StatusBar,
  Animated,
  Modal,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import ChatData from "../chat.json";

export default function RoomPage() {
  const currentUserId = "205"; // สมมติ user ปัจจุบัน
  const currentUserRole = ChatData.rooms.abc123.users[currentUserId].role;

  const initialMessages = Object.entries(ChatData.rooms.abc123.messages).map(
    ([id, msg]) => ({ id, ...msg })
  );

  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [quotationData, setQuotationData] = useState({
    productName: "",
    details: "",
    images: "",
    price: "",
    notes: "",
  });
  const [selectedBuyerId, setSelectedBuyerId] = useState(null);

  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [quotationModalVisible, setQuotationModalVisible] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  const dotAnim = useRef(new Animated.Value(0)).current;

  // Keyboard listeners
  useEffect(() => {
    const keyboardWillShow = (event) => {
      if (Platform.OS === "ios") setKeyboardHeight(event.endCoordinates.height);
    };
    const keyboardWillHide = () => setKeyboardHeight(0);
    const keyboardDidShow = (event) => {
      if (Platform.OS === "android") setKeyboardHeight(event.endCoordinates.height);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    };
    const keyboardDidHide = () => {
      if (Platform.OS === "android") setKeyboardHeight(0);
    };

    const showListener =
      Platform.OS === "ios"
        ? Keyboard.addListener("keyboardWillShow", keyboardWillShow)
        : Keyboard.addListener("keyboardDidShow", keyboardDidShow);
    const hideListener =
      Platform.OS === "ios"
        ? Keyboard.addListener("keyboardWillHide", keyboardWillHide)
        : Keyboard.addListener("keyboardDidHide", keyboardDidHide);

    return () => {
      showListener?.remove();
      hideListener?.remove();
    };
  }, []);

  // Typing animation
  useEffect(() => {
    if (otherUserTyping) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(dotAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [otherUserTyping, dotAnim]);

  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => {
        setOtherUserTyping(true);
        setTimeout(() => setOtherUserTyping(false), 3000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isTyping]);

  const handleTextChange = useCallback((text) => {
    setInputText(text);
    setIsTyping(text.length > 0);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (text.length > 0) {
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1000);
    } else setIsTyping(false);
  }, []);

  const sendMessage = () => {
    if (inputText.trim() === "") {
      const newMsg = {
        id: Date.now().toString(),
        sender_id: currentUserId,
        text: "👍",
        timestamp: Math.floor(Date.now() / 1000),
      };
      setMessages([...messages, newMsg]);
      return;
    }
    const newMsg = {
      id: Date.now().toString(),
      sender_id: currentUserId,
      text: inputText,
      timestamp: Math.floor(Date.now() / 1000),
    };
    setMessages([...messages, newMsg]);
    setInputText("");
    setIsTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  };

  const handleInputFocus = () => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 300);
  };

  // Pick image
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("ต้องอนุญาตเข้าถึงรูปภาพ");
      return;
    }
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />

      {/* Header */}
      <View className="bg-blue-500 shadow-sm">
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-blue-400 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold text-lg">A</Text>
            </View>
            <View>
              <Text className="text-white font-semibold text-lg">
                {ChatData.rooms.abc123.users[currentUserId].name}
              </Text>
              <Text className="text-blue-100 text-sm">
                {isTyping ? "กำลังพิม..." : "ออนไลน์"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Chat Container */}
      <View className="flex-1" style={{ marginBottom: Platform.OS === "ios" ? keyboardHeight : 0 }}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          className="flex-1 bg-gray-50"
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50)}
          renderItem={({ item }) => {
            const isQuotation = item.type === "quotation";
            const isCurrentUser = item.sender_id === currentUserId;

            return (
              <View className={`mb-3 ${isCurrentUser ? "items-end" : "items-start"}`}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    if (isQuotation) {
                      setSelectedQuotation(item.quotation);
                      setQuotationModalVisible(true);
                    }
                  }}
                >
                  <View
                    className={`px-6 py-3 rounded-2xl max-w-[100%] shadow-sm ${
                      isCurrentUser ? "bg-blue-500 rounded-br-md" : "bg-white rounded-bl-md border border-gray-200"
                    } , ${isQuotation ?"bg-white rounded-bl-md border border-black/10" : "bg-blue-500 rounded-br-md"}`}
                  >
                    {isQuotation ? (
                      <View className=" w-60 flex gap-4 justify-center">
                        <Text className={`text-sm font-semibold ${isCurrentUser ? "text-gray-800" : "text-gray-800"}`}>
                          ใบเสนอราคา
                        </Text>
                        <Text className={`text-sm font-semibold ${isCurrentUser ? "text-gray-500" : "text-gray-500"}`}>
                          {item.quotation.productName}
                        </Text>
                        <View className="w-full flex flex-row justify-between py-4 border-t border-b border-black/10">
                            <Text className="text-black/70 text-sm font-semibold">ราคารวมสุทธิ</Text>
                            <Text className="text-black/70 text-sm font-semibold">฿ {item.quotation.price}</Text>
                        </View>
                        <View className="w-full flex flex-row justify-between">
                            <TouchableOpacity><Text className="font-semibold text-blue-500 border-">ดูฉบับเต็ม</Text></TouchableOpacity>
                            <TouchableOpacity><Text className="font-semibold text-blue-500">ดาวโหลด</Text></TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <Text className={`text-base leading-5 ${isCurrentUser ? "text-white" : "text-gray-800"}`}>
                        {item.text}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
                <Text className={`text-xs text-gray-400 mt-1 ${isCurrentUser ? "text-right" : "text-left"}`}>
                  {formatTime(item.timestamp)}
                </Text>
              </View>
            );
          }}
        />

        {/* Quotation Modal */}
       {/* ----------------------------------------------------------------------------------- */}

        {/* Image Modal */}
        <Modal visible={imageModalVisible} transparent animationType="fade">
          <View className="flex-1 bg-black/90 justify-center items-center">
            <TouchableOpacity className="absolute top-10 right-5" onPress={() => setImageModalVisible(false)}>
              <Text className="text-white text-2xl">✕</Text>
            </TouchableOpacity>
            {selectedImage && <Image source={{ uri: selectedImage }} className="w-full h-3/4" resizeMode="contain" />}
          </View>
        </Modal>

        {/* Input Bar */}
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}>
          <View className="bg-white border-t border-gray-200 px-4 py-3">
            <View className="flex-row items-end space-x-2 gap-3">
              <TouchableOpacity className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mb-1">
                <Text className="text-gray-600 text-lg">📎</Text>
              </TouchableOpacity>
              <View className="flex-1 bg-gray-100 rounded-3xl px-4 max-h-24">
                <TextInput
                  className="text-base text-gray-800 leading-5 py-3"
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
                <Text className="text-white text-lg">{inputText.trim() ? "➤" : "👍"}</Text>
              </TouchableOpacity>
            </View>

            {/* ส่งใบเสนอราคา */}
            {currentUserRole === "seller" && (
              <>
                <TouchableOpacity className="bg-green-500 px-4 py-2 rounded-full items-center justify-center mt-2" onPress={() => setModalVisible(true)}>
                  <Text className="text-white font-semibold">ส่งใบเสนอราคา</Text>
                </TouchableOpacity>

                {/* Quotation Creation Modal */}
                <Modal visible={modalVisible} animationType="slide" transparent>
                  <View className="flex-1 justify-center items-center bg-black/50">
                    <ScrollView className="bg-white w-11/12 p-4 rounded-lg max-h-[80%]">
                      <Text className="text-lg font-semibold mb-2">สร้างใบเสนอราคา</Text>

                      {/* เลือกผู้ซื้อ */}
                      <View className="mb-2">
                        <Text className="mb-1 font-semibold">ผู้ซื้อ</Text>
                        <ScrollView horizontal className="flex-row space-x-2">
                          {Object.entries(ChatData.rooms.abc123.users)
                            .filter(([id]) => id !== currentUserId)
                            .map(([id, user]) => (
                              <TouchableOpacity
                                key={id}
                                className={`px-3 py-1 rounded-full border ${selectedBuyerId === id ? "border-blue-500 bg-blue-100" : "border-gray-300"}`}
                                onPress={() => setSelectedBuyerId(id)}
                              >
                                <Text>{user.name}</Text>
                              </TouchableOpacity>
                            ))}
                        </ScrollView>
                      </View>

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
                      <TextInput
                        className="border p-2 mb-2 rounded"
                        placeholder="หมายเหตุ"
                        value={quotationData.notes}
                        onChangeText={(text) => setQuotationData({ ...quotationData, notes: text })}
                      />

                      <View className="flex-row justify-end mt-2">
                        <TouchableOpacity className="bg-gray-300 px-4 py-2 rounded mr-2" onPress={() => setModalVisible(false)}>
                          <Text>ยกเลิก</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="bg-green-500 px-4 py-2 rounded"
                          onPress={() => {
                            const newQuotation = {
                              id: Date.now().toString(),
                              sender_id: currentUserId,
                              type: "quotation",
                              quotation: {
                                ...quotationData,
                                seller: {
                                  name: ChatData.rooms.abc123.users[currentUserId].name,
                                  role: "Seller",
                                },
                                buyer: selectedBuyerId
                                  ? {
                                      name: ChatData.rooms.abc123.users[selectedBuyerId].name,
                                      role: "Buyer",
                                    }
                                  : { name: "ไม่ระบุ", role: "Buyer" },
                              },
                              timestamp: Math.floor(Date.now() / 1000),
                            };
                            setMessages([...messages, newQuotation]);
                            setModalVisible(false);
                            setQuotationData({
                              productName: "",
                              details: "",
                              images: "",
                              price: "",
                              notes: "",
                            });
                            setSelectedBuyerId(null);
                          }}
                        >
                          <Text className="text-white">ส่งใบเสนอราคา</Text>
                        </TouchableOpacity>
                      </View>
                    </ScrollView>
                  </View>
                </Modal>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
