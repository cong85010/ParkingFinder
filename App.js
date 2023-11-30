import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  StyleSheet,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  AppRegistry,
  Alert,
  TextInput,
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
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  BellAlertIcon,
  BellIcon,
  ChevronLeftIcon,
  HomeIcon,
  HomeModernIcon,
  LifebuoyIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  NewspaperIcon,
  UserIcon,
  XCircleIcon,
} from "react-native-heroicons/solid";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import WebView from "react-native-webview";
import { auth, db } from "./firebase";
import { ref, set } from "firebase/database";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { LoginScreen } from "./screens/Login";
import { RegisterScreen } from "./screens/Register";
import { createDrawerNavigator } from "@react-navigation/drawer";
import ProfileScreen from "./screens/ProfileScreen";
import NotificationsScreen from "./screens/Notification";
import Loading from "./screens/Loading";
import { AuthContext } from "./context";

Colors.loadColors({
  primary: "#00bfff",
  secondary: "#d9d9d9",
  mainbg: "#f5f6fa",
  sidebg: "#ffffff",
  $textWhite: "#ffffff",
  $textPrimary: "#00bfff",
});

export function MapScreen({ navigation }) {
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
  const [inputSearch, setInputSearch] = useState("");
  const { currentUser } = useContext(AuthContext);
  function clearInput() {
    setInputSearch("");
  }

  useEffect(() => {
    if (!currentUser) {
      navigation.navigate("LoginScreen");
    }
  }, [currentUser]);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.error("Permission to access location was denied");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        location.coords.latitude = 10.834593012911455;
        location.coords.longitude = 106.68884075965167;
        function writeUserData(userId) {
          set(ref(db, "users/" + userId), {
            region: {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
              radius,
            },
          });
        }

        writeUserData("190002");

        // Fetch nearby places using Google Places API nearbysearch
        console.log("Loadinggg");
        const apiKey = GOOGLE_MAPS_API_KEY; // Replace with your Google Maps API key
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.coords.latitude},${location.coords.longitude}&radius=${radius}&type=parking&key=${apiKey}`
        );
        const result = await response.json();

        if (result.status === "OK" && result.results.length > 0) {
          setPlaces(result.results);
        }
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
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

  const handleSubmitEditing = ({
    nativeEvent: { text, eventCount, target },
  }) => {
    console.log(text);
    // if (
    //   details?.geometry?.location?.lat === undefined ||
    //   details?.geometry?.location?.lng === undefined
    // )
    //   return;
    // setDestination({
    //   latitude: details?.geometry?.location?.lat,
    //   longitude: details?.geometry?.location?.lng,
    // });
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
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Bars3Icon color={Colors.$textWhite} />
          </TouchableOpacity>
          <Text text60 $textWhite>
            Parking
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("NotificationsScreen")}
          >
            <BellIcon color={Colors.$textWhite} />
          </TouchableOpacity>
        </View>
        <View
          style={{
            position: "reactive",
            width: "100%",
            top: 30,
            left: 0,
            paddingHorizontal: 20,
          }}
        >
          <MagnifyingGlassIcon
            style={{ position: "absolute", top: 8, left: 27, zIndex: 999 }}
            color={Colors.$textNeutral}
          />
          <TextInput
            value={inputSearch}
            onChangeText={setInputSearch}
            onSubmitEditing={handleSubmitEditing}
            placeholder="Bạn muốn đỗ xe ở đâu?"
            style={{
              backgroundColor: "#FFF",
              height: 40,
              paddingVertical: 10,
              paddingHorizontal: 40,
              borderRadius: 6,
            }}
          />
          <TouchableOpacity
            style={{ position: "absolute", top: 8, right: 27, zIndex: 999 }}
            onPress={clearInput}
          >
            <XCircleIcon color={Colors.$textNeutral} />
          </TouchableOpacity>
        </View>
      </View>
      <SafeAreaView style={{ width: "100%", flex: 1 }}>
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

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [pending, setPending] = useState(true);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setPending(false);
    });
  }, []);

  if (pending) {
    return <Loading isVisible={pending} text="Loading" />;
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const Drawer = createDrawerNavigator();

const IconView = ({ children }) => (
  <View style={{ flexDirection: "row", alignItems: "center" }}>{children}</View>
);

const LogoutScreen = ({ navigation }) => {
  const { currentUser } = useContext(AuthContext);

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigation.navigate("LoginScreen");
    });
  };

  handleLogout();

  return (
    <View flex center>
      <Text text40>Đăng xuất</Text>
      <Button
        label="Đăng xuất"
        backgroundColor="#007BFF"
        labelStyle={{ fontWeight: "bold" }}
        style={styles.editButton}
        onPress={handleLogout}
      />
    </View>
  );
};

const DrawerNavigator = ({ navigation }) => {
  const { currentUser } = useContext(AuthContext);
  const cur = currentUser ? currentUser.email : "no user";
  const navigate = useNavigation();
  return (
    <Drawer.Navigator>
      <Drawer.Screen
        options={{
          headerShown: false,
          drawerLabel: "Trang chủ",
          drawerIcon: ({ color }) => (
            <IconView>
              <HomeIcon color={Colors.primary} />
            </IconView>
          ),
        }}
        name="HomeScreen"
        component={HomeScreen}
      />
      <Drawer.Screen
        name="NotificationsScreen"
        component={NotificationsScreen}
        options={{
          drawerLabel: "Thông báo",
          title: "Thông báo",
          headerLeftContainerStyle: {
            paddingLeft: 10,
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigate.goBack()}>
              <ChevronLeftIcon color={Colors.primary} />
            </TouchableOpacity>
          ),
          drawerIcon: ({ color }) => (
            <IconView>
              <BellIcon color={Colors.primary} />
            </IconView>
          ),
        }}
      />
      <Drawer.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          title: "Thông tin",
          headerLeftContainerStyle: {
            paddingLeft: 10,
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigate.goBack()}>
              <ChevronLeftIcon color={Colors.primary} />
            </TouchableOpacity>
          ),
          drawerLabel: "Thông tin",
          drawerIcon: ({ color }) => (
            <IconView>
              <UserIcon color={Colors.primary} />
            </IconView>
          ),
        }}
      />
      <Drawer.Screen
        name="LogoutScreen"
        component={LogoutScreen}
        options={{
          drawerLabel: "Đăng xuất",
          drawerIcon: ({ color }) => (
            <IconView>
              <ArrowRightOnRectangleIcon color={Colors.primary} />
            </IconView>
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export const HomeScreen = () => {
  return (
    <Stack.Navigator initialRouteName="MapScreen">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name="LoginScreen"
        component={LoginScreen}
      />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name="RegisterScreen"
        component={RegisterScreen}
      />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name="MapScreen"
        component={MapScreen}
      />
    </Stack.Navigator>
  );
};

export default App = () => {
  return (
    <AuthProvider>
      <NavigationContainer style={{ flex: 1 }}>
        <DrawerNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};
AppRegistry.registerComponent("main", () => App);
