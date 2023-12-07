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
  ScrollView,
  Image,
} from "react-native";
import * as Linking from "expo-linking";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { GOOGLE_MAPS_API_KEY } from "./secrets";
import MapViewDirections from "react-native-maps-directions";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import {
  Badge,
  Button,
  Colors,
  Dialog,
  Icon,
  PanningProvider,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native-ui-lib";
import { Picker } from "react-native-ui-lib/src/components/picker";
import {
  ArrowRightOnRectangleIcon,
  Bars3BottomRightIcon,
  Bars3Icon,
  BellAlertIcon,
  BellIcon,
  ChevronLeftIcon,
  ClockIcon,
  HomeIcon,
  HomeModernIcon,
  LifebuoyIcon,
  LockClosedIcon,
  LockOpenIcon,
  MagnifyingGlassIcon,
  MapIcon,
  MapPinIcon,
  NewspaperIcon,
  PhoneIcon,
  StarIcon,
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
import { PRICE_TEXT, convertUtcOffset } from "./contanst";
import Popover from "react-native-popover-view";
// import MapScreen from "./screens/MapScreen";

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

  const onClear = () => {
    ref.current.clear();
    ref.current.blur();
    ref.current.focus();
  };
  return (
    <GooglePlacesAutocomplete
      ref={ref}
      styles={{
        zIndex: 999,
        textInput: {
          paddingHorizontal: 30,
        },
      }}
      nearbyPlacesAPI="GooglePlacesSearch"
      renderLeftButton={() => (
        <MagnifyingGlassIcon
          style={{ position: "relative", top: 10, left: 27, zIndex: 999 }}
          color={Colors.$textNeutral}
        />
      )}
      renderRightButton={() => (
        <TouchableOpacity
          style={{ position: "relative", top: 10, right: 27, zIndex: 999 }}
          onPress={onClear}
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
        language: "vi",
        types: "parking",
        radius: 10000,
      }}
    />
  );
};

export function MapScreen({ navigation }) {
  const screenWidth = Dimensions.get("window").width;
  const [region, setRegion] = useState({
    latitude: -1,
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
  const [isShowFullTimeOfWeek, setIsShowFullTimeOfWeek] = useState(false);
  const [reload, setReload] = useState(false);
  const [moveing, setMoveing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [inputSearch, setInputSearch] = useState("");
  const { currentUser } = useContext(AuthContext);
  const mapRef = useRef(null);

  function clearInput() {
    setInputSearch("");
  }

  useEffect(() => {
    if (!currentUser) {
      console.log("User is not logged in");
      navigation.navigate("LoginScreen");
    }
  }, [currentUser]);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
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

        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        const list = [
          {
            name: "Bãi gửi xe Trường Đại học Điện Lực",
            rating: 4.7,
            user_ratings_total: 3,
            vicinity:
              "47Phạm Văn Đồng, Đối diện cổng sau BCA, 47Phạm Văn Đồng, Mai Dịch",
            status: "OK",
            business_status: "OPERATIONAL",
            time_start: "07:00",
            time_end: "23:00",
            geometry: {
              location: {
                lat: 21.047437660287343,
                lng: 105.78520944321211,
              },
            },
          },

          {
            name: "Bãi gửi xe Trường Mần Non Sao Mai",
            rating: 4.7,
            user_ratings_total: 3,
            vicinity: "47Phạm Văn Đồng, Đối diện",
            status: "OK",
            business_status: "OPERATIONAL",
            opening_hours: { open_now: true },
            geometry: {
              location: {
                lat: 10.831743253209897,
                lng: 106.68665889081245,
              },
            },
          },
        ];
        setPlaces(list);
        // function writeUserData(userId) {
        //   set(ref(db, "users/" + userId), {
        //     region: {
        //       lat: location.coords.latitude,
        //       lng: location.coords.longitude,
        //       radius,
        //     },
        //   });
        // }

        // writeUserData("190002");

        console.log("Loadinggg");
        const apiKey = GOOGLE_MAPS_API_KEY; // Replace with your Google Maps API key
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.coords.latitude},${location.coords.longitude}&radius=${radius}&type=parking&key=${apiKey}`
        );
        const result = await response.json();

        if (result.status === "OK" && result.results.length > 0) {
          setPlaces(result.results);
        }
        console.log("result", result);

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

  const getPlaceDetail = async function (place_id) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=formatted_phone_number,price_level,opening_hours&key=${GOOGLE_MAPS_API_KEY}`
      );

      const result = await response.json();
      if (result.status !== "OK") throw new Error("Error");

      return result?.result;
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkerPress = (coordinate, place) => {
    console.log("coordinate", coordinate);
    if (!coordinate || moveing) return;

    console.log("place", place);
    getPlaceDetail(place.place_id)
      .then((response) => {
        console.log("full", { ...coordinate, ...place, ...response });
        setIsVisible(true);
        setDestination({ ...coordinate, ...place, ...response });
      })
      .catch((err) => {
        console.log("err", err);
      });
    // setMoveing(true);
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

  const onPressSearch = (data, details) => {
    if (
      details?.geometry?.location?.lat === undefined ||
      details?.geometry?.location?.lng === undefined
    )
      return;

    mapRef.current.animateCamera({
      zoom: 17,
      center: {
        latitude: details?.geometry?.location?.lat,
        longitude: details?.geometry?.location?.lng,
      },
    });
  };

  const handleCurrent = async () => {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
      maximumAge: 10000,
      timeout: 5000,
    });
    // console.log("mapRef.current", mapRef.current);
    const { latitude, longitude } = location.coords;

    mapRef.current.animateCamera({
      zoom: 17,
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

  const handleMoveToPark = async () => {
    setIsVisible(false);
    setMoveing(true);
  };

  const handleFinishPark = async () => {
    setMoveing(false);
  };

  const handleCancelPark = async () => {
    setDestination({});
    setMoveing(false);
  };

  const handleReload = async () => {
    setReload((prv) => !prv);
  };

  const handeOpenListPark = async () => {
    navigation.navigate("ListParkScreen");
  };

  const radiusOptions = [
    { label: "500m", value: 500 },
    { label: "1Km", value: 1000 },
    { label: "2Km", value: 2000 },
    { label: "5Km", value: 5000 },
  ];

  const renderTimeMove = (utc_offset) => {
    if (!utc_offset) return "Chưa có thông tin";
  };

  const renderTime = (weekday_text) => {
    if (!weekday_text) return "Chưa có thông tin";

    const times = weekday_text.map((time) => {
      const [day, timeRange] = time.split(": ");
      return <View row marginT-3>
        <Text text80B style={{width: 75}}>{day}:</Text>
        <Text text80R>{timeRange}</Text>
      </View>;
    });

    const dayOfWeek = new Date().getDay();
    const today = weekday_text[dayOfWeek] + " (Hôm nay)";

    return (
      <View>
        <Popover
          from={
            <TouchableOpacity style={{marginTop: 4}}>
              <Text text80R>{today}</Text>
            </TouchableOpacity>
          }
        >
          <View padding-10 width={200}>
          {times}
          </View>
        </Popover>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          zIndex: 99,
          width: "100%",
          height: 50,
          paddingTop: 40,
          backgroundColor: Colors.primary,
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
            position: "absolute",
            width: "100%",
            top: 100,
            left: 0,
            zIndex: 999,
          }}
        >
          <GooglePlacesInput onPress={onPressSearch} />
        </View>
      </View>

      <SafeAreaView
        style={{
          width: "100%",
          flex: 1,
          height: Dimensions.get("window").height,
        }}
      >
        <View
          style={{
            width: "100%",
            position: "relative",
            top: 100,
            zIndex: 9,
          }}
        >
          <ScrollView horizontal={true} style={{}}>
            {places?.slice(0, 5).map((place, idx) => (
              <View
                style={{ borderRadius: 18 }}
                marginL-10
                paddingH-10
                paddingV-10
                backgroundColor={Colors.$textWhite}
                key={place?.place_id || idx}
              >
                <Text>{place?.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
        {region.latitude === 0 ? (
          <View center flex>
            <Button
              onPress={handleReload}
              backgroundColor={Colors.$outlineWarning}
              label="Tải lại bản đồ"
            ></Button>
          </View>
        ) : (
          <MapView
            ref={(r) => (mapRef.current = r)}
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
            bottom: 125,
            right: 0,
            paddingHorizontal: 20,
          }}
        >
          <TouchableOpacity
            onPress={handeOpenListPark}
            style={{
              borderRadius: 999,
              backgroundColor: Colors.$textWhite,
              padding: 5,
            }}
          >
            <Bars3BottomRightIcon color={Colors.$backgroundNeutralHeavy} />
          </TouchableOpacity>
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
        {moveing ? (
          <>
            <Button
              marginT-20
              style={{
                position: "absolute",
                zIndex: 99,
                bottom: 40,
                left: 10,
                width: 70,
              }}
              label="Hủy"
              labelStyle={{ color: Colors.$textDanger }}
              backgroundColor={Colors.$backgroundDangerLight}
              onPress={handleCancelPark}
            />
            <Button
              style={{
                position: "absolute",
                zIndex: 99,
                bottom: 40,
                left: 120,
                paddingHorizontal: 20,
                width: 200,
              }}
              marginT-20
              label="Đã đỗ xe"
              backgroundColor={Colors.primary}
              onPress={handleFinishPark}
            />
          </>
        ) : null}

        <View
          row
          style={{
            position: "absolute",
            zIndex: 99,
            bottom: 20,
            right: -5,
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
                <View center>
                  <TouchableOpacity
                    style={{
                      borderRadius: 999,
                      backgroundColor: Colors.$textWhite,
                      padding: 5,
                    }}
                  >
                    <MapPinIcon color={Colors.$textDanger} />
                  </TouchableOpacity>
                  <Text $textDanger text80 marginR-5>
                    {label}
                  </Text>
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
      <Loading isVisible={loading} text="Loading" />
      <Dialog
        visible={isVisible}
        onDismiss={() => setIsVisible(false)}
        onDialogDismissed={() => setIsVisible(false)}
        panDirection={PanningProvider.Directions.DOWN}
        useSafeArea
        bottom={true}
        height={500}
        containerStyle={{
          zIndex: 999,
          backgroundColor: Colors.$textWhite,
          width: Dimensions.get("window").width,
          position: "relative",
          left: -20,
          padding: 20,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        {destination?.photos?.length > 0 ? (
          <View row centerV>
            <Image
              width={screenWidth - 40}
              style={{ objectFit: "cover", borderRadius: 10 }}
              height={150}
              source={{
                uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${screenWidth}&photo_reference=${destination?.photos[0]?.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`,
              }}
            />
          </View>
        ) : null}

        <Text text60 marginT-10>
          Đỗ xe tại {destination?.name || "Chưa xác định"}
        </Text>
        <View row centerV marginT-10 gap-5>
          <StarIcon color={Colors.$outlineWarning} />
          <Text text80R>
            Đánh giá: {destination?.rating || "0"} sao | (
            {destination.user_ratings_total} người){" "}
          </Text>
        </View>
        <View row centerV marginT-10 gap-5 paddingR-20>
          <MapPinIcon color={Colors.$backgroundDangerHeavy} />
          <Text text80R>Địa chỉ: {destination?.vicinity || "Trống"} </Text>
        </View>
        <View row centerV marginT-10 gap-5>
          {destination?.opening_hours?.open_now ? (
            <LockOpenIcon color={Colors.$iconSuccess} />
          ) : (
            <LockClosedIcon color={Colors.$iconDanger} />
          )}
          <Text text80R>
            Trạng thái:{" "}
            {destination?.opening_hours?.open_now ? "Mở cửa" : "Đóng cửa"}{" "}
          </Text>
        </View>
        <View row centerV marginT-10 gap-5>
          <ClockIcon color={Colors.$textNeutralHeavy} />
          <Text text80R>
            Thời gian: {renderTime(destination?.opening_hours?.weekday_text)}
          </Text>
        </View>

        <View row centerV marginT-10 gap-5>
          <NewspaperIcon color={Colors.$outlinePrimary} />
          <Text text80R>
            Di chuyển: {convertUtcOffset(destination?.utc_offset)}
          </Text>
        </View>
        <View row centerV marginT-10 gap-5>
          <PhoneIcon color={Colors.$outlinePrimary} />
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(`tel:${destination?.formatted_phone_number}`)
            }
          >
            <Text text80R>SĐT: {destination?.formatted_phone_number}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 90 }} />
        <Button
          style={{
            position: "absolute",
            bottom: 15,
            width: "100%",
            marginHorizontal: 20,
          }}
          marginT-20
          label="Đến bãi đỗ xe"
          backgroundColor={Colors.primary}
          onPress={handleMoveToPark}
        />
      </Dialog>
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
