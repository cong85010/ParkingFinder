import React from "react";
import { ScrollView } from "react-native";
import { View, Text, Card } from "react-native-ui-lib";

const ListParkScreen = ({places}) => {
  const notifications = [
    {
      id: 1,
      title: "Bãi đỗ xe mới",
      message: "Có bãi đỗ xe mới gần bạn, hãy tìm hiểu ngay!",
      timestamp: new Date(),
    },
    {
      id: 2,
      title: "Hãy thêm bãi đỗ xe yêu thích",
      message: "Thêm bãi đỗ xe yêu thích để dễ dàng tìm kiếm hơn!",
      timestamp: new Date(),
    },
    // Add more notifications as needed
  ];

  return (
    <ScrollView style={{ flex: 1, padding: 10 }}>
      {places.map((place, idx) => (
        <Card
          key={place.place_id || idx}
          borderRadius={12}
          marginB-16
          padding-16
          style={styles.card}
        >
          <Text text70R style={styles.notificationTitle}>
            {place.name}
          </Text>
          <Text text90R style={styles.notificationMessage}>
            {notification.message}
          </Text>
          <Text text90R grey40>
            {place.timestamp.toDateString()}
          </Text>
        </Card>
      ))}
    </ScrollView>
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
  },
  notificationTitle: {
    marginBottom: 8,
  },
  notificationMessage: {
    marginBottom: 4,
  },
};

export default ListParkScreen;
