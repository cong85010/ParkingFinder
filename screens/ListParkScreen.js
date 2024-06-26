import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
  MagnifyingGlassIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  XCircleIcon,
} from "react-native-heroicons/solid";
import { findNearbyParkingLots, radiusOptions } from "../contanst";
import Popover from "react-native-popover-view";
import { Placement } from "react-native-popover-view/dist/Types";
import { collection, getDocs, orderBy } from "firebase/firestore";
import { query } from "firebase/database";
import { db } from "../firebase";

const ListParkScreen = ({ navigation }) => {
  const [places, setPlaces] = useState([]);
  const [radius, setRadius] = useState(500);
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const inputSearchRef= useRef(null);
  const { currentUser, locationMove, moveNewLocation } =
    useContext(AuthContext);
  const [inputSearch, setInputSearch] = useState("");

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

        const q = query(collection(db, "places"), orderBy("latitude", "asc"));
        
        const parkingLotsDB = await getDocs(q);
        const resultParks = [];
        console.log("parkingLotsDB", parkingLotsDB);

        parkingLotsDB.forEach((doc) => {
          resultParks.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        // Sử dụng
        const nearbyLots = findNearbyParkingLots(
          resultParks,
          latitude,
          longitude,
          radius / 1000,
          inputSearch
        );

        console.log("Loadinggg");
        const apiKey = GOOGLE_MAPS_API_KEY; // Replace with your Google Maps API key
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=parking&keyword=${inputSearch}&key=${apiKey}`
        );
        const result = await response.json();

        setPlaces([...result.results, ...nearbyLots]);

        console.log("result", result);
        inputSearchRef.current.blur()
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

    initData();
  }, [radius, reload]);

  const handleSubmitEditing = ({
    nativeEvent: { text, eventCount, target },
  }) => {
    setReload(!reload);
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 10 }}>
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
                navigation.navigate("MapScreen", {
                  selectedMove: place,
                });
              }}
            >
              <PaperAirplaneIcon color={Colors.primary} />
            </TouchableOpacity>
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

export default ListParkScreen;
