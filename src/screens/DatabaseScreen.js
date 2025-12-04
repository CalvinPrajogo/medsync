import React, { useState, useEffect } from "react";
import {
   View,
   Text,
   StyleSheet,
   StatusBar,
   FlatList,
   TouchableOpacity,
   TextInput,
   Alert,
   Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MedicineCard from "../components/MedicineCard";
import TimingModal from "../components/TimingModal";
import Toast from "../components/Toast";
import { useSchedule } from "../context/ScheduleContext";
import NotificationScheduler from "../services/NotificationScheduler";
import * as Notifications from 'expo-notifications';





const DatabaseScreen = ({ navigation }) => {
   const [searchQuery, setSearchQuery] = useState("");
   const [timingModalVisible, setTimingModalVisible] = useState(false);
   const [selectedMedicine, setSelectedMedicine] = useState(null);
   const [toastVisible, setToastVisible] = useState(false);
   const [toastMessage, setToastMessage] = useState("");
   const { addToSchedule } = useSchedule();


   useEffect(() => {
       registerForPushNotifications();
   }, []);


   const registerForPushNotifications = async () => {
       try {
           const { status: existingStatus } = await Notifications.getPermissionsAsync();
           let finalStatus = existingStatus;


           if (existingStatus !== "granted") {
               const { status } = await Notifications.requestPermissionsAsync();
               finalStatus = status;
           }


           if (finalStatus !== "granted") {
               Alert.alert(
                   "Notifications Disabled",
                   "Please enable notifications in settings to receive medication reminders.",
                   [{ text: "OK" }]
               );
               return;
           }


           if (Platform.OS === "android") {
               await Notifications.setNotificationChannelAsync("medication-reminders", {
                   name: "Medication Reminders",
                   importance: Notifications.AndroidImportance.MAX,
                   vibrationPattern: [0, 250, 250, 250],
                   lightColor: COLORS.primary,
                   sound: true,
                   enableVibrate: true,
                   showBadge: true,
               });
           }
       } catch (error) {
       }
   };



    // Test medication data
    const medicines = [
        {
            id: 1,
            name: "Aspirin",
            dosage: "325mg - Take 1-2 tablets every 4-6 hours",
            ingredients: "Acetylsalicylic acid (ASA), Corn starch, Hypromellose",
            instructions: "Take with food or milk to reduce stomach irritation. Do not exceed 4g per day. Avoid if allergic to salicylates.",
            additionalInfo: "Used for pain relief, fever reduction, and anti-inflammatory purposes. Consult doctor before use if pregnant.",
            images: [
                "https://upload.wikimedia.org/wikipedia/commons/3/3b/Aspirin_tablets.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/5/5b/Aspirin_500mg_tablets.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Aspirin_tablets.jpg/800px-Aspirin_tablets.jpg",
            ],
        },
        {
            id: 2,
            name: "Ibuprofen",
            dosage: "200mg - Take 1 tablet every 4-6 hours as needed",
            ingredients: "Ibuprofen, Microcrystalline cellulose, Croscarmellose sodium",
            instructions: "Take with food or after meals. Maximum 1200mg per day. Do not use for more than 10 days without consulting a physician.",
            additionalInfo: "Non-steroidal anti-inflammatory drug (NSAID). May cause stomach upset. Not recommended for children under 12.",
            images: [
                "https://upload.wikimedia.org/wikipedia/commons/4/4b/Ibuprofen_400mg_tablets.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/6/6b/Ibuprofen_200mg_tablets.jpg",
            ],
        },
        {
            id: 3,
            name: "Paracetamol",
            dosage: "500mg - Take 1-2 tablets every 4-6 hours",
            ingredients: "Paracetamol (Acetaminophen), Povidone, Stearic acid",
            instructions: "Take with water. Maximum 4g per day for adults. Do not exceed recommended dose.",
            additionalInfo: "Effective for pain and fever. Safe for most people when taken as directed. Avoid alcohol while taking.",
            images: [
                "https://upload.wikimedia.org/wikipedia/commons/8/8e/Paracetamol_500mg_tablets.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/2/2e/Paracetamol_tablets.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Paracetamol_500mg_tablets.jpg/800px-Paracetamol_500mg_tablets.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/1/1b/Paracetamol_syrup.jpg",
            ],
        },
        {
            id: 4,
            name: "Amoxicillin",
            dosage: "500mg - Take 1 capsule three times daily",
            ingredients: "Amoxicillin trihydrate, Gelatin, Magnesium stearate",
            instructions: "Take at evenly spaced intervals. Complete the full course even if you feel better. Take with or without food.",
            additionalInfo: "Antibiotic used to treat bacterial infections. Inform doctor of any allergies. May cause diarrhea.",
            images: [
                "https://upload.wikimedia.org/wikipedia/commons/9/9b/Amoxicillin_capsules.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/3/3f/Amoxicillin_500mg_capsules.jpg",
            ],
        },
        {
            id: 5,
            name: "Lisinopril",
            dosage: "10mg - Take 1 tablet once daily",
            ingredients: "Lisinopril dihydrate, Lactose, Cellulose",
            instructions: "Take at the same time each day with or without food. Monitor blood pressure regularly.",
            additionalInfo: "ACE inhibitor for high blood pressure. May cause dry cough. Avoid potassium supplements unless prescribed.",
            images: [
                "https://upload.wikimedia.org/wikipedia/commons/8/8b/Lisinopril_tablets.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Lisinopril_tablets.jpg/800px-Lisinopril_tablets.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/7/7f/Blood_pressure_medication.jpg",
            ],
        },
        {
            id: 6,
            name: "Metformin",
            dosage: "500mg - Take 1-2 tablets twice daily with meals",
            ingredients: "Metformin hydrochloride, Polyvinylpyrrolidone, Magnesium stearate",
            instructions: "Take with meals to reduce stomach upset. Start with lower dose and increase gradually as directed.",
            additionalInfo: "Used to manage type 2 diabetes. May cause nausea initially. Regular blood sugar monitoring recommended.",
            images: [
                "https://upload.wikimedia.org/wikipedia/commons/5/5e/Metformin_500mg_tablets.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/6/6a/Metformin_850mg_tablets.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Metformin_500mg_tablets.jpg/800px-Metformin_500mg_tablets.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Metformin_850mg_tablets.jpg/800px-Metformin_850mg_tablets.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/d/d9/Metformin_tablets_various.jpg",
            ],
        },
        {
            id: 7,
            name: "Omeprazole",
            dosage: "20mg - Take 1 capsule once daily before breakfast",
            ingredients: "Omeprazole, Gelatin, Titanium dioxide",
            instructions: "Take on an empty stomach 30 minutes before breakfast. Swallow whole, do not crush or chew.",
            additionalInfo: "Proton pump inhibitor used to treat acid reflux and stomach ulcers. May take a few days to show full effect.",
            images: [
                "https://upload.wikimedia.org/wikipedia/commons/9/9b/Omeprazole_capsules.jpg",
                "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop",
            ],
        },
        {
            id: 8,
            name: "Atorvastatin",
            dosage: "20mg - Take 1 tablet once daily with or without food",
            ingredients: "Atorvastatin calcium, Lactose, Microcrystalline cellulose",
            instructions: "Take at the same time each day. May take with or without food. Regular cholesterol monitoring recommended.",
            additionalInfo: "Statin medication used to lower cholesterol. May cause muscle pain. Avoid grapefruit juice.",
            images: [
                "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop",
            ],
        },
        {
            id: 9,
            name: "Levothyroxine",
            dosage: "50mcg - Take 1 tablet on an empty stomach in the morning",
            ingredients: "Levothyroxine sodium, Calcium phosphate, Magnesium stearate",
            instructions: "Take on an empty stomach 30-60 minutes before breakfast. Do not take with calcium or iron supplements.",
            additionalInfo: "Thyroid hormone replacement. Used to treat hypothyroidism. Regular thyroid function tests required.",
            images: [
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop",
            ],
        },
        {
            id: 10,
            name: "Amlodipine",
            dosage: "5mg - Take 1 tablet once daily",
            ingredients: "Amlodipine besylate, Lactose, Sodium starch glycolate",
            instructions: "Take at the same time each day with or without food. May cause dizziness initially.",
            additionalInfo: "Calcium channel blocker for high blood pressure and chest pain. May cause ankle swelling.",
            images: [
                "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop",
            ],
        },
        {
            id: 11,
            name: "Gabapentin",
            dosage: "300mg - Take 1 capsule three times daily",
            ingredients: "Gabapentin, Gelatin, Talc",
            instructions: "Take with food. Do not stop suddenly - reduce gradually. May cause drowsiness.",
            additionalInfo: "Used for nerve pain and seizures. Avoid alcohol. May impair ability to drive.",
            images: [
                "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop",
            ],
        },
        {
            id: 12,
            name: "Sertraline",
            dosage: "50mg - Take 1 tablet once daily",
            ingredients: "Sertraline hydrochloride, Lactose, Hydroxypropyl cellulose",
            instructions: "Take with or without food at the same time each day. May take 4-6 weeks to show full effect.",
            additionalInfo: "SSRI antidepressant. Do not stop abruptly. May cause nausea or insomnia initially.",
            images: [
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop",
            ],
        },
        {
            id: 13,
            name: "Ciprofloxacin",
            dosage: "500mg - Take 1 tablet twice daily",
            ingredients: "Ciprofloxacin hydrochloride, Cellulose, Magnesium stearate",
            instructions: "Take with a full glass of water. Avoid dairy products and antacids 2 hours before or after.",
            additionalInfo: "Antibiotic for bacterial infections. May cause tendon problems. Avoid sun exposure.",
            images: [
                "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop",
            ],
        },
        {
            id: 14,
            name: "Warfarin",
            dosage: "5mg - Take 1 tablet once daily at the same time",
            ingredients: "Warfarin sodium, Lactose, Starch",
            instructions: "Take at the same time each day. Regular blood tests (INR) required. Maintain consistent vitamin K intake.",
            additionalInfo: "Blood thinner to prevent clots. Avoid alcohol. Watch for bleeding signs. Many drug interactions.",
            images: [
                "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop",
            ],
        },
        {
            id: 15,
            name: "Furosemide",
            dosage: "40mg - Take 1-2 tablets once or twice daily",
            ingredients: "Furosemide, Lactose, Corn starch",
            instructions: "Take with or without food. May cause increased urination. Monitor fluid intake and weight.",
            additionalInfo: "Diuretic (water pill) for fluid retention and high blood pressure. May cause low potassium.",
            images: [
                "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop",
            ],
        },
    ];

   // Filter medicines based on search query
   const filteredMedicines = medicines.filter((medicine) => {
       const query = searchQuery.toLowerCase();
       return (
           medicine.name.toLowerCase().includes(query) ||
           medicine.ingredients.toLowerCase().includes(query) ||
           medicine.dosage.toLowerCase().includes(query)
       );
   });


   const handleAddToSchedule = (medicine) => {
       setSelectedMedicine(medicine);
       setTimingModalVisible(true);
   };


  const handleModalClose = () => {
      setTimingModalVisible(false);
      setSelectedMedicine(null);
  };


   const handleConfirmTiming = async (timing) => {
       if (selectedMedicine) {
           addToSchedule(selectedMedicine, timing);
           let totalScheduled = 0;
           try {
               const { frequency, nextDoseDate, doseTimes = [] } = timing || {};

               // Build an rrule string depending on frequency and nextDoseDate
               const buildRRule = (freq) => {
                   if (!freq) return 'FREQ=DAILY;INTERVAL=1';
                   switch (freq) {
                       case 'daily':
                           return 'FREQ=DAILY;INTERVAL=1';
                       case 'every_other_day':
                           return 'FREQ=DAILY;INTERVAL=2';
                       case 'once_week': {
                           const wk = new Date(nextDoseDate).getDay();
                           const byday = ['SU','MO','TU','WE','TH','FR','SA'][wk];
                           return `FREQ=WEEKLY;BYDAY=${byday};INTERVAL=1`;
                       }
                       case 'twice_week': {
                           const base = new Date(nextDoseDate).getDay();
                           const day1 = ['SU','MO','TU','WE','TH','FR','SA'][base];
                           const day2 = ['SU','MO','TU','WE','TH','FR','SA'][(base + 3) % 7];
                           return `FREQ=WEEKLY;BYDAY=${day1},${day2};INTERVAL=1`;
                       }
                       default:
                           return 'FREQ=DAILY;INTERVAL=1';
                   }
               };

               const rruleString = buildRRule(frequency);

               for (let i = 0; i < doseTimes.length; i++) {
                   const doseTime = new Date(doseTimes[i]);
                   const baseDate = new Date(nextDoseDate);
                   const dtstart = new Date(
                       baseDate.getFullYear(),
                       baseDate.getMonth(),
                       baseDate.getDate(),
                       doseTime.getHours(),
                       doseTime.getMinutes(),
                       0,
                       0
                   );

                   const scheduleId = `${selectedMedicine.id}-${i}`;
                   const title = `Time to take ${selectedMedicine.name}`;
                   const body = selectedMedicine.dosage || 'Medication reminder';

                   const ids = await NotificationScheduler.scheduleRecurringNotifications({
                       scheduleId,
                       title,
                       body,
                       dtstartIso: dtstart.toISOString(),
                       timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                       rruleString,
                       occurrences: 10,
                   });

                   totalScheduled += ids.length;
               }
           } catch (err) {
               console.warn('Failed to schedule notifications:', err);
           }

           // Close modal and show confirmation toast
           setTimingModalVisible(false);
           setToastMessage(`${selectedMedicine.name} added to schedule`);
           setToastVisible(true);
           setSelectedMedicine(null);
       }
   };


   const renderMedicineCard = ({ item }) => {
       return (
           <MedicineCard
               medicine={item}
               onPress={() => navigation.navigate("MedicineDetail", { medicine: item })}
               onAdd={() => handleAddToSchedule(item)}
               showAddButton={true}
           />
       );
   };


   return (
       <SafeAreaView style={styles.container}>
           <StatusBar barStyle="dark-content" />


           {/* Header */}
           <View style={styles.header}>
               <View style={styles.headerTop}>
                   <TouchableOpacity
                       style={styles.backButton}
                       onPress={() => navigation.goBack()}
                   >
                       <MaterialCommunityIcons
                           name="arrow-left"
                           size={24}
                           color="#000"
                       />
                   </TouchableOpacity>
               </View>
               <Text style={styles.title}>Medication Database</Text>
               <Text style={styles.subtitle}>
                   Browse and search for medications
               </Text>
           </View>


           {/* Search Bar */}
           <View style={styles.searchContainer}>
               <View style={styles.searchBar}>
                   <MaterialCommunityIcons
                       name="magnify"
                       size={20}
                       color="#666"
                       style={styles.searchIcon}
                   />
                   <TextInput
                       style={styles.searchInput}
                       placeholder="Search medications..."
                       placeholderTextColor="#999"
                       value={searchQuery}
                       onChangeText={setSearchQuery}
                   />
                   {searchQuery.length > 0 && (
                       <TouchableOpacity
                           onPress={() => setSearchQuery("")}
                           style={styles.clearButton}
                       >
                           <MaterialCommunityIcons
                               name="close-circle"
                               size={20}
                               color="#666"
                           />
                       </TouchableOpacity>
                   )}
               </View>
           </View>


           {/* Medicine Cards List */}
           <View style={styles.content}>
               {filteredMedicines.length === 0 ? (
                   <View style={styles.emptyContainer}>
                       <Text style={styles.emptyText}>
                           {searchQuery
                               ? "No medications found matching your search"
                               : "No medications in database yet"}
                       </Text>
                   </View>
               ) : (
                   <FlatList
                       data={filteredMedicines}
                       renderItem={renderMedicineCard}
                       keyExtractor={(item) => `medicine-${item.id}`}
                       numColumns={2}
                       columnWrapperStyle={styles.row}
                       contentContainerStyle={styles.listContent}
                       showsVerticalScrollIndicator={false}
                   />
               )}
           </View>


           {/* Timing Modal */}
           <TimingModal
               visible={timingModalVisible}
               onClose={handleModalClose}
               onConfirm={handleConfirmTiming}
               medicineName={selectedMedicine?.name || ""}
           />


           {/* Toast Notification */}
           <Toast
               message={toastMessage}
               visible={toastVisible}
               onHide={() => setToastVisible(false)}
               type="success"
           />
       </SafeAreaView>
   );
};


const styles = StyleSheet.create({
   container: {
       flex: 1,
       backgroundColor: "#F5F5F7",
   },
   header: {
       paddingHorizontal: SIZES.padding,
       paddingTop: 20,
       paddingBottom: 20,
   },
   headerTop: {
       flexDirection: "row",
       marginBottom: 16,
   },
   backButton: {
       width: 40,
       height: 40,
       borderRadius: 20,
       backgroundColor: COLORS.white,
       justifyContent: "center",
       alignItems: "center",
       shadowColor: "#000",
       shadowOffset: { width: 0, height: 2 },
       shadowOpacity: 0.1,
       shadowRadius: 4,
       elevation: 3,
   },
   title: {
       fontSize: 36,
       fontWeight: "bold",
       color: "#000",
       marginBottom: 8,
   },
   subtitle: {
       fontSize: 16,
       color: "#666",
   },
   searchContainer: {
       paddingHorizontal: SIZES.padding,
       paddingBottom: 16,
   },
   searchBar: {
       flexDirection: "row",
       alignItems: "center",
       backgroundColor: COLORS.white,
       borderRadius: 12,
       paddingHorizontal: 16,
       height: 50,
       shadowColor: "#000",
       shadowOffset: { width: 0, height: 2 },
       shadowOpacity: 0.1,
       shadowRadius: 4,
       elevation: 3,
   },
   searchIcon: {
       marginRight: 12,
   },
   searchInput: {
       flex: 1,
       fontSize: 16,
       color: "#000",
   },
   clearButton: {
       marginLeft: 8,
       padding: 4,
   },
   content: {
       flex: 1,
       paddingHorizontal: SIZES.padding,
   },
   listContent: {
       paddingBottom: 20,
   },
   row: {
       justifyContent: "space-between",
   },
   emptyContainer: {
       flex: 1,
       justifyContent: "center",
       alignItems: "center",
   },
   emptyText: {
       fontSize: 16,
       color: "#999",
       textAlign: "center",
   },
});


export default DatabaseScreen;