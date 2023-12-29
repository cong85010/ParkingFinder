import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Dimensions, Image, TextInput, Alert, DeviceEventEmitter, TouchableOpacity } from "react-native";
import MapView from "react-native-maps";
import { View, Colors, Text, Button } from "react-native-ui-lib";
import * as Location from "expo-location";
import { useIsFocused } from "@react-navigation/core";
import { LifebuoyIcon } from "react-native-heroicons/solid";

const SelectMapView = ({ route, navigation }) => {
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedLocation, setSelectedLocation] = useState();
  const mapRef = useRef(null);
  const [isForm, setIsForm] = useState(false);
  const [place, setPlace] = useState({});
  const { user } = route.params;
  const isFocused = useIsFocused();

  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
  };

  const handleCurrent = async () => {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
      maximumAge: 10000,
      timeout: 5000,
    });

    location.coords.latitude = 10.834593012911455;
    location.coords.longitude = 106.68884075965167;
    // console.log("mapRef.current", mapRef.current);
    const { latitude, longitude } = location.coords;

    mapRef.current?.animateCamera({
      zoom: 20,
      center: {
        latitude,
        longitude,
      },
    });

    setRegion({
      latitude,
      longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };

  useEffect(() => {
    if (!isForm && isFocused) {
      handleCurrent();
    }
  }, [isFocused]);

  const selectLocation = () => {
    setSelectedLocation({
      latitude: region.latitude,
      longitude: region.longitude,
    });
    setIsForm(true);
  };

  const updateParkingInfo = async () => {
    try {
      //Required all field
      if (!place?.name || !place?.vicinity || !place?.total || !place?.occupied || !place?.formatted_phone_number) {
        Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin");
        return;
      }

      if (+place?.occupied > +place?.total) {
        Alert.alert("Bãi xe quá tải", "Bãi xe quá số lượng đỗ xe");
        return;
      }

      navigation.navigate("RegisterScreen", {
        user,
        place: {
          ...place,
          ...selectedLocation,
        },
      })
    
    } catch (error) {
      Alert.alert("Lỗi", "Hệ thống quá tải, thử lại sau!!!");
      console.log(error);
    }
  };

  if (isForm) {
    return (
      <View padding-20>
        <Text text50BL marginT-20>
          Tạo bãi giữ xe
        </Text>
        <View marginT-20>
          <Text text70BO marginB-10>
            Tên bãi xe
          </Text>
          <TextInput
            placeholder="Tên bãi xe"
            value={place?.name}
            onChangeText={(value) =>
              setPlace((prevPlace) => ({ ...prevPlace, name: value }))
            }
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
            Địa chỉ
          </Text>
          <TextInput
            placeholder="Địa chỉ"
            value={place?.vicinity}
            onChangeText={(value) =>
              setPlace((prevPlace) => ({ ...prevPlace, vicinity: value }))
            }
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
                value={place?.total}
                onChangeText={(value) =>
                  setPlace((prevPlace) => ({ ...prevPlace, total: value }))
                }
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
                value={place?.occupied}
                onChangeText={(value) =>
                  setPlace((prevPlace) => ({ ...prevPlace, occupied: value }))
                }
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
              value={place?.formatted_phone_number}
              onChangeText={(value) =>
                setPlace((prevPlace) => ({
                  ...prevPlace,
                  formatted_phone_number: value,
                }))
              }
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
            label="Thêm bãi xe"
            onPress={updateParkingInfo}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        ref={(r) => (mapRef.current = r)}
        region={region}
        onRegionChangeComplete={handleRegionChange}
      />
      <View style={styles.markerFixed}>
        <Image
          style={{ width: 30, height: 30 }}
          source={require("../assets/parking.png")}
        />
      </View>
      <View
          row
          style={{
            position: "absolute",
            zIndex: 99,
            bottom: 85,
            right: 0,
            paddingHorizontal: 20,
          }}
        >
          <TouchableOpacity
            onPress={handleCurrent}
            style={{
              borderRadius: 999,
              backgroundColor: Colors.$textWhite,
              padding: 5,
            }}
          >
            <LifebuoyIcon color={Colors.$textPrimary} />
          </TouchableOpacity>
        </View>
      <Button
        label="Chọn vị trí bãi xe"
        backgroundColor={Colors.primary}
        style={{ marginBottom: 30 }}
        onPress={selectLocation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerFixed: {
    left: "50%",
    marginLeft: -24,
    marginTop: -48,
    position: "absolute",
    top: "50%",
  },
});

export default SelectMapView;
