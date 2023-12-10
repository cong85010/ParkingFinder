import * as ImagePicker from "expo-image-picker";
import { doc, setDoc } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { Image, TextInput } from "react-native";
import { AuthContext } from "../context";
import { db } from "../firebase";

import {
  Button,
  Colors,
  Text,
  TouchableOpacity,
  View,
} from "react-native-ui-lib";
import { getImageBase64 } from "../contanst";
import Loading from "./Loading";

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    displayName: "",
    email: "",
    phone: "",
    photoURL: "",
  });
  const { currentUser, fetchUser } = useContext(AuthContext);
  const [avatarSource, setAvatarSource] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, text) => {
    setUser({ ...user, [field]: text });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await setDoc(doc(db, "users", currentUser.id), {
        displayName: user?.displayName,
        email: user?.email,
        phone: user?.phone,
        photoURL: avatarSource?.base64 || user?.photoURL,
      });
      setLoading(false);
      alert("Cập nhật thành công");
      fetchUser(currentUser?.id);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const { displayName, email, phone } = user;

  const handleImageUpload = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatarSource(result.assets[0]);
    }
  };

  
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      setAvatarSource({ base64: currentUser?.photoURL });
    }
  }, [currentUser]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 20,
        backgroundColor: "#fff",
      }}
    >
      <TouchableOpacity onPress={handleImageUpload} style={{ marginTop: 50 }}>
        {avatarSource ? (
          <Image
            source={{ uri: getImageBase64(avatarSource) }}
            style={{ width: 200, height: 200, borderRadius: 999 }}
          />
        ) : (
          <Image
            source={require("../assets/user-default.png")}
            style={{ width: 200, height: 200, borderRadius: 999 }}
          />
        )}
      </TouchableOpacity>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>{displayName}</Text>

      <TextInput
        style={{
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderWidth: 1,
          borderColor: "#ccc",
          width: "100%",
          borderRadius: 12,
          marginTop: 20,
        }}
        placeholder="Display Name"
        value={displayName}
        onChangeText={(text) => handleInputChange("displayName", text)}
      />
      <TextInput
        style={{
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderWidth: 1,
          borderColor: "#ccc",
          width: "100%",
          borderRadius: 12,
          marginTop: 20,
        }}
        placeholder="Email"
        value={email}
        editable={false}
      />
      <TextInput
        style={{
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderWidth: 1,
          borderColor: "#ccc",
          width: "100%",
          borderRadius: 12,
          marginTop: 20,
        }}
        keyboardType="phone-pad"
        placeholder="Phone Number"
        inputMode="tel"
        value={phone}
        maxLength={10}
        onChangeText={(text) => handleInputChange("phone", text)}
      />

      <Button
        label="Save"
        backgroundColor={Colors.primary}
        marginT-20
        style={{ width: "100%" }}
        onPress={handleSave}
      />
      <Loading isVisible={loading} text="Đang cập nhật" />
    </View>
  );
};

export default ProfileScreen;
