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
  ActivityIndicator,
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
  HeartIcon as HeartIconS,
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
  RectangleStackIcon,
  StarIcon,
  TruckIcon,
  UserIcon,
  XCircleIcon,
} from "react-native-heroicons/solid";
import { HeartIcon } from "react-native-heroicons/outline";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  NavigationContainer,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import WebView from "react-native-webview";
import { auth, db } from "./firebase";
import { get, query, ref, set } from "firebase/database";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { LoginScreen } from "./screens/Login";
import { RegisterScreen } from "./screens/Register";
import { createDrawerNavigator } from "@react-navigation/drawer";
import ProfileScreen from "./screens/ProfileScreen";
import NotificationsScreen from "./screens/Notification";
import Loading from "./screens/Loading";
import { AuthContext } from "./context";
import {
  PRICE_TEXT,
  convertUtcOffset,
  findNearbyParkingLots,
  radiusOptions,
} from "./contanst";
import Popover from "react-native-popover-view";
import ListParkScreen from "./screens/ListParkScreen";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  updateDoc,
  where,
} from "firebase/firestore";
import ListHeartScreen from "./screens/ListHeartScreen";
import ListParkedScreen from "./screens/ListParkedScreen";
import AdminScreen from "./screens/AdminScreen";
import OwnerScreen from "./screens/OwnerScreen";
import SelectedOnMap from "./components/SelectedMaps";
// import MapScreen from "./screens/MapScreen";

Colors.loadColors({
  primary: "#00bfff",
  secondary: "#d9d9d9",
  mainbg: "#f5f6fa",
  sidebg: "#ffffff",
  $textWhite: "#ffffff",
  $textPrimary: "#00bfff",
});

const GooglePlacesInput = ({ location, onPress }) => {
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
      minLength={5}
      enablePoweredByContainer={false}
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
        radius: 10000,
        location: `${location?.latitude},${location?.longitude}`,
      }}
    />
  );
};

export function MapScreen({ route, navigation }) {
  const screenWidth = Dimensions.get("window").width || 400;
  const [region, setRegion] = useState({
    latitude: -1,
    longitude: 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [places, setPlaces] = useState([]);
  const [radius, setRadius] = useState(500);
  const [isShowFullTimeOfWeek, setIsShowFullTimeOfWeek] = useState(false);
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDialog, setLoadingDialog] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const {
    currentUser,
    locationMove,
    moveNewLocation,
    updateUser,
    updateLocationMove,
    favorites,
    fetchFavorites,
  } = useContext(AuthContext);
  const isFocused = useIsFocused();

  const mapRef = useRef(null);
  const [viewLocation, setViewLocation] = useState({
    latitude: 0,
    longitude: 0,
  });
  const selectedMove = route?.params?.selectedMove;

  useEffect(() => {
    if (!currentUser) {
      console.log("User is not logged in");
      navigation.navigate("LoginScreen");
    } else {
      (async () => {
        await handleCurrent(true);
      })();
    }
  }, [currentUser]);

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
          viewLocation.latitude,
          viewLocation.longitude,
          0.5
        );
        console.log("nearbyLots", nearbyLots);

        console.log("Loadinggg");
        const apiKey = GOOGLE_MAPS_API_KEY; // Replace with your Google Maps API key
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${viewLocation.latitude},${viewLocation.longitude}&radius=${radius}&type=parking&key=${apiKey}`
        );
        const result = await response.json();

        setPlaces([...result.results, ...nearbyLots]);
        console.log("result", result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (viewLocation) {
      // initData();
    }
  }, [radius, viewLocation, reload]);

  const getPlaceDetail = async function (place_id) {
    console.log("screenWidth", screenWidth);
    try {

      if(Number.isInteger(+place_id)){
        return {};
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=formatted_phone_number,price_level,opening_hours&language=vi&key=${GOOGLE_MAPS_API_KEY}`
      );

      const result = await response.json();
      return result?.result;
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkerPress = async (place) => {
    if (locationMove?.status === "moving") {
      if (
        locationMove?.parking_id &&
        locationMove?.parking_id === place?.parking_id
      )
        return;

      Alert.alert(
        "Thông báo",
        "Bạn đang di chuyển đến bãi đỗ xe khác, hãy đến bãi đỗ xe này trước khi chọn bãi đỗ xe khác"
      );
      return;
    }

    if (place?.parking_id && place?.status === "moving") {
      moveNewLocation(place);
      const isNewMarker = places.every((p) => p.place_id !== place?.place_id);
      if (isNewMarker) {
        setPlaces((prev) => [...prev, place]);
      }

      return;
    }

    const coordinate = {
      latitude: place?.geometry?.location?.lat,
      longitude: place?.geometry?.location?.lng,
    };

    setLoading(true);

    console.log("typeof", typeof place?.place_id);
    let placeOwner = {};
    if(Number.isInteger(+place?.place_id)){
      const placeDoc = await getDoc(doc(db, "places", place.place_id));
      placeOwner = {
        ...placeDoc.data(),
        geometry: {
          location: {
            lat: placeDoc.data().latitude,
            lng: placeDoc.data().longitude,
          }
        }
      }

    }

    getPlaceDetail(place.place_id)
      .then((response) => {
        setLoading(false);
        setIsVisible(true);
        setLoadingDialog(false);
        moveNewLocation({
          ...coordinate,
          ...place,
          ...response,
          ...placeOwner,
        });
        const isNewMarker = places.every(
          (p) => p.place_id !== selectedMove?.place_id
        );
        if (selectedMove?.place_id && isNewMarker) {
          setPlaces((prev) => [...prev, place]);
        }
      })
      .catch((err) => {
        setLoading(false);
        console.log("err", err);
      });
  };

  function cancelDialog() {
    setIsVisible(false);
    moveNewLocation({});
  }

  useEffect(() => {
    if (selectedMove && isFocused) {
      handleMarkerPress(selectedMove);
    }
  }, [selectedMove, isFocused]);

  const onPressSearch = (data, details) => {
    const latitude = details?.geometry?.location?.lat;
    const longitude = details?.geometry?.location?.lng;

    if (latitude === undefined || longitude === undefined) return;

    mapRef.current.animateCamera({
      zoom: 17,
      center: {
        latitude,
        longitude,
      },
    });

    setViewLocation({
      latitude,
      longitude,
    });
  };

  const handleCurrent = async (isCurrent = false) => {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
      maximumAge: 10000,
      timeout: 5000,
    });

    location.coords.latitude = 10.834593012911455;
    location.coords.longitude = 106.68884075965167;
    // console.log("mapRef.current", mapRef.current);
    const { latitude, longitude } = location.coords;

    mapRef.current.animateCamera({
      zoom: 17,
      center: {
        latitude,
        longitude,
      },
    });

    setViewLocation({
      latitude,
      longitude,
    });

    if (isCurrent) {
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

  const handleSaveHeart = async () => {
    try {
      const place_id = locationMove?.place_id;
      if (!place_id) return;

      const user_id = currentUser?.id;
      if (!user_id) return;

      setLoadingDialog(true);
      const isFavorited = favorites.findIndex(
        (item) => item?.place_id === place_id
      );

      let message = "";
      if (isFavorited === -1) {
        await addDoc(collection(db, "favorites"), {
          user_id: user_id,
          place_id,
          vicinity: locationMove?.vicinity,
          name: locationMove?.name,
          formatted_phone_number: locationMove?.formatted_phone_number,
          weekday_text: locationMove?.opening_hours?.weekday_text,
        });
        message = "Đã thêm vào danh sách yêu thích";
      } else {
        await deleteDoc(doc(db, "favorites", favorites[isFavorited].id));
        message = "Đã xóa khỏi danh sách yêu thích";
      }

      fetchFavorites();
      alert(message);
      setLoadingDialog(false);
    } catch (error) {
      setLoadingDialog(false);
      Alert.alert("Lỗi", "Hệ thống quá tải, thử lại sau!!!");
    }
  };

  const handleMoveToPark = async () => {
    try {
      setLoadingDialog(true);
      const collectionRef = collection(db, "parkings");

      console.log("locationMove", locationMove);
      const newParking = {
        user_id: currentUser?.id,
        place_id: locationMove?.place_id,
        name: locationMove?.name,
        vicinity: locationMove?.vicinity,
        latitude: locationMove?.geometry?.location?.lat,
        longitude: locationMove?.geometry?.location?.lng,
        timeStart: locationMove?.timeStart,
        timeEnd: new Date().getTime(),
        timeFinish: null,
        status: "moving",
      };
      const ref = await addDoc(collectionRef, newParking);

      moveNewLocation({
        parking_id: ref.id,
        ...newParking,
      });
      setLoadingDialog(false);
      setIsVisible(false);
    } catch (error) {
      console.log(error);
      Alert.alert("Lỗi", "Hệ thống quá tải, thử lại sau!!!");
      setLoadingDialog(false);
    }
  };

  const handleFinishPark = async () => {
    try {
      setLoadingDialog(true);
      const docRef = doc(db, "parkings", locationMove?.parking_id);

      await updateDoc(docRef, {
        timeEnd: new Date().getTime(),
        status: "parking",
      });

      Alert.alert("Thông báo", "Đã đỗ xe tại đây");
      setLoadingDialog(false);
      setIsVisible(false);
      moveNewLocation({});
    } catch (error) {
      Alert.alert("Lỗi", "Hệ thống quá tải, thử lại sau!!!");
      setLoadingDialog(false);
    }
  };

  const handleCancelPark = async () => {
    try {
      setLoadingDialog(true);
      const docRef = doc(db, "parkings", locationMove?.parking_id);

      await updateDoc(docRef, {
        timeEnd: new Date().getTime(),
        status: "cancel",
      });

      alert("Đã hủy xe thành công");
      moveNewLocation({});
      setLoadingDialog(false);
    } catch (error) {
      Alert.alert("Lỗi", "Hệ thống quá tải, thử lại sau!!!");
      setLoadingDialog(false);
    }
  };

  const handleReload = async () => {
    setReload((prv) => !prv);
  };

  const handeOpenListPark = async () => {
    navigation.navigate("ListParkScreen", {
      viewLocation,
    });
  };

  const renderTime = (weekday_text) => {
    if (!weekday_text) return "Chưa có thông tin";

    const times = weekday_text.map((time) => {
      const [day, timeRange] = time.split(": ");
      return (
        <View row marginT-3 key={day}>
          <Text text80B style={{ width: 100 }}>
            {day}:
          </Text>
          <Text text80R>{timeRange}</Text>
        </View>
      );
    });

    const dayOfWeek = new Date().getDay();
    const today = weekday_text[dayOfWeek] + " (Hôm nay)";

    return (
      <View>
        <Popover
          from={
            <TouchableOpacity style={{ position: "relative", top: 4 }}>
              <Text text80R>{today}</Text>
            </TouchableOpacity>
          }
        >
          <View padding-10 width={250}>
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
          height: 80,
          paddingTop: 40,
          backgroundColor: Colors.primary,
        }}
      >
        <View row spread paddingH-10>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Bars3Icon color={Colors.$textWhite} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setReload(!reload)}>
            <Text text60 $textWhite>
              Parking
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("ListParkedScreen")}
            style={{ position: "relative", top: -5 }}
          >
            <Image
              width={30}
              source={require("./assets/parked-car-white.png")}
            />
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
          <GooglePlacesInput onPress={onPressSearch} location={viewLocation} />
        </View>
      </View>
      <View
        style={{
          width: "100%",
          position: "relative",
          top: 80,
          zIndex: 9,
        }}
      >
        <ScrollView horizontal={true} style={{}}>
          {places?.slice(0, 5).map((place, idx) => (
            <TouchableOpacity
              style={{ borderRadius: 18 }}
              marginL-10
              paddingH-10
              paddingV-10
              backgroundColor={Colors.$textWhite}
              key={place?.place_id + idx || idx}
            >
              <TouchableOpacity onPress={() => handleMarkerPress(place)}>
                <Text>{place?.name}</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <SafeAreaView
        style={{
          width: "100%",
          flex: 1,
          height: Dimensions.get("window").height,
        }}
      >
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
            showsTraffic={false}
            userLocationPriority="high"
          >
            {locationMove?.status === "moving" ? (
              <MapViewDirections
                origin={region}
                destination={locationMove}
                apikey={GOOGLE_MAPS_API_KEY}
                strokeWidth={5}
                strokeColor="#3399ff"
              />
            ) : null}
            {places.map((place, index) => (
              <Marker
                key={index}
                onPress={(e) => handleMarkerPress(place)}
                coordinate={{
                  latitude: place?.geometry?.location?.lat || place?.latitude,
                  longitude: place?.geometry?.location?.lng || place?.longitude,
                }}
                title={place.name}
                description={place.vicinity}
                icon={
                  place?.business_status === "OPERATIONAL"
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
        {locationMove?.status === "moving" ? null : (
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
        )}
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
        {locationMove?.status === "moving" ? (
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              minHeight: 150,
              borderTopWidth: 1,
              borderTopColor: Colors.$textWhite,
              backgroundColor: Colors.$textWhite,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingBottom: 20,
            }}
          >
            <View gap-5 paddingH-10 paddingV-10>
              <View row>
                <Text text80R>Điểm đến: </Text>
                <Text text80R>{locationMove?.name}</Text>
              </View>
              <View row>
                <Text text80R>Địa chỉ: </Text>
                <Text text80R style={{ width: "70%" }}>
                  {locationMove?.vicinity}
                </Text>
              </View>
            </View>
            <View
              style={{ height: 1, backgroundColor: Colors.$iconDisabled }}
            />
            <View row gap-10>
              <Button
                marginT-20
                marginL-10
                style={{
                  width: 70,
                }}
                label="Hủy"
                labelStyle={{ color: Colors.$textDanger }}
                backgroundColor={Colors.$backgroundDangerLight}
                onPress={handleCancelPark}
              />
              <Button
                style={{
                  paddingHorizontal: 20,
                  width: 250,
                }}
                marginT-20
                label="Đỗ xe tại đây"
                backgroundColor={Colors.primary}
                onPress={handleFinishPark}
              />
            </View>
          </View>
        ) : (
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
        )}
      </SafeAreaView>
      <Loading isVisible={loading} text="Loading" />
      <Dialog
        visible={isVisible}
        onDismiss={cancelDialog}
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
        <View row center>
          {locationMove?.photos?.length > 0 ? (
            <Image
              width={screenWidth - 40}
              height={150}
              source={{
                uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${500}&photo_reference=${
                  locationMove?.photos[0]?.photo_reference
                }&key=${GOOGLE_MAPS_API_KEY}`,
              }}
            />
          ) : (
            <Image
              width={screenWidth - 40}
              style={{ objectFit: "cover", borderRadius: 10 }}
              height={150}
              source={require("./assets/default-parking.png")}
            />
          )}
        </View>

        <Text text60 marginT-10>
          Đỗ xe tại {locationMove?.name || "Chưa xác định"}
        </Text>
        <View row centerV marginT-10 gap-5>
          <StarIcon color={Colors.$outlineWarning} />
          <Text text80R>
            Đánh giá: {locationMove?.rating || "0"} sao | (
            {locationMove.user_ratings_total} người)
          </Text>
        </View>
        <View row centerV marginT-10 gap-5 paddingR-20>
          <MapPinIcon color={Colors.$backgroundDangerHeavy} />
          <Text text80R>Địa chỉ: {locationMove?.vicinity || "Trống"} </Text>
        </View>
        <View row centerV marginT-10 gap-5>
          {locationMove?.opening_hours?.open_now ? (
            <LockOpenIcon color={Colors.$iconSuccess} />
          ) : (
            <LockClosedIcon color={Colors.$iconDanger} />
          )}
          <Text text80R>
            Trạng thái:{" "}
            {locationMove?.opening_hours?.open_now ? "Mở cửa" : "Đóng cửa"}
          </Text>
          <View row centerV marginL-10 gap-5>
            <RectangleStackIcon
              color={
                locationMove?.occupied < locationMove?.total
                  ? Colors.primary
                  : Colors.$iconDanger
              }
            />
            <Text text80BL>
              Đã đỗ:{" "}
              {locationMove?.occupied ? (
                <>
                  <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                    {locationMove?.occupied} / {locationMove?.total || ""}
                  </Text>
                 {" "} chổ
                </>
              ) : (
                "Chưa đăng ký"
              )}
            </Text>
          </View>
        </View>
        <View row centerV marginT-10 gap-5>
          <ClockIcon color={Colors.$textNeutralHeavy} />
          <Text text80R>
            Thời gian: {renderTime(locationMove?.opening_hours?.weekday_text)}
          </Text>
        </View>
        <View row centerV marginT-10 gap-5>
          <PhoneIcon color={Colors.$outlinePrimary} />
          <TouchableOpacity
            onPress={() =>
              locationMove?.formatted_phone_number &&
              Linking.openURL(`tel:${locationMove?.formatted_phone_number}`)
            }
          >
            <Text text80R>
              SĐT: {locationMove?.formatted_phone_number || "Trống"}
            </Text>
          </TouchableOpacity>
        </View>
        <View
          row
          style={{
            position: "absolute",
            bottom: 15,
            width: "100%",
            marginHorizontal: 20,
            borderRadius: 999,
          }}
          center
          spread
          gap-10
        >
          <Button
            backgroundColor={Colors.$backgroundGeneralLight}
            onPress={handleSaveHeart}
            style={{
              width: 30,
              paddingHorizontal: 5,
            }}
          >
            {favorites.findIndex(
              (item) => item?.place_id === locationMove?.place_id
            ) !== -1 ? (
              <HeartIconS color={Colors.$textDanger} />
            ) : (
              <HeartIcon color={Colors.black} />
            )}
          </Button>
          <Button
            style={{
              width: "80%",
            }}
            label="Đến bãi đỗ xe"
            backgroundColor={Colors.primary}
            onPress={handleMoveToPark}
          />
        </View>
        <Loading isVisible={loadingDialog} />
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
  const [locationMove, setLocationMove] = useState({});
  const [favorites, setFavorites] = useState([]);

  async function fetchFavorites(user_id = currentUser?.id) {
    const q = query(
      collection(db, "favorites"),
      where("user_id", "==", user_id)
    );
    const querySnapshot = await getDocs(q);
    const data = [];
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
      data.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    setFavorites(data);
  }

  function fetchUser(user_id) {
    getDoc(doc(db, "users", user_id)).then((doc) => {
      if (doc.exists()) {
        const user = doc.data();

        if (user?.status === "active") {
          setCurrentUser({
            id: doc.id,
            ...user,
          });
          fetchFavorites(doc.id);
        }
      } else {
        alert("Tài khoản không tồn tại");
      }
      setPending(false);
    });
  }

  function updateUser(field, data) {
    const user = currentUser;
    user[field] = data;
    setCurrentUser(user);
  }

  function updateLocationMove(field, data) {
    const newData = locationMove;
    newData[field] = data;
    setLocationMove(newData);
  }

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (!user) {
        setCurrentUser(null);
        setPending(false);
        return;
      }
      fetchUser(user?.uid);
    });
  }, []);

  if (pending) {
    return <Loading isVisible={pending} text="Loading" />;
  }

  function moveNewLocation(location) {
    setLocationMove({
      ...location,
      timeStart: new Date().getTime(),
    });
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        locationMove,
        moveNewLocation,
        fetchUser,
        updateUser,
        updateLocationMove,
        favorites,
        fetchFavorites,
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

const LogoutScreen = ({ route, navigation }) => {
  const isFocused = useIsFocused();

  const handleLogout = () => {
    console.log("Logout page");
    auth.signOut().then(() => {
      navigation.navigate("LoginScreen");
    });
  };

  useEffect(() => {
    if (isFocused) {
      handleLogout();
    }
  }, [isFocused]);

  return (
    <View flex center>
      <Loading isVisible={true} text="Đăng xuất" />
    </View>
  );
};

const DrawerNavigator = ({ navigation }) => {
  const { currentUser } = useContext(AuthContext);
  const cur = currentUser ? currentUser.email : "no user";
  const navigate = useNavigation();

  const renderDrawer = () => {
    if (currentUser?.role === "user") {
      return (
        <>
          <Drawer.Screen
            name="ListParkedScreen"
            component={ListParkedScreen}
            options={{
              drawerLabel: "Lịch sử",
              title: "Lịch sử Bãi đỗ xe",
              headerStyle: {
                backgroundColor: Colors.primary,
              },
              headerLeftContainerStyle: {
                paddingLeft: 10,
              },
              drawerIcon: ({ color }) => (
                <IconView>
                  <Image
                    width={20}
                    source={require("./assets/parked-car.png")}
                  />
                </IconView>
              ),
              headerLeft: () => (
                <TouchableOpacity onPress={() => navigate.goBack()}>
                  <ChevronLeftIcon color={Colors.white} />
                </TouchableOpacity>
              ),
              headerTitleAlign: "center",
              headerTitleStyle: {
                color: Colors.white,
              },
              drawerActiveBackgroundColor: Colors.primary,
            }}
          />
          <Drawer.Screen
            name="ListHeartScreen"
            component={ListHeartScreen}
            options={{
              drawerLabel: "Yêu thích",
              title: "Bãi đỗ xe yêu thích",
              headerStyle: {
                backgroundColor: Colors.primary,
              },
              headerLeftContainerStyle: {
                paddingLeft: 10,
              },
              drawerIcon: ({ color }) => (
                <IconView>
                  <HeartIconS color={Colors.primary} />
                </IconView>
              ),
              headerLeft: () => (
                <TouchableOpacity onPress={() => navigate.goBack()}>
                  <ChevronLeftIcon color={Colors.white} />
                </TouchableOpacity>
              ),
              headerTitleAlign: "center",
              headerTitleStyle: {
                color: Colors.white,
              },
              drawerActiveBackgroundColor: Colors.primary,
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
        </>
      );
    }

    return null;
  };
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
      {renderDrawer()}
      <Drawer.Screen
        name="LogoutScreen"
        component={LogoutScreen}
        options={{
          drawerLabel: "Đăng xuất",
          headerShown: false,
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

export const HomeScreen = ({ route, navigation }) => {
  const { currentUser } = useContext(AuthContext);
  const { name } = route;
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused && currentUser?.status === "active") {
      console.log("currentUser?.role", currentUser?.role);
      if (name !== "admin" && currentUser?.role === "admin") {
        navigation.navigate("AdminScreen");
      } else if (name !== "owner" && currentUser?.role === "owner") {
        navigation.navigate("OwnerScreen");
      } else if (name !== "user" && currentUser?.role === "user") {
        navigation.navigate("MapScreen");
      }
    }
  }, [currentUser]);
  return (
    <Stack.Navigator initialRouteName="LoginScreen">
      <Stack.Screen
        options={{
          title: "Danh sách người dùng",
          headerTitleAlign: "center",
          headerLeftContainerStyle: {
            paddingLeft: 10,
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Bars3Icon color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
        name="AdminScreen"
        component={AdminScreen}
      />
      <Stack.Screen
        options={{
          title: "Bãi đỗ xe",
          headerTitleAlign: "center",
          headerLeftContainerStyle: {
            paddingLeft: 10,
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Bars3Icon color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
        name="OwnerScreen"
        component={OwnerScreen}
      />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name="SelectMap"
        component={SelectedOnMap}
      />
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
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Danh sách bãi đỗ xe",
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerLeftContainerStyle: {
            paddingLeft: 10,
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronLeftIcon color={Colors.white} />
            </TouchableOpacity>
          ),
          headerTitleAlign: "center",
          headerTitleStyle: {
            color: Colors.white,
          },
        }}
        name="ListParkScreen"
        component={ListParkScreen}
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
