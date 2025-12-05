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
import { medicines } from "../data/medicinesDatabase";





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


    const handleConfirmTiming = async (timing, inventory) => {
        if (selectedMedicine) {
            addToSchedule(selectedMedicine, timing, inventory);
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