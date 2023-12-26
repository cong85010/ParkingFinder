import React, { useState } from "react";
import { Modal, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { XCircleIcon } from "react-native-heroicons/solid";
import { Button, Colors, Text, View } from "react-native-ui-lib";

const ScheduleComponent = ({ visible, onDismiss, schedule = [], onSelected }) => {
  const [editMode, setEditMode] = useState(false);

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const updateSchedule = (dayIndex, type, value) => {
    const updatedSchedule = schedule?.map((item, index) => {
      if (index === dayIndex) {
        return { ...item, [type]: value };
      }
      return item;
    });
    onSelected(updatedSchedule);
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      style={{
        flex: 1,
        width: "100%",
      }}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalStyle}>
        <View style={styles.modalStyleContainer}>
          <View style={styles.container}>
            <View row spread paddingH-10>
              <Text text50R marginB-10>
                Thời gian bãi xe
              </Text>
              <View row centerV gap-20>
                <TouchableOpacity onPress={handleEditToggle}>
                  <Text style={styles.editToggle}>
                    {editMode ? "Done" : "Edit"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onDismiss}>
                  <XCircleIcon
                    color={Colors.$backgroundDark}
                    style={{ width: 30, height: 30 }}
                  />
                </TouchableOpacity>
              </View>
            </View>
            {schedule.map((item, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.day}>{item.day}:</Text>
                {editMode ? (
                  <View style={styles.editableRow}>
                    <TextInput
                      style={styles.input}
                      onChangeText={(text) =>
                        updateSchedule(index, "open", text)
                      }
                      value={item.open}
                    />
                    <Text> - </Text>
                    <TextInput
                      style={styles.input}
                      onChangeText={(text) =>
                        updateSchedule(index, "close", text)
                      }
                      value={item.close}
                    />
                  </View>
                ) : (
                  <Text style={styles.hours}>
                    {item.open} - {item.close}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  modalStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000061",
  },
  modalStyleContainer: {
    marginHorizontal: 20,
    width: "100%",
    height: 400,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  day: {
    fontWeight: "bold",
  },
  hours: {
    color: "#000",
  },
  editableRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#ddd",
    padding: 5,
    marginHorizontal: 2,
    width: 70,
  },
  editToggle: {
    alignSelf: "flex-end",
    padding: 5,
    fontSize: 16,
    color: Colors.primary,
  },
});

export default ScheduleComponent;
