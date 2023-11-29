import { Button, Colors, Text, View } from "react-native-ui-lib";
import {
  StyleSheet,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  AppRegistry,
  Alert,
  TextInput,
  Image,
} from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";
import { auth } from "../firebase";

export function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const handleRegister = () => {
    if (password !== passwordConfirm) {
      setErrorMessage("Passwords do not match");
      return;
    }

    console.log(auth, email, password);
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        navigation.navigate("MapScreen");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorMessage);
        setErrorMessage(errorMessage);
        // ..
      });
  };

  const handleLogin = (user) => {
    navigation.navigate("LoginScreen");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{ flex: 1, justifyContent: "center", paddingHorizontal: 20 }}
      >
        <View center>
          <Image
            source={require("../assets/logo.png")}
            style={{
              width: 150,
              height: 150,
            }}
          />
        </View>
        <Text text50 center marginB-20>
          Đăng ký
        </Text>
        {errorMessage && <Text color={Colors.$textDanger}>{errorMessage}</Text>}
        <TextInput
          placeholder="Email"
          onChangeText={setEmail}
          value={email}
          autoCapitalize="none"
          style={{
            borderColor: Colors.$textDisabled,
            borderWidth: 1,
            paddingHorizontal: 20,
            height: 50,
            borderRadius: 12,
          }}
        />
        <TextInput
          placeholder="Mật khẩu"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
          autoCapitalize="none"
          style={{
            borderColor: Colors.$textDisabled,
            borderWidth: 1,
            paddingHorizontal: 20,
            height: 50,
            borderRadius: 12,
            marginTop: 12,
          }}
        />
        <TextInput
          placeholder="Xác nhận"
          secureTextEntry
          onChangeText={setPasswordConfirm}
          value={passwordConfirm}
          autoCapitalize="none"
          style={{
            borderColor: Colors.$textDisabled,
            borderWidth: 1,
            paddingHorizontal: 20,
            height: 50,
            borderRadius: 12,
            marginTop: 12,
          }}
        />
        <Button label="Đăng ký" marginT-20 backgroundColor={Colors.primary} onPress={handleRegister} />

        <Button
          label="Đăng nhập"
          marginT-30
          link
          color={Colors.black}
          onPress={handleLogin}
        />
      </View>
    </SafeAreaView>
  );
}
