// AdminScreen.js
import { query, update } from "firebase/database";
import React, { useState, useEffect } from "react";
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  CheckCircleIcon,
  PauseCircleIcon,
  StopCircleIcon,
} from "react-native-heroicons/solid";
import { Button, Colors, Text, View } from "react-native-ui-lib";
import { db } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  UsersIcon,
} from "react-native-heroicons/outline";
import Loading from "./Loading";
import { useIsFocused } from "@react-navigation/core";

const AdminScreen = () => {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("owner");
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();

  async function fetchUsers() {
    setUsers([]);
    setLoading(true);
    const q = query(
      collection(db, "users"),
      where("role", "==", role),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const data = [];
    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data());
      data.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    setUsers(data);
    setLoading(false);
  }

  const changeUserStatus = async (userId, newStatus) => {
    setLoading(true);
    const docRef = doc(db, "users", userId);

    await updateDoc(docRef, {
      status: newStatus,
    });
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );
    setLoading(false);
  };

  useEffect(() => {
    if (isFocused) {
      fetchUsers();
    }
  }, [role, isFocused]);

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Loading isVisible={loading} text="Loading" />
      <View row centerV gap-20 marginB-20>
        <Text text60R>Lọc: </Text>
        <TouchableOpacity
          onPress={() => setRole("owner")}
          style={{
            width: 100,
            padding: 5,
            borderRadius: 12,
            alignItems: "center",
            backgroundColor:
              role === "owner" ? Colors.primary : Colors.$textDisabled,
          }}
        >
          <BuildingOfficeIcon color={Colors.white} size={24} />
          <Text text70R color={Colors.white}>
            Chủ bãi xe
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setRole("user")}
          style={{
            width: 100,
            padding: 5,
            borderRadius: 12,
            alignItems: "center",
            backgroundColor:
              role === "user" ? Colors.primary : Colors.$textDisabled,
          }}
        >
          <UsersIcon color={Colors.white} size={24} />
          <Text text70R color={Colors.white}>
            Người dùng
          </Text>
        </TouchableOpacity>
      </View>
      <View row centerV spread>
        <View>
          <Text text70BO>Thông tin</Text>
        </View>

        <View row center-V style={{ width: 150 }}>
          <Text text70BO marginR-20>
            Trạng thái
          </Text>
          <Text text70BO marginL-10 style={{ width: 50 }}>
            Xử lý
          </Text>
        </View>
      </View>
      <View
        style={{
          width: "100%",
          height: 1,
          backgroundColor: "#ccc",
          marginVertical: 12,
        }}
      />
      <ScrollView>
        {users.map((item, index) => (
          <View key={item.email + index} row centerV spread marginT-10 paddingB-10 style={{borderBottomColor: '#ccc', borderBottomWidth: 1}}>
            <View style={{ maxWidth: 150 }}>
              <Text text80R>{item.email}</Text>
              {item.role === "owner" ? (
                <>
                  <Text text80BL style={{ fontWeight: "bold" }}>
                    {item?.place_name}
                  </Text>
                  <Text numberOfLines={3} text90R color={Colors.$iconDisabled}>
                    {item?.place_vicinity}
                  </Text>
                </>
              ) : (
                <Text text90R>{item.displayName || "Chưa đặt tên"}</Text>
              )}
            </View>

            <View row centerV gap-20 style={{ width: 150 }}>
              <View
                center
                style={{
                  width: 80,
                  padding: 2,
                  borderRadius: 24,
                  backgroundColor:
                    item.status === "active"
                      ? Colors.primary
                      : Colors.$iconDanger,
                }}
              >
                <Text
                  text90R
                  style={{
                    color: Colors.white,
                  }}
                >
                  {item.status == "active" ? "Hoạt động" : "Chờ duyệt"}
                </Text>
              </View>

              <Button
                style={{ width: 40, height: 40 }}
                backgroundColor={
                  item.status === "active" ? Colors.$iconDanger : Colors.primary
                }
                iconSource={() =>
                  item.status === "deactive" ? (
                    <CheckCircleIcon color={Colors.white} />
                  ) : (
                    <StopCircleIcon color={Colors.white} />
                  )
                }
                onPress={() =>
                  changeUserStatus(
                    item.id,
                    item.status === "active" ? "deactive" : "active"
                  )
                }
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminScreen;
