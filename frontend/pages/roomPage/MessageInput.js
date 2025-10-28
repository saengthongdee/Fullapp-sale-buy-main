import { Text, View, TextInput, TouchableOpacity } from "react-native";

export default function MessageInput({
  inputText,
  onTextChange,
  onSend,
  onFocus,
  currentUserRole,
  hasSentQuotation,
  onOpenQuotationModal,
}) {
  return (
    <View className="bg-white border-t border-gray-200 px-4 py-3">
      <View className="flex-row items-end space-x-2 gap-3">
        {currentUserRole === "seller" && !hasSentQuotation && (
          <TouchableOpacity 
            className="px-3 py-2 rounded-full bg-green-500" 
            onPress={onOpenQuotationModal}
          >
            <Text className="text-white py-1 font-semibold">ส่งใบเสนอราคา</Text>
          </TouchableOpacity>
        )}
        <View className="flex-1 bg-gray-100 rounded-3xl px-4 max-h-24">
          <TextInput
            className="text-base text-gray-800 py-3"
            placeholder="พิมพ์ข้อความ..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={onTextChange}
            multiline
            textAlignVertical="center"
            onFocus={onFocus}
            returnKeyType="send"
            onSubmitEditing={onSend}
            blurOnSubmit={false}
          />
        </View>
        <TouchableOpacity 
          className="w-10 h-10 rounded-full items-center justify-center mb-1 bg-blue-500" 
          onPress={onSend}
        >
          <Text className="text-white text-lg">➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}