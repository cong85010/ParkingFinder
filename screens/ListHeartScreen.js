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
  ClockIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  XCircleIcon,
} from "react-native-heroicons/solid";
import { radiusOptions } from "../contanst";
import Popover from "react-native-popover-view";
import { Placement } from "react-native-popover-view/dist/Types";
import { PhoneIcon } from "react-native-heroicons/outline";

const ListHeartScreen = ({ navigation }) => {
  const [radius, setRadius] = useState(500);
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const inputSearchRef = useRef(null);
  const { favorites, fetchFavorites } = useContext(AuthContext);
  const [inputSearch, setInputSearch] = useState("");

  function clearInput() {
    setInputSearch("");
  }

  const handleSubmitEditing = ({
    nativeEvent: { text, eventCount, target },
  }) => {
    setReload(!reload);
  };

  const renderTime = (weekday_text) => {
    if (!weekday_text) return "Chưa có thông tin";

    const times = weekday_text.map((time) => {
      const [day, timeRange] = time.split(": ");
      return (
        <View row marginT-3 key={day}>
          <Text text80B style={{ width: 75 }}>
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
          <View padding-10 width={200}>
            {times}
          </View>
        </Popover>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 10 }}>
      {/* <View row centerV marginB-10 gap-10 spread>
        <TouchableOpacity
          style={{ backgroundColor: "#FFF", padding: 10, borderRadius: 999 }}
          onPress={handleSubmitEditing}
        >
          <MagnifyingGlassIcon color={Colors.primary} />
        </TouchableOpacity>
      </View> */}
      {loading && (
        <View center flex>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
      <ScrollView>
        {favorites.map((place, idx) => (
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
              <View
                paddingV-5
                borderWidth-1
                borderColor={Colors.$iconDisabled}
                gap-5
              >
                <View row>
                  <PhoneIcon width={20} color={Colors.$textNeutralHeavy} />
                  <Text>: {place?.formatted_phone_number}</Text>
                </View>
                <View row >
                  <ClockIcon width={20} color={Colors.$textNeutralHeavy} />
                  <Text text80R>
                    : {renderTime(place?.weekday_text)}
                  </Text>
                </View>
              </View>
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

export default ListHeartScreen;
