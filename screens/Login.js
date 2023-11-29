import { Button, Colors, Text, View } from "react-native-ui-lib";
import {
  StyleSheet,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  AppRegistry,
  Alert,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import Loading from "./Loading";
import { AuthContext } from "../context";

export function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser) {
      navigation.navigate("MapScreen");
    }
  }, [currentUser]);
  const handleRegister = () => {
    navigation.navigate("RegisterScreen");
  };

  const handleLogin = (user) => {
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log(user);
        navigation.navigate("HomeScreen");
        // ...
        setLoading(false);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorMessage);
        setErrorMessage(errorMessage);
        setLoading(false);
        // ..
      });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          paddingHorizontal: 20,
        }}
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
          Đăng nhập
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
        <Button label="Đăng nhập" marginT-20 backgroundColor={Colors.primary}  onPress={handleLogin} />

        <Button
          label="Đăng ký"
          marginT-30
          link
          color={Colors.black}
          onPress={handleRegister}
        />
      </View>
      <Loading isVisible={loading} text="Loading..." />
    </SafeAreaView>
  );
}
