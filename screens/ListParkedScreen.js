import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { View, Text, Card, Colors, Picker } from "react-native-ui-lib";
import * as Location from "expo-location";
import { GOOGLE_MAPS_API_KEY } from "../secrets";
import { AuthContext } from "../context";
import {
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  XCircleIcon,
} from "react-native-heroicons/solid";
import { radiusOptions } from "../contanst";
import Popover from "react-native-popover-view";
import { Placement } from "react-native-popover-view/dist/Types";
import { PhoneIcon } from "react-native-heroicons/outline";
import { get, query } from "firebase/database";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import moment from "moment";
import { useIsFocused } from "@react-navigation/core";
import Loading from "./Loading";

const ListParkedScreen = ({ navigation }) => {
  const [parkings, setParkings] = useState([]);
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputSearchRef = useRef(null);
  const { currentUser } = useContext(AuthContext);
  const isFocused = useIsFocused();

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        setParkings([]);
        const q = query(
          collection(db, "parkings"),
          where("user_id", "==", currentUser.id),
          orderBy("timeStart", "desc")
        );

        const querySnapshot = await getDocs(q);
        const data = [];

        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          data.push({
            id: doc.id,
            parking_id: doc.id,
            ...doc.data(),
          });
        });
        setParkings(data);
        setLoading(false);
      } catch (error) {
        console.log(error);
        console.log("====================================");
        Alert.alert("Lỗi", "Không thể lấy dữ liệu từ server");
        setLoading(false);
      }
    };

    if (isFocused && currentUser) {
      initData();
    }

    if (!isFocused) {
      setParkings([]);
    }
  }, [isFocused, reload]);

  const renderStatus = (status) => {
    if (status === "moving") {
      return (
        <View
          paddingV-5
          paddingH-15
          borderRadius={12}
          style={{ backgroundColor: Colors.$backgroundWarningLight }}
        >
          <Text
            text70R
            style={{
              color: Colors.$outlineWarning,
              backgroundColor: Colors.$backgroundWarningLight,
            }}
          >
            Đang di chuyển
          </Text>
        </View>
      );
    }
    if (status === "parking") {
      return (
        <View
          paddingV-5
          paddingH-15
          borderRadius={12}
          style={{ backgroundColor: Colors.primary + 20 }}
        >
          <Text text70R style={{ color: Colors.primary }}>
            Đang đỗ xe
          </Text>
        </View>
      );
    }
    if (status === "parked") {
      return (
        <View
          paddingV-5
          paddingH-15
          borderRadius={12}
          style={{ backgroundColor: Colors.$backgroundSuccessLight }}
        >
          <Text
            text70R
            style={{
              color: Colors.$iconSuccess,
            }}
          >
            Đã đỗ xe
          </Text>
        </View>
      );
    }

    if (status === "cancel") {
      return (
        <View
          paddingV-5
          paddingH-15
          borderRadius={12}
          style={{ backgroundColor: Colors.$backgroundDangerLight }}
        >
          <Text
            text70R
            style={{
              color: Colors.$iconDanger,
            }}
          >
            Đã hủy
          </Text>
        </View>
      );
    }

    return (
      <View paddingV-5 paddingH-15 borderRadius={12}>
        <Text text70R style={{ color: Colors.$iconDisabled }}>
          {status}
        </Text>
      </View>
    );
  };

  const handleCancel = (parking_id, place_id) => {
    const docRef = doc(db, "parkings", parking_id);

    Alert.alert(
      "Hủy đỗ xe",
      "Bạn có chắc chắn muốn hủy đỗ xe tại đây?",
      [
        {
          text: "Hủy",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Đồng ý",
          onPress: async () => {
            try {
              setLoading(true);
              await updateDoc(docRef, {
                updatedAt: new Date().getTime(),
                status: "cancel",
              });
              const docPlaceRef = doc(db, "places", place_id);

              await getDoc(docPlaceRef).then((docSnap) => {
                if (docSnap.exists()) {
                  updateDoc(docPlaceRef, {
                    occupied: increment(-1),
                  });
                } else {
                  console.log("No such document!");
                }
              });
              setReload(!reload);
              setLoading(false);
            } catch (error) {
              console.log("====================================");
              console.log(error);
              console.log("====================================");
              Alert.alert("Lỗi", "Không thể hủy đỗ xe");
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleFinish = async (parking_id, place_id) => {
    const docRef = doc(db, "parkings", parking_id);

    try {
      setLoading(true);
      await updateDoc(docRef, {
        updatedAt: new Date().getTime(),
        timeFinish: new Date().getTime(),
        status: "parked",
      });
      const docPlaceRef = doc(db, "places", place_id);

      await getDoc(docPlaceRef).then((docSnap) => {
        if (docSnap.exists()) {
          updateDoc(docPlaceRef, {
            occupied: increment(-1),
          });
        } else {
          console.log("No such document!");
        }
      });

      setReload(!reload);
      setLoading(false);
    } catch (error) {
      console.log("====================================");
      console.log(error);
      console.log("====================================");
      Alert.alert("Lỗi", "Không thể hủy đỗ xe");
      setLoading(false);
    }
  };

  const renderButtons = (status, parking_id, parking) => {
    const commonStyles = {
      padding: 5,
      borderRadius: 999,
      marginLeft: 5,
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    };

    if (status === "moving") {
      return (
        <View row gap-10>
          <TouchableOpacity
            style={{
              backgroundColor: Colors.$backgroundSuccessLight,
              ...commonStyles,
            }}
            onPress={() => {
              navigation.navigate("MapScreen", {
                selectedMove: parking,
              });
            }}
          >
            <PaperAirplaneIcon
              width={30}
              height={30}
              color={Colors.$iconSuccess}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: Colors.$backgroundDangerLight,
              ...commonStyles,
            }}
            onPress={() => handleCancel(parking_id, parking?.place_id)}
          >
            <XCircleIcon width={30} height={30} color={Colors.$iconDanger} />
          </TouchableOpacity>
        </View>
      );
    }
    if (status === "parking") {
      return (
        <View row gap-10>
          <TouchableOpacity
            style={{
              backgroundColor: Colors.$backgroundDangerLight,
              ...commonStyles,
            }}
            onPress={() => handleCancel(parking_id, parking?.place_id)}
          >
            <XCircleIcon width={30} height={30} color={Colors.$iconDanger} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: Colors.$backgroundDangerLight,
              ...commonStyles,
            }}
            onPress={() => handleFinish(parking_id, parking?.place_id)}
          >
            <CheckCircleIcon
              width={30}
              height={30}
              color={Colors.$iconSuccess}
            />
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 10 }}>
      {loading && (
        <View center flex>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
      <ScrollView>
        {parkings.map((parking, idx) => (
          <Card
            key={parking.id || idx}
            borderRadius={12}
            marginB-16
            padding-16
            style={styles.card}
          >
            <View style={{ flex: 1 }}>
              <Text
                text70R
                style={[styles.notificationTitle, { width: "80%" }]}
              >
                {parking.name}
              </Text>
              <Text text90R style={styles.notificationMessage}>
                {parking.vicinity}
              </Text>
              <View
                paddingV-5
                borderWidth-1
                borderColor={Colors.$iconDisabled}
                gap-5
              >
                <View row>
                  <Text text80R style={{ width: 70 }}>
                    Di chuyển:
                  </Text>
                  <Text text80R>
                    {moment(parking?.timeStart).format("HH:mm DD/MM/YYYY")}
                  </Text>
                </View>
                <View row>
                  <Text text80R style={{ width: 70 }}>
                    Đỗ xe:
                  </Text>
                  <Text text80R>
                    {parking?.timeEnd
                      ? moment(parking?.timeEnd).format("HH:mm DD/MM/YYYY")
                      : "Trống"}
                  </Text>
                </View>
                {parking?.timeFinish ? (
                  <View row>
                    <Text text80R style={{ width: 70 }}>
                      Lấy xe:
                    </Text>
                    <Text text80R>
                      {moment(parking?.timeFinish).format("HH:mm DD/MM/YYYY")}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
            {/* <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: Colors.$textDisabled,
                borderRadius: 999,
                width: 50,
                height: 50,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => {
                navigation.navigate("MapScreen", {
                  selectedMove: parking,
                });
              }}
            >
              <PaperAirplaneIcon color={Colors.primary} />
            </TouchableOpacity> */}
            <View
              style={{
                position: "absolute",
                top: 5,
                right: 5,
                padding: 5,
              }}
            >
              {renderStatus(parking?.status)}
            </View>
            <View
              style={{
                position: "absolute",
                bottom: 5,
                right: 5,
                padding: 5,
              }}
            >
              {renderButtons(parking?.status, parking?.id, parking)}
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
  card: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notificationTitle: {
    marginBottom: 8,
  },
  notificationMessage: {
    marginBottom: 4,
  },
};

export default ListParkedScreen;
