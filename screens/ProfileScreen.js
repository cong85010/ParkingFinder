import React, { useContext } from "react";
import { View, Text, Image, Button, Colors } from "react-native-ui-lib";
import { AuthContext } from "../context";

const ProfileScreen = () => {
  const { currentUser: user } = useContext(AuthContext);

  return (
    <View flex center>
      {user?.photoURL ? (
        <Image source={{ uri: user?.photoURL }} style={styles.profileImage} />
      ) : (
        <Image
          source={require("../assets/user-default.png")}
          style={styles.profileImage}
        />
      )}

      <Text text40>@{user?.displayName ? user.displayName : "Username trống"}</Text>
      <Text text60>{user?.email ? user.email : "user@example.com"}</Text>
      <Text text60>{user?.phone ? user.phone : "SĐT trống"}</Text>

      {/* <Button
        label="Chỉnh sửa"
        disabled
        backgroundColor={Colors.primary}
        labelStyle={{ fontWeight: "bold" }}
        style={styles.editButton}
        onPress={() => {
          // Add functionality to edit profile here
        }}
      /> */}
      <View style={{ height: 200 }} />
    </View>
  );
};

const styles = {
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  editButton: {
    marginTop: 20,
    width: 200,
  },
};

export default ProfileScreen;
