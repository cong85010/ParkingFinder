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
  Bars3Icon,
  BellAlertIcon,
  BellIcon,
  LifebuoyIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  XCircleIcon,
} from "react-native-heroicons/solid";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import WebView from "react-native-webview";

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

export function MapScreen() {
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
        console.log("radius", radius);
        location.coords.latitude = 10.835724039657979;
        location.coords.longitude = 106.68847443564913;
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });

        // Fetch nearby places using Google Places API nearbysearch
        // console.log("Loadinggg");
        // const apiKey = GOOGLE_MAPS_API_KEY; // Replace with your Google Maps API key
        // const response = await fetch(
        //   `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.coords.latitude},${location.coords.longitude}&radius=${radius}&type=parking&key=${apiKey}`
        // );
        // const result = await response.json();
        // console.log("finished", result.results);

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

  const handleCurrent = async () => {
    let location = await Location.getCurrentPositionAsync({});
    console.log("location", location);
    setRegion((prv) => ({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }));
  };

  const radiusOptions = [
    { label: "500m", value: 500 },
    { label: "1Km", value: 1000 },
    { label: "2Km", value: 2000 },
    { label: "5Km", value: 5000 },
  ];

  const htmlContent = `
  <!DOCTYPE html>
<html>

<head>
   <meta charset="utf-8">
   <meta name="viewport" content="width=device-width">
   <title>JS Bin</title>
   <style>
      body {
         width: 100%;
         height: 100%;
         position: absolute;
         margin: 0px;
         padding: 0px;
         overflow: hidden;
      }

      #mapContainer {
         position: absolute;
         top: 0;
         bottom: 0;
         width: 100%;
         height: 100%;
      }
   </style>
</head>

<body>
   <script type="text/javascript" src="https://js.api.here.com/v3/3.1/mapsjs-core.js"></script>
   <script type="text/javascript" src="https://js.api.here.com/v3/3.1/mapsjs-service.js"></script>
   <script type="text/javascript" src="https://js.api.here.com/v3/3.1/mapsjs-mapevents.js"></script>
   <div id="mapContainer"></div>

   <script>
      function loadMap() {
         var platform = new H.service.Platform({
            'apikey': 'ZjnsjW7xLZvZaRrk0hJWyc-Wgj66A6zPGXTQ0Qdi5-M'
         });

         var defaultLayers = platform.createDefaultLayers();

         var map = new H.Map(
            document.getElementById('mapContainer'),
            defaultLayers.vector.normal.map, {
            zoom: 11,
            center: {
               lat: 53.349805,
               lng: -6.260310
            }
         });

         const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

         // Enable dynamic resizing of the map, based on the current size of the enclosing cntainer
         window.addEventListener('resize', () => map.getViewPort().resize());


      }

      document.addEventListener('DOMContentLoaded', function () {
         console.log('DOM is ready');
         loadMap();
      });
   </script>
</body>

</html>
  `;

  return (
    <View style={styles.container}>
      <View
        style={{
          zIndex: 99,
          width: "100%",
          height: 80,
          backgroundColor: Colors.primary,
          paddingTop: 40,
        }}
      >
        <View row spread paddingH-10>
          <TouchableOpacity>
            <Bars3Icon color={Colors.$textWhite} />
          </TouchableOpacity>
          <Text text60 $textWhite>
            Parking
          </Text>
          <TouchableOpacity>
            <BellIcon color={Colors.$textWhite} />
          </TouchableOpacity>
        </View>
        <View style={{ position: "absolute", width: "100%", top: 90, left: 0 }}>
          <GooglePlacesInput onPress={onPressSearch} />
        </View>
      </View>
      <SafeAreaView style={{ width: "100%", flex: 1 }}>
        <WebView
          source={{ html: htmlContent }}
          // source={{ uri: "http://192.168.1.118:5501/index.html" }}
          style={{
            width: "100%",
            height: "100%",
          }}
          javaScriptEnabled={true}
        />
        {/* {region.latitude !== 0 && (
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
          )} */}
        <View
          row
          style={{
            position: "absolute",
            zIndex: 99,
            bottom: 70,
            right: 0,
            paddingHorizontal: 20,
          }}
        >
          <TouchableOpacity onPress={handleCurrent}>
            <LifebuoyIcon color={Colors.$textPrimary} />
          </TouchableOpacity>
        </View>
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
            topBarProps={{ title: "Languages" }}
            renderCustomDialogHeader={({ onDone, onCancel }) => (
              <View padding-s5 row spread>
                <Text text70>Bán kính khu vực:</Text>
              </View>
            )}
            renderPicker={(_value, label) => {
              return (
                <View row center>
                  <Text $textDanger text80>
                    {label}
                  </Text>
                  <MapPinIcon color={Colors.$textDanger} />
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
const Stack = createNativeStackNavigator();

export default App = () => {
  return (
    <NavigationContainer style={{ flex: 1 }}>
      <Stack.Navigator>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
          name="Home"
          component={MapScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
AppRegistry.registerComponent("main", () => App);
