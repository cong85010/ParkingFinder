import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  AppRegistry,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { GOOGLE_MAPS_API_KEY } from "./secrets";
import MapViewDirections from "react-native-maps-directions";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import {
  Badge,
  Button,
  Colors,
  Icon,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native-ui-lib";
import { Picker } from "react-native-ui-lib/src/components/picker";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  XCircleIcon,
} from "react-native-heroicons/solid";
Colors.loadColors({
  primary: "#00bfff",
  secondary: "#d9d9d9",
  mainbg: "#f5f6fa",
  sidebg: "#ffffff",
  $textWhite: "#ffffff",
  $textPrimary: "#00bfff",
});

const GooglePlacesInput = ({ onPress }) => {
  const ref = useRef();

  return (
    <GooglePlacesAutocomplete
    ref={ref}
      styles={{
        zIndex: 999,
        textInput: {
          paddingHorizontal: 30,
        },
      }}
      renderLeftButton={() => (
        <MagnifyingGlassIcon
          style={{ position: "relative", top: 10, left: 27, zIndex: 999 }}
          color={Colors.$textNeutral}
        />
      )}
      renderRightButton={() => (
        <TouchableOpacity
          style={{ position: "relative", top: 10, right: 27, zIndex: 999 }}
          onPress={() => ref.current.clear()}
        >
          <XCircleIcon color={Colors.$textNeutral} />
        </TouchableOpacity>
      )}
      onFail={() => Alert.alert("Lỗi", "Hệ thống quá tải, thử lại sau!!!")}
      fetchDetails={true}
      placeholder="Bạn muốn đỗ xe ở đâu?"
      onPress={onPress}
      query={{
        key: GOOGLE_MAPS_API_KEY,
        language: "en",
        types: "parking",
      }}
    />
  );
};

export default function App() {
  const [region, setRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [places, setPlaces] = useState([]);
  const [radius, setRadius] = useState(500);
  const [destination, setDestination] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [moveing, setMoveing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.error("Permission to access location was denied");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        console.log("location", location);
        location.coords.latitude = 10.835724039657979;
        location.coords.longitude = 106.68847443564913;
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });

        // Fetch nearby places using Google Places API nearbysearch
        console.log("Loadinggg");
        // const apiKey = GOOGLE_MAPS_API_KEY; // Replace with your Google Maps API key
        // const response = await fetch(
        //   `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.coords.latitude},${location.coords.longitude}&radius=${radius}&type=parking&key=${apiKey}`
        // );
        // const result = await response.json();

        // if (result.status === "OK" && result.results.length > 0) {
        //   setPlaces(result.results);
        // }
      } catch (error) {
        console.error(error);
      }
    })();
  }, [radius]);

  const handleMarkerPress = (coordinate, position) => {
    console.log("coordinate", coordinate);
    if (!coordinate) return;
    setDestination(coordinate);
    setMoveing(true);
  };

  const onPressSearch = (data, details) => {
    if (
      details?.geometry?.location?.lat === undefined ||
      details?.geometry?.location?.lng === undefined
    )
      return;
    setDestination({
      latitude: details?.geometry?.location?.lat,
      longitude: details?.geometry?.location?.lng,
    });
    setMoveing(true);
  };

  const radiusOptions = [
    { label: "500m", value: 500 },
    { label: "1Km", value: 1000 },
    { label: "2Km", value: 2000 },
    { label: "5Km", value: 5000 },
  ];

  return (
    <View style={styles.container}>
      <View
        style={{
          zIndex: 99,
          width: "100%",
          height: 80,
          backgroundColor: "#00bfff",
          paddingTop: 50,
        }}
      >
        <View
          style={{ position: "absolute", width: "100%", top: 90, left: 0 }}
        >
          <GooglePlacesInput onPress={onPressSearch} />
        </View>
      </View>
      <SafeAreaView style={{ width: "100%", flex: 1 }}>
        <KeyboardAvoidingView behavior="padding" enabled>
          {region.latitude !== 0 && (
            <MapView
              style={styles.map}
              region={region}
              showsUserLocation={false}
              followsUserLocation={true}
            >
              {moveing ? (
                <MapViewDirections
                  origin={region}
                  destination={destination}
                  apikey={GOOGLE_MAPS_API_KEY}
                  strokeWidth={5}
                  strokeColor="#3399ff"
                />
              ) : null}

              {places.map((place, index) => (
                <Marker
                  key={index}
                  onPress={(e) =>
                    handleMarkerPress(e.nativeEvent.coordinate, place)
                  }
                  coordinate={{
                    latitude: place.geometry.location.lat,
                    longitude: place.geometry.location.lng,
                  }}
                  title={place.name}
                  description={place.vicinity}
                  icon={
                    place.business_status === "OPERATIONAL"
                      ? require("./assets/parking.png")
                      : require("./assets/no-parking.png")
                  }
                />
              ))}

              <Marker
                coordinate={region}
                title="Vị trí của bạn"
                description="Bạn đang ở đây"
                icon={require("./assets/car.png")}
                anchor={{ x: 0.5, y: 0.5 }}
              />
            </MapView>
          )}
        </KeyboardAvoidingView>
        <View
          row
          style={{
            position: "absolute",
            zIndex: 99,
            bottom: 30,
            right: 0,
            paddingHorizontal: 20,
          }}
        >
          <Picker
            enableModalBlur={false}
            useDialog
            value={radius}
            onChange={(value) => setRadius(value)}
            label="Bán kính"
            placeholder="Chọn bán kính"
            customPickerProps={{
              migrateDialog: true,
              dialogProps: { bottom: true, width: "100%", height: "45%" },
            }}
            topBarProps={{title: 'Languages'}}
            renderCustomDialogHeader={({onDone, onCancel}) => (
              <View padding-s5 row spread>
                <Text text70>
                  Bán kính khu vực:
                </Text>
              </View>
            )}
            renderPicker={(_value, label) => {
              return (
                <View row center>
                  <Text $textDanger text80>
                    {label}
                  </Text>
                  <MapPinIcon
                    height={33}
                    width={33}
                    color={Colors.$textDanger}
                  />
                </View>
              );
            }}
          >
            {radiusOptions.map((radius) => (
              <Picker.Item key={radius.value} {...radius} />
            ))}
          </Picker>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00bfff",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height + 50,
  },
});

AppRegistry.registerComponent("main", () => App);
