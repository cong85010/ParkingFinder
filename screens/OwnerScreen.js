import React, { useContext, useEffect, useState } from "react";
import { Alert, ScrollView, TextInput } from "react-native";
import { Picker, Button, View, Card, Text, Colors } from "react-native-ui-lib";
import { AuthContext } from "../context";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const OwnerScreen = () => {
  const [place, setPlace] = useState({});
  const [total, setTotal] = useState("");
  const [occupied, setOccupied] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser?.role === "owner") {
      getDoc(doc(db, "places", currentUser?.place_id)).then((doc) => {
        if (doc.exists()) {
          const place = doc.data();
          console.log("place", place);
          setPlace(place);
          setTotal(String(place.total));
          setOccupied(String(place.occupied));
          setContact(place.formatted_phone_number);
        } else {
          alert("Địa chỉ không tồn tại");
        }
        setLoading(false);
      });
    }
  }, [currentUser]);

  const updateParkingInfo = async () => {
    try {
      if(+occupied > +total) {
        Alert.alert("Bãi xe quá tải", "Bãi xe quá số lượng đỗ xe")
        return ;
      }
      setLoading(true);
      const docRef = doc(db, "places", currentUser?.place_id);

      await updateDoc(docRef, {
        total: +total,
        occupied: +occupied,
        formatted_phone_number: contact || "",
      });

      Alert.alert("Thông báo", "Cập nhật bãi xe thành công");
      setLoading(false);
    } catch (error) {
      Alert.alert("Lỗi", "Hệ thống quá tải, thử lại sau!!!");
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text text60BO>Bãi xe: {place?.name}</Text>
      <View marginT-20>
        <Text text70BO marginB-10>
          Địa chỉ
        </Text>
        <TextInput
          editable={false}
          placeholder="Địa chỉ"
          value={place?.vicinity}
          containerStyle={{ marginVertical: 10 }}
          style={{
            borderColor: Colors.$textDisabled,
            borderWidth: 1,
            paddingHorizontal: 20,
            height: 50,
            borderRadius: 12,
          }}
        />
      </View>
      <View>
        <View row spread>
          <View marginT-20>
            <Text text70BO marginB-10>
              Số lượng đỗ xe
            </Text>
            <TextInput
              testID="totalInput"
              placeholder="Số lượng"
              value={total}
              onChangeText={setTotal}
              keyboardType="number-pad"
              containerStyle={{ marginVertical: 10 }}
              style={{
                width: 150,
                borderColor: Colors.$textDisabled,
                borderWidth: 1,
                paddingHorizontal: 20,
                height: 50,
                borderRadius: 12,
              }}
            />
          </View>
          <View marginT-20>
            <Text text70BO marginB-10>
              Đã đỗ xe
            </Text>
            <TextInput
              testID="occupiedInput"
              placeholder="Đã đỗ xe"
              value={occupied}
              onChangeText={setOccupied}
              keyboardType="number-pad"
              containerStyle={{ marginVertical: 10 }}
              style={{
                width: 150,
                borderColor: Colors.$textDisabled,
                borderWidth: 1,
                paddingHorizontal: 20,
                height: 50,
                borderRadius: 12,
              }}
            />
          </View>
        </View>
        <View marginT-20>
          <Text text70BO marginB-10>
            Liên hệ
          </Text>
          <TextInput
            testID="contactInput"
            placeholder="Số điện thoại"
            value={contact}
            onChangeText={setContact}
            keyboardType="phone-pad"
            containerStyle={{ marginVertical: 10 }}
            style={{
              borderColor: Colors.$textDisabled,
              borderWidth: 1,
              paddingHorizontal: 20,
              height: 50,
              borderRadius: 12,
            }}
          />
        </View>
        <Button
          marginT-20
          backgroundColor={Colors.primary}
          label="Cập nhật"
          onPress={updateParkingInfo}
        />
      </View>
    </ScrollView>
  );
};

export default OwnerScreen;
