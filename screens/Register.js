import { Button, Checkbox, Colors, Text, View } from "react-native-ui-lib";
import {
  StyleSheet,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  AppRegistry,
  Alert,
  TextInput,
  Image,
  TouchableOpacity,
  DeviceEventEmitter,
} from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import Loading from "./Loading";
import { MapPinIcon, XCircleIcon } from "react-native-heroicons/solid";
import ListParkOwnerModal from "../components/ListParkOwnerModal";
import { useIsFocused } from "@react-navigation/core";

export function RegisterScreen({ route, navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);
  const [parking, setParking] = useState({});
  const isFocused = useIsFocused();
  const userParam = route.params?.user;
  const placeParam = route.params?.place;

  useEffect(() => {
    if (isFocused) {
      if (userParam) {
        setEmail(userParam.email);
        setPassword(userParam.password);
        setPasswordConfirm(userParam.passwordConfirm);
        setIsOwner(userParam.isOwner);
      }

      if (placeParam) {
        if(!placeParam?.place_id) {
          placeParam.place_id = new Date().getTime() + ""
        }

        setParking(placeParam);
      }
    }
  }, [isFocused, userParam, placeParam]);

  const handleClose = () => {
    setVisibleModal(false);
  };

  const handleSelected = (data) => {
    setParking(data);
    setVisibleModal(false);
  };

  const handleRegister = () => {
    if (email === "") {
      setErrorMessage("Vui lòng nhập email");
      return;
    }

    if (password === "" || password.length < 6) {
      setErrorMessage("Vui lòng nhập mật khẩu và lớn hơn 5 kí tự");
      return;
    }

    if (password !== passwordConfirm) {
      setErrorMessage("Vui lòng nhập đúng mật khẩu");
      return;
    }

    if (isOwner && !parking?.name) {
      setErrorMessage("Vui lòng chọn bãi đỗ xe của bạn");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setLoading(false);
        // Signed in
        const user = userCredential.user;
        const place = {
          place_id: parking?.place_id,
          place_name: parking?.name,
          place_vicinity: parking?.vicinity,
        };

        console.log("parking", parking);
        setDoc(doc(db, "users", user.uid), {
          email: user.email,
          id: user.uid,
          role: isOwner ? "owner" : "user",
          status: isOwner ? "deactive" : "active",
          createdAt: new Date().getTime(),
          ...(isOwner ? place : {}),
        }).then((response) => {
          if (isOwner === false) {
            navigation.navigate("HomeScreen");
            setLoading(false);
          } else {
            setDoc(doc(db, "places", parking?.place_id), {
              user_id: user.uid,
              place_id: parking?.place_id,
              ...parking,
              createdAt: new Date().getTime(),
            }).then(() => {
              Alert.alert(
                "Thông báo",
                "Đăng ký thành công.\nVui lòng chờ quản trị viên phê duyệt!"
              );
              auth.signOut();
              setLoading(false);
            });
          }
        });
      })
      .catch((error) => {
        setLoading(false);
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

  const handleAddNew = () => {
    setVisibleModal(false);
    navigation.navigate("SelectMap", {
      user: {
        email,
        password,
        passwordConfirm,
        isOwner,
      },
    });
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
        {errorMessage && (
          <Text marginB-10 color={Colors.$textDanger}>
            {errorMessage}
          </Text>
        )}
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
          passwordRules="minlength: 6; maxlength: 10;"
          textContentType="password"
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
          passwordRules="minlength: 6; maxlength: 10;"
          textContentType="password"
        />
        <View
          row
          centerV
          style={{ justifyContent: "flex-end" }}
          marginB-10
          marginT-10
        >
          <Text text70BO marginR-10>
            Chủ bãi xe
          </Text>
          <Checkbox
            center
            color={Colors.primary}
            value={isOwner}
            onValueChange={() => setIsOwner(!isOwner)}
          />
        </View>
        {isOwner ? (
          <View row centerV spread marginT-10>
            <TextInput
              placeholder="Tên bãi xe"
              value={parking?.name}
              autoCapitalize="none"
              style={{
                borderColor: Colors.$textDisabled,
                borderWidth: 1,
                paddingHorizontal: 20,
                height: 50,
                borderRadius: 12,
                flex: 1,
              }}
              editable={false}
              selectTextOnFocus={false}
            />
            <TouchableOpacity
              onPress={() => setParking({})}
              style={{
                backgroundColor: Colors.primary,
                height: 50,
                width: 50,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 12,
                marginLeft: 10,
              }}
            >
              <XCircleIcon color={Colors.$backgroundDark} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setVisibleModal(true)}
              style={{
                backgroundColor: Colors.primary,
                height: 50,
                width: 50,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 12,
                marginLeft: 10,
              }}
            >
              <MapPinIcon color={Colors.$iconDanger} />
            </TouchableOpacity>
          </View>
        ) : null}
        <Button
          label="Đăng ký"
          marginT-20
          backgroundColor={Colors.primary}
          onPress={handleRegister}
        />

        <Button
          label="Đăng nhập"
          marginT-30
          link
          color={Colors.black}
          onPress={handleLogin}
        />
      </View>
      <Loading isVisible={loading} text="Loading..." />
      <ListParkOwnerModal
        visible={visibleModal}
        onDismiss={handleClose}
        onSelected={handleSelected}
        onAddNew={handleAddNew}
      />
    </SafeAreaView>
  );
}
