import React from "react";
import { ScrollView } from "react-native";
import { View, Text, Card } from "react-native-ui-lib";

const NotificationsScreen = () => {
  const notifications = [
    {
      id: 1,
      title: "New Message",
      message: "You have a new message from John Doe.",
      timestamp: new Date(),
    },
    {
      id: 2,
      title: "Reminder",
      message: "Don't forget to complete your task today!",
      timestamp: new Date(),
    },
    // Add more notifications as needed
  ];

  return (
    <ScrollView style={{ flex: 1, padding: 10 }}>
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          borderRadius={12}
          marginB-16
          padding-16
          style={styles.card}
        >
          <Text text60R style={styles.notificationTitle}>
            {notification.title}
          </Text>
          <Text text70 style={styles.notificationMessage}>
            {notification.message}
          </Text>
          <Text text80 grey40>
            {notification.timestamp.toDateString()}
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

export default NotificationsScreen;
