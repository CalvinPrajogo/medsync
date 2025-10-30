import React, {useState} from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const mockMedications = [
  {
    id: "1",
    condition: "Blood Pressure",
    medicine: "Telma 20mg",
    dosage: "2x",
    intake: "After meal",
    color: "#6A4FF7", // purple
  },
  {
    id: "2",
    condition: "Sugar",
    medicine: "Amryl 20mg",
    dosage: "3x",
    intake: "After meal",
    color: "#6A4FF7",
  },
  {
    id: "3",
    condition: "CKD",
    medicine: "Metclot 50mg",
    dosage: "2x",
    intake: "After meal",
    color: "#6A4FF7",
  },
];




const MedicationCard = ({id, condition, medicine, dosage, intake, color, handleDelete}) => {
  return (
    <View style={styles.card}>
      <Text style={[styles.condition, { color }]}>{condition}</Text>
      <Text style={styles.medicine}>{medicine}</Text>
      <Text style={styles.subtext}>Dosage: {dosage}</Text>
      <Text style={styles.subtext}>Intake: {intake}</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: color }]}>
          <Ionicons name="alarm" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: "#4CAF50" }]}>
          <MaterialIcons name="edit" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: "#E53935"}]} onPress={() => handleDelete(id)}>
          <MaterialIcons name="delete" size={18} color="#fff"/>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const PatientScreen = () => {
    const [medications, setMedications] = useState(mockMedications)

    function handleDelete(id){
        setMedications(prev => prev.filter(med => med.id !== id));
    }
    
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>xyz Gairola (Papa)</Text>
          <View style={styles.headerUnderline} />
        </View>

        <TouchableOpacity>
          <Ionicons name="settings-outline" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>62/male</Text>

      {/* Medication List */}
      <FlatList
        data={medications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MedicationCard {...item} handleDelete={() => handleDelete(item.id)}/>}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerUnderline: {
    height: 1,
    backgroundColor: "#6A8E6F",
    width: "60%",
    marginTop: 3,
  },
  subtitle: {
    textAlign: "center",
    color: "#555",
    marginTop: 8,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  condition: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 2,
  },
  medicine: {
    color: "#444",
    fontSize: 14,
    marginBottom: 4,
  },
  subtext: {
    fontSize: 13,
    color: "#555",
  },
  actions: {
    flexDirection: "row",
    marginTop: 10,
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PatientScreen;
