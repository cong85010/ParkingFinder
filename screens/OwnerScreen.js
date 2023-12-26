import React, { useContext, useEffect, useState } from "react";
import { Alert, ScrollView, TextInput, TouchableOpacity } from "react-native";
import {
  Picker,
  Button,
  View,
  Card,
  Text,
  Colors,
  Checkbox,
} from "react-native-ui-lib";
import { AuthContext } from "../context";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import ScheduleComponent from "../components/Schedule";
import { ClockIcon } from "react-native-heroicons/solid";

const hours = [
  { day: "Thứ 2", open: "8:00", close: "23:00" },
  { day: "Thứ 3", open: "8:00", close: "23:00" },
  { day: "Thứ 4", open: "8:00", close: "23:00" },
  { day: "Thứ 5", open: "8:00", close: "23:00" },
  { day: "Thứ 6", open: "8:00", close: "24:00" },
  { day: "Thứ 7", open: "8:00", close: "24:00" },
  { day: "Chủ Nhật", open: "8:00", close: "24:00" },
];

const OwnerScreen = () => {
  const [place, setPlace] = useState({});
  const [total, setTotal] = useState("");
  const [businessStatus, setBusinessStatus] = useState(false);
  const [occupied, setOccupied] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const [schedule, setSchedule] = useState(hours);

  const handleClose = () => {
    setVisibleModal(false);
  };

  const onSelected = (data) => {
    setSchedule(data);
  };

  useEffect(() => {
    if (currentUser?.role === "owner") {
      getDoc(doc(db, "places", currentUser?.place_id)).then((doc) => {
        if (doc.exists()) {
          const place = doc.data();
          console.log("place", place);
          setPlace(place);
          setTotal(String(place.total));
          setOccupied(String(place.occupied));
          setBusinessStatus(String(place?.business_status));
          if (place?.schedule?.length > 0) setSchedule(place?.schedule);
        } else {
          alert("Địa chỉ không tồn tại");
        }
        setLoading(false);
      });
    }
  }, [currentUser]);

  const updateParkingInfo = async () => {
    try {
      if (+occupied > +total) {
        Alert.alert("Bãi xe quá tải", "Bãi xe quá số lượng đỗ xe");
        return;
      }
      setLoading(true);
      const docRef = doc(db, "places", currentUser?.place_id);
      console.log("schedule", schedule);
      const weekday_text = schedule?.map(
        (day) => `${day.day}: ${day.open} - ${day.close}`
      );

      await updateDoc(docRef, {
        total: +total,
        occupied: +occupied,
        business_status: businessStatus ? "OPERATIONAL" : "CLOSED",
        schedule,
        opening_hours: { weekday_text },
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
      <View marginT-20>
        <Text text70BO marginB-10>
          Liên hệ
        </Text>
        <TextInput
          editable={false}
          testID="contactInput"
          placeholder="Số điện thoại"
          value={place?.formatted_phone_number}
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
        <View row centerV marginB-10 spread marginT-20>
          <TouchableOpacity onPress={() => setVisibleModal(true)}>
            <View row centerV>
              <Text text70BO marginR-10>
                Thời gian
              </Text>
              <ClockIcon color={Colors.primary} />
            </View>
          </TouchableOpacity>
          <View row centerV style={{ justifyContent: "flex-end" }}>
            <Text text70BO marginR-10>
              Đang mở
            </Text>
            <Checkbox
              center
              color={Colors.primary}
              value={!!businessStatus}
              onValueChange={() => setBusinessStatus(!businessStatus)}
            />
          </View>
        </View>
        <Button
          marginT-20
          backgroundColor={Colors.primary}
          label="Cập nhật"
          onPress={updateParkingInfo}
        />
        <ScheduleComponent
          visible={visibleModal}
          onDismiss={handleClose}
          schedule={schedule}
          onSelected={onSelected}
        />
      </View>
    </ScrollView>
  );
};

export default OwnerScreen;
