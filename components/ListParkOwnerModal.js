import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { View, Text, Card, Colors, Picker } from "react-native-ui-lib";
import * as Location from "expo-location";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  PlusCircleIcon,
  XCircleIcon,
} from "react-native-heroicons/solid";
import Popover from "react-native-popover-view";
import { Placement } from "react-native-popover-view/dist/Types";
import { AuthContext } from "../context";
import { GOOGLE_MAPS_API_KEY } from "../secrets";
import { radiusOptions } from "../contanst";
import { useNavigation } from "@react-navigation/core";

const ListParkOwnerModal = ({ visible, onDismiss, onSelected, onAddNew }) => {
  const [places, setPlaces] = useState([]);
  const [radius, setRadius] = useState(500);
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const inputSearchRef = useRef(null);
  const { currentUser, locationMove, moveNewLocation } =
    useContext(AuthContext);
  const [inputSearch, setInputSearch] = useState("");
  const navigation = useNavigation();
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedLocation, setSelectedLocation] = useState();

  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
  };

  const selectLocation = () => {
    setSelectedLocation({
      latitude: region.latitude,
      longitude: region.longitude,
    });
    // Here, you might want to do something with the selected location, like storing it or displaying it.
  };

  function clearInput() {
    setInputSearch("");
  }
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        setPlaces([]);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.error("Permission to access location was denied");
          return;
        }

        console.log("requestForegroundPermissionsAsync", status);
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
          maximumAge: 10000,
          timeout: 5000,
        });

        console.log("location", location);

        location.coords.latitude = 10.834593012911455;
        location.coords.longitude = 106.68884075965167;

        const { latitude, longitude } = location.coords;

        console.log("Loadinggg");
        const apiKey = GOOGLE_MAPS_API_KEY; // Replace with your Google Maps API key
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=parking&keyword=${inputSearch}&key=${apiKey}`
        );
        const result = await response.json();

        if (result.status === "OK" && result.results.length > 0) {
          setPlaces(result.results);
        }
        console.log("result", result);
        inputSearchRef.current.blur();
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
        setRegion({
          latitude: 0,
          longitude: 0,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    };

    if (visible) {
      initData();
    }
  }, [radius, reload]);

  const handleSubmitEditing = ({
    nativeEvent: { text, eventCount, target },
  }) => {
    setReload(!reload);
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      style={{ flex: 1, padding: 10 }}
      close
    >
      <SafeAreaView
        style={{ flex: 1, padding: 10, backgroundColor: "#f2f4f7" }}
      >
        <View row spread paddingH-10>
          <Text text50R marginB-10>
            Chọn bãi đỗ xe
          </Text>
          <View row centerV gap-20>
            <TouchableOpacity onPress={onAddNew}>
              <PlusCircleIcon
                color={Colors.primary}
                style={{ width: 30, height: 30 }}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDismiss}>
              <XCircleIcon
                color={Colors.$backgroundDark}
                style={{ width: 30, height: 30 }}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View row centerV marginB-10 gap-10 spread>
          <Popover
            isVisible={isVisible}
            placement={Placement.RIGHT}
            onRequestClose={() => setIsVisible(false)}
            from={
              <TouchableOpacity
                style={{
                  borderRadius: 999,
                  backgroundColor: Colors.$textWhite,
                  padding: 10,
                }}
                onPress={() => setIsVisible(true)}
              >
                <View centerV row paddingH-3 paddingV-2>
                  <Text $textDanger text70 marginR-5>
                    {radiusOptions.find((item) => item.value === radius).label}
                  </Text>
                  <MapPinIcon color={Colors.$textDanger} />
                </View>
              </TouchableOpacity>
            }
          >
            <View center padding-10>
              {radiusOptions.map((radius) => (
                <TouchableOpacity
                  key={radius.value}
                  value={radius.value}
                  label={radius.label}
                  onPress={() => {
                    setRadius(radius.value);
                    setIsVisible(false);
                  }}
                  style={{
                    borderBottomColor: Colors.$textDisabled,
                    borderBottomWidth: 1,
                    marginTop: 5,
                  }}
                >
                  <Text text60R padding-10>
                    {radius.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Popover>

          <TextInput
            ref={inputSearchRef}
            value={inputSearch}
            onChangeText={setInputSearch}
            onSubmitEditing={handleSubmitEditing}
            placeholder="Bạn muốn đỗ xe ở đâu?"
            style={{
              backgroundColor: "#FFF",
              height: "100%",
              paddingVertical: 10,
              paddingHorizontal: 20,
              flexGrow: 1,
              borderRadius: 999,
            }}
            clearButtonMode="always"
          />
          <TouchableOpacity
            style={{ backgroundColor: "#FFF", padding: 10, borderRadius: 999 }}
            onPress={handleSubmitEditing}
          >
            <MagnifyingGlassIcon color={Colors.primary} />
          </TouchableOpacity>
        </View>
        {loading && (
          <View center flex>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}
        <ScrollView>
          {places.map((place, idx) => (
            <Card
              key={place.place_id || idx}
              borderRadius={12}
              marginB-16
              padding-16
              style={styles.card}
            >
              <View style={{ flex: 0.9 }}>
                <Text text70R style={styles.notificationTitle}>
                  {place.name}
                </Text>
                <Text text90R style={styles.notificationMessage}>
                  {place.vicinity}
                </Text>
              </View>
              <TouchableOpacity
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
                  onSelected(place);
                }}
              >
                <MapPinIcon color={Colors.$iconDanger} />
              </TouchableOpacity>
            </Card>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
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

export default ListParkOwnerModal;
