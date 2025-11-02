// register/Register.jsx

import { useState, useEffect } from "react";
import * as React from "react";
import { Text, View, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FormInput from "./components/FormInput";
import PasswordInput from "./components/PasswordInput";
import PasswordRequirements from "./components/PasswordRequirements";
import CheckboxAgreement from "./components/CheckboxAgreement";
import AntDesign from "@expo/vector-icons/AntDesign";

import {
  validateFullname,
  validatePhone,
  validateEmail,
  validatePassword,
} from "./utils/validation";

import { MESSAGES, PLACEHOLDERS, LABELS } from "./contants";

export default function Register({ navigation }) {

  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [check_fullname, setCheck_fullname] = useState(false);
  const [check_phone, setCheck_phone] = useState(false);
  const [check_email, setCheck_email] = useState(false);
  const [check_password, setCheck_password] = useState(false);
  const [checked, setChecked] = useState(false);
  const [checkfulldata , setCheckfulldata] = useState(false);

  const handleCreate = () => {

    if (!fullname.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      setCheckfulldata(false);
      return;
    }else{
       setCheckfulldata(true); 
    }

    if (!check_fullname || !check_phone || !check_email || !check_password || !checked) {
      return;
    }

    navigation.navigate("ConfirmEmail", { email });
    
  };

  useEffect(() => {
    setCheck_fullname(validateFullname(fullname));
  }, [fullname]);

  useEffect(() => {
    setCheck_phone(validatePhone(phone));
  }, [phone]);

  useEffect(() => {
    setCheck_email(validateEmail(email));
  }, [email]);

  useEffect(() => {
    setCheck_password(validatePassword(password));
  }, [password]);

  useEffect(() => {
    if (!fullname.trim() || !phone.trim() || !email.trim() || !password.trim() ||phone.length !== 10) {
        setCheckfulldata(false);
        return;
    }else{
        setCheckfulldata(true); 
    }
  },[fullname , phone , email , password]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-1 bg-[#f5f5f5] p-4">
        {/* Header */}
        <View className="border-b border-black/10 w-full h-[7%] flex flex-row justify-between items-center ">
            <Pressable onPress={() => navigation.goBack()}>
                <AntDesign name="left" size={30} color="gray" />
            </Pressable>
            <Text className="text-xl font-bold text-[#125c91] pr-3 ">สร้างบัญชีผู้ใช้</Text>
            <Text></Text>
        </View>

        <View className="w-full mt-6 h-auto px-2 gap-5">
          {/* Title */}
          <View className="w-full h-auto flex gap-1">
            <Text className="text-sm text-black/70 font-bold">ขั้นตอนที่ 1 จาก 2</Text>
            <Text className="font-bold text-[18px] text-black/70">
              สร้างบัญชีเพื่อเริ่มต้นการเป็นสมาชิคของคุณ
            </Text>
            <Text className="font-bold text-sm text-black/70">
              เหลืออีกเพียงไม่กี่ขั้นตอนของคุณก็เสร็จสิ้นแล้ว
            </Text>
          </View>

          <View className="py-4 px-4 gap-3 mt-8 border border-black/10 rounded-xl">
            {/* Fullname */}
            <FormInput
              label={LABELS.fullname}
              value={fullname}
              onChangeText={setFullname}
              placeholder={PLACEHOLDERS.fullname}
              validated={check_fullname}
            />

            {/* Email */}
            <FormInput
              label={LABELS.email}
              value={email}
              onChangeText={setEmail}
              placeholder={PLACEHOLDERS.email}
              validated={check_email}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Password */}
            <PasswordInput
              label={LABELS.password}
              value={password}
              onChangeText={setPassword}
              placeholder={PLACEHOLDERS.password}
            />

            {/* Password Requirements */}
            <PasswordRequirements password={password} />

            {/* Phone */}
            <FormInput
              label={LABELS.phone}
              value={phone}
              onChangeText={setPhone}
              placeholder={PLACEHOLDERS.phone}
              validated={check_phone}
              keyboardType="number-pad"
              maxLength={10}
            />

            {/* Checkbox */}
            <CheckboxAgreement
              checked={checked}
              onPress={() => setChecked(!checked)}
            />

            {/* Submit */}
            <Pressable
              onPress={handleCreate}
              className={`mt-10 rounded-md ${
                !checkfulldata ? "bg-gray-400" : "bg-[#125c91]"
              } w-full h-16 flex justify-center items-center`}
            >
              <Text className="text-xl text-white font-semibold">ถัดไป</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}