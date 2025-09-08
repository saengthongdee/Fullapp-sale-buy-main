import { useEffect, useRef, useState } from "react";
import { Text, View, Image, TextInput, TouchableOpacity, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from '@expo/vector-icons/AntDesign';

export default function Login({ navigation }) {
  const [clicklogin, setclicklogin] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text) {
      if (index < 5) {
        inputs.current[index + 1].focus();
      } else {
        // ถ้าพิมพ์ครบ 6 ตัว ปิด keyboard
        Keyboard.dismiss();
      }
    } else {
      // ถ้ากดลบ ช่องก่อนหน้า
      if (index > 0) {
        inputs.current[index - 1].focus();
      }
    }
  };

  const handlesubmit = () => {
    setclicklogin(true);
  };

  const handleblack = () => {
    setEmail("");
    setPassword("");
    setclicklogin(false);
  };

  const handleOTP = () => {
    const otpValue = otp.join("");
    if (otpValue === "123456") {
      navigation.navigate("Home");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-1 bg-white px-4 py-4">
        <View className="w-full h-[30%] flex justify-center items-center">
          <View className="w-[70%] h-[80%]">
            <Image
              source={require("../assets/logosafepro.webp")}
              className="w-full h-full"
            />
          </View>
        </View>

        {!clicklogin ? (
          <>
            <Text className="text-center text-[23px] py-4 font-medium text-[#07439B]">
              Sign in
            </Text>
            <View className="border border-black/20 rounded-md px-4 py-6 flex flex-col gap-6">
              <TextInput
                value={email}
                onChangeText={setEmail}
                className="border border-black/20 rounded-md px-4 py-4 text-lg"
                placeholder="Email"
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                className="border border-black/20 rounded-md px-4 py-4 text-lg"
                placeholder="Password"
                secureTextEntry={true}
              />
              {error ? (
                <Text className="text-red-500 text-center">{error}</Text>
              ) : null}
              <TouchableOpacity onPress={handlesubmit} className="bg-[#07439B] p-4 rounded-md flex justify-center items-center">
                <Text className="text-white text-lg font-medium">Sign in</Text>
              </TouchableOpacity>
              <Text className="font-medium text-center text-black/50">
                Already have an account?{" "}
                <Text className="text-[#07439B]">Sign up</Text>
              </Text>
            </View>
          </>
        ) : (
          <>
            <View className="flex justify-center items-center py-4">
              <Text className="text-center text-[26px] font-medium text-black/60">
                Verification
              </Text>
              <Text className="text-black/40 text-lg">
                Enter your OTP code
              </Text>
            </View>
            <View className="flex-col items-center w-full h-1/2 px-2 py-6 relative">
              <View className="w-full flex py-4 flex-row justify-between">
                {otp.map((value, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputs.current[index] = ref)}
                    value={value}
                    onChangeText={(text) => handleChange(text, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    className="border border-gray-300 rounded-md w-14 h-14 text-center text-2xl font-bold text-black/60"
                  />
                ))}
              </View>

              <Text className="text-center p-2 text-lg text-black/70">
                Didn't receive code? <Text className="text-[#07439B] underline">Resend again</Text>
              </Text>

              <TouchableOpacity onPress={handleOTP} className="w-full bg-[#07439B] h-16 flex justify-center items-center rounded-md absolute bottom-0">
                <Text className="text-white text-lg font-medium">Verify</Text>
              </TouchableOpacity>
            </View>

            <AntDesign
              onPress={handleblack}
              className="absolute top-10 left-6"
              name="left"
              size={36}
              color="black"
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
