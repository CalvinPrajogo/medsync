import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const AddPlan = () => {
  const [pillName, setPillName] = useState("Oxycodone");
  const [pills, setPills] = useState(2);
  const [days, setDays] = useState(30);
  const [foodTiming, setFoodTiming] = useState("after"); // before, with, after
  const [notificationTime, setNotificationTime] = useState("10:00 AM");

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn}>
        <Ionicons name="arrow-back" size={22} color="#3B44F6" />
      </TouchableOpacity>

      <Text style={styles.title}>Add Plan</Text>

      {/* Pill Name */}
      <Text style={styles.label}>Pills name</Text>
      <View style={styles.inputRow}>
        <View style={styles.inputBox}>
          <Ionicons name="medkit-outline" size={18} color="#aaa" />
          <TextInput
            style={styles.inputText}
            value={pillName}
            onChangeText={setPillName}
          />
        </View>
        <TouchableOpacity style={styles.iconSquare}>
          <Ionicons name="scan-outline" size={18} color="#3B44F6" />
        </TouchableOpacity>
      </View>

      {/* Amount & Duration */}
      <Text style={styles.label}>Amount & How long?</Text>
      <View style={styles.row}>
        <View style={styles.smallInputBox}>
          <Ionicons name="apps-outline" size={16} color="#aaa" />
          <Text style={styles.smallText}>{pills} pills</Text>
        </View>
        <View style={styles.smallInputBox}>
          <Ionicons name="calendar-outline" size={16} color="#aaa" />
          <Text style={styles.smallText}>{days} days</Text>
        </View>
      </View>

      {/* Food & Pills */}
      <Text style={styles.label}>Food & Pills</Text>
      <View style={styles.foodRow}>
        <TouchableOpacity
          style={[
            styles.foodBtn,
            foodTiming === "before" && styles.foodBtnActive,
          ]}
          onPress={() => setFoodTiming("before")}
        >
          <Ionicons
            name="restaurant-outline"
            size={22}
            color={foodTiming === "before" ? "#fff" : "#888"}
          />
          <Text
            style={[
              styles.foodText,
              foodTiming === "before" && styles.foodTextActive,
            ]}
          >
            Before
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.foodBtn,
            foodTiming === "with" && styles.foodBtnActive,
          ]}
          onPress={() => setFoodTiming("with")}
        >
          <Ionicons
            name="restaurant-outline"
            size={22}
            color={foodTiming === "with" ? "#fff" : "#888"}
          />
          <Text
            style={[
              styles.foodText,
              foodTiming === "with" && styles.foodTextActive,
            ]}
          >
            With
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.foodBtn,
            foodTiming === "after" && styles.foodBtnActive,
          ]}
          onPress={() => setFoodTiming("after")}
        >
          <Ionicons
            name="restaurant-outline"
            size={22}
            color={foodTiming === "after" ? "#fff" : "#888"}
          />
          <Text
            style={[
              styles.foodText,
              foodTiming === "after" && styles.foodTextActive,
            ]}
          >
            After
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notification */}
      <Text style={styles.label}>Notification</Text>
      <View style={styles.inputRow}>
        <View style={styles.inputBox}>
          <Ionicons name="notifications-outline" size={18} color="#aaa" />
          <Text style={styles.inputText}>{notificationTime}</Text>
        </View>
        <TouchableOpacity style={styles.iconSquare}>
          <Ionicons name="add" size={20} color="#3B44F6" />
        </TouchableOpacity>
      </View>

      {/* Done Button */}
      <TouchableOpacity style={styles.doneBtn}>
        <Text style={styles.doneText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddPlan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 25,
    paddingTop: 60,
  },
  backBtn: {
    borderWidth: 2,
    borderColor: "#3B44F6",
    borderRadius: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  inputBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  inputText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  iconSquare: {
    marginLeft: 10,
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F2F0FF",
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  smallInputBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  smallText: {
    marginLeft: 8,
    color: "#333",
    fontSize: 14,
  },
  foodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  foodBtn: {
    flex: 1,
    backgroundColor: "#eee",
    borderRadius: 16,
    paddingVertical: 18,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  foodBtnActive: {
    backgroundColor: "#6A4FF7",
  },
  foodText: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    fontWeight: "500",
  },
  foodTextActive: {
    color: "#fff",
  },
  doneBtn: {
    backgroundColor: "#6A4FF7",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 25,
  },
  doneText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
});
