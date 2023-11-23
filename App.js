import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { GOOGLE_MAPS_API_KEY } from "./secrets";
import MapViewDirections from "react-native-maps-directions";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const GooglePlacesInput = ({ onPress }) => {
  return (
    <GooglePlacesAutocomplete
      styles={{
        zIndex: 999,
      }}
      fetchDetails={true}
      placeholder="Bạn muốn đỗ xe ở đâu?"
      onPress={onPress}
      query={{
        key: GOOGLE_MAPS_API_KEY,
        language: "en",
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
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });

        // Fetch nearby places using Google Places API nearbysearch
        const apiKey = GOOGLE_MAPS_API_KEY; // Replace with your Google Maps API key
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.coords.latitude},${location.coords.longitude}&radius=${radius}&type=parking&key=${apiKey}`
        );
        const result = await response.json();

        if (result.status === "OK" && result.results.length > 0) {
          setPlaces(result.results);
        }
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  const handleMarkerPress = (coordinate, position) => {
    setDestination(coordinate);
    setMoveing(true);
  };

  const onPressSearch = (data, details) => {
    setDestination({
      latitude: details?.geometry?.location?.lat,
      longitude: details?.geometry?.location?.lng,
    });
    setMoveing(true);
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          position: "absolute",
          top: 0,
          zIndex: 99,
          width: "100%",
          paddingHorizontal: 20,
          flex: 0.5,
          height: 100,
          backgroundColor: "#00bfff",
        }}
      >
        <View style={{ position: "relative" }}>
          <GooglePlacesInput onPress={onPressSearch} />
          <View style={{ position: "relative" }}>
            <Text
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                color: "#fff",
                fontSize: 18,
              }}
            >
              Bán kính: {radius}m
            </Text>
          </View>
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
