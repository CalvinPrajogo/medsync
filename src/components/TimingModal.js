import React, { useState, useEffect } from "react";
import {
   View,
   Text,
   StyleSheet,
   Modal,
   TouchableOpacity,
   ScrollView,
   Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants/theme";
import DateTimePicker from "@react-native-community/datetimepicker";


const TimingModal = ({ visible, onClose, onConfirm, medicineName }) => {
    const [step, setStep] = useState(1);
   const [frequency, setFrequency] = useState("daily");
   const [dosesPerDay, setDosesPerDay] = useState(1);
   const [nextDoseDate, setNextDoseDate] = useState(new Date());
   const [showDatePicker, setShowDatePicker] = useState(false);
   const [doseTimes, setDoseTimes] = useState([new Date()]);
   const [showTimePicker, setShowTimePicker] = useState(false);
   const [currentTimeIndex, setCurrentTimeIndex] = useState(0);


   const frequencyOptions = [
       { label: "Daily", value: "daily" },
       { label: "Every Other Day", value: "every_other_day" },
       { label: "Twice a Week", value: "twice_week" },
       { label: "Once a Week", value: "once_week" },
   ];


   const dosesOptions = [1, 2, 3, 4];


   const handleDosesSelect = (value) => {
       setDosesPerDay(value);
       // Initialize dose times array based on number of doses
       const times = Array(value)
           .fill(null)
           .map((_, i) => {
               const time = new Date();
               time.setHours(8 + i * 6, 0, 0, 0);
               return time;
           });
       setDoseTimes(times);
   };


   const handleDateChange = (event, selectedDate) => {
       setShowDatePicker(Platform.OS === "ios");
       if (selectedDate) {
           setNextDoseDate(selectedDate);
       }
   };


   const handleTimeChange = (event, selectedTime) => {
       setShowTimePicker(Platform.OS === "ios");
       if (selectedTime) {
           const newTimes = [...doseTimes];
           newTimes[currentTimeIndex] = selectedTime;
           setDoseTimes(newTimes);
       }
   };


   const handleConfirm = () => {
       const schedule = {
           frequency,
           dosesPerDay,
           nextDoseDate,
           doseTimes,
       };
       onConfirm(schedule);
       setStep(1); // Reset to first step
   };

   const handleClose = () => {
       // Reset internal modal state so next open always starts at step 1
       setStep(1);
       setShowDatePicker(false);
       setShowTimePicker(false);
       setCurrentTimeIndex(0);
       // Optionally reset other values to defaults if desired
       // Call parent's onClose after resetting
       if (typeof onClose === 'function') onClose();
   };

   // When the modal becomes visible, ensure it starts at step 1 and resets temporary state
   useEffect(() => {
       if (visible) {
           setStep(1);
           setShowDatePicker(false);
           setShowTimePicker(false);
           setCurrentTimeIndex(0);
           // reset to defaults so repeated opens are consistent
           setFrequency('daily');
           setDosesPerDay(1);
           setNextDoseDate(new Date());
           setDoseTimes([new Date()]);
       }
   }, [visible]);


   const handleNext = () => {
       if (step < 4) {
           setStep(step + 1);
       } else {
           handleConfirm();
       }
   };


   const handleBack = () => {
       if (step > 1) {
           setStep(step - 1);
       }
   };


   const formatTime = (date) => {
       return date.toLocaleTimeString("en-US", {
           hour: "numeric",
           minute: "2-digit",
           hour12: true,
       });
   };


   const formatDate = (date) => {
       return date.toLocaleDateString("en-US", {
           month: "short",
           day: "numeric",
           year: "numeric",
       });
   };


   const renderStep = () => {
       switch (step) {
           case 1:
               return (
                   <View>
                       <Text style={styles.stepTitle}>
                           How often do you take it?
                       </Text>
                       <View style={styles.optionsContainer}>
                           {frequencyOptions.map((option) => (
                               <TouchableOpacity
                                   key={option.value}
                                   style={[
                                       styles.optionButton,
                                       frequency === option.value &&
                                           styles.optionButtonSelected,
                                   ]}
                                   onPress={() => setFrequency(option.value)}
                               >
                                   <Text
                                       style={[
                                           styles.optionText,
                                           frequency === option.value &&
                                               styles.optionTextSelected,
                                       ]}
                                   >
                                       {option.label}
                                   </Text>
                                   {frequency === option.value && (
                                       <MaterialCommunityIcons
                                           name="check-circle"
                                           size={20}
                                           color={COLORS.primary}
                                       />
                                   )}
                               </TouchableOpacity>
                           ))}
                       </View>
                   </View>
               );


           case 2:
               return (
                   <View>
                       <Text style={styles.stepTitle}>
                           How many times per day?
                       </Text>
                       <View style={styles.optionsContainer}>
                           {dosesOptions.map((num) => (
                               <TouchableOpacity
                                   key={num}
                                   style={[
                                       styles.optionButton,
                                       dosesPerDay === num &&
                                           styles.optionButtonSelected,
                                   ]}
                                   onPress={() => handleDosesSelect(num)}
                               >
                                   <Text
                                       style={[
                                           styles.optionText,
                                           dosesPerDay === num &&
                                               styles.optionTextSelected,
                                       ]}
                                   >
                                       {num} {num === 1 ? "time" : "times"} a
                                       day
                                   </Text>
                                   {dosesPerDay === num && (
                                       <MaterialCommunityIcons
                                           name="check-circle"
                                           size={20}
                                           color={COLORS.primary}
                                       />
                                   )}
                               </TouchableOpacity>
                           ))}
                       </View>
                   </View>
               );


           case 3:
               return (
                   <View>
                   <Text style={styles.stepTitle}>
                       When are you taking your next dose?
                   </Text>
      
                   <TouchableOpacity
                       style={styles.datePickerButton}
                       onPress={() => setShowDatePicker(true)}
                   >
                       <MaterialCommunityIcons
                           name="calendar"
                           size={24}
                           color={COLORS.primary}
                       />
                       <Text style={styles.datePickerText}>
                           {formatDate(nextDoseDate)}
                       </Text>
                   </TouchableOpacity>
      
                   {showDatePicker && (
                       <Modal
                           transparent={true}
                           animationType="fade"
                           visible={showDatePicker}
                           onRequestClose={() => setShowDatePicker(false)}
                       >
                           <View
                               style={{
                                   flex: 1,
                                   justifyContent: "center",
                                   alignItems: "center",
                                   backgroundColor: "rgba(0,0,0,0.5)",
                               }}
                           >
                               <View
                                   style={{
                                       backgroundColor: 'rgba(40, 40, 40)',
                                       borderRadius: 16,
                                       padding: 16,
                                       width: "90%",
                                       elevation: 5,
                                       shadowColor: "#0000",
                                       shadowOffset: { width: 0, height: 2 },
                                       shadowOpacity: .8,
                                       shadowRadius: 3,
                                   }}
                               >
                                   <DateTimePicker
                                       value={nextDoseDate}
                                       mode="date"
                                       display={Platform.OS === "ios" ? "inline" : "calendar"}
                                       onChange={(event, selectedDate) => {
                                           if (Platform.OS === "android") setShowDatePicker(false);
                                           handleDateChange(event, selectedDate);
                                       }}
                                       minimumDate={new Date()}
                                   />
                                   <TouchableOpacity
                                       style={{
                                           marginTop: 12,
                                           alignSelf: "flex-end",
                                           paddingVertical: 8,
                                           paddingHorizontal: 16,
                                           backgroundColor: COLORS.primary,
                                           borderRadius: 8,
                                       }}
                                       onPress={() => setShowDatePicker(false)}
                                   >
                                       <Text
                                           style={{
                                               color: "#fff",
                                               fontWeight: "600",
                                               fontSize: 16,
                                           }}
                                       >
                                           Done
                                       </Text>
                                   </TouchableOpacity>
                               </View>
                           </View>
                       </Modal>
                   )}
               </View>
               );


               case 4:
                   return (
                       <View>
                           <Text style={styles.stepTitle}>
                               What time do you take each dose?
                           </Text>
                           <View style={styles.timeListContainer}>
                               {doseTimes.map((time, index) => (
                                   <View key={index} style={styles.timeRow}>
                                       <Text style={styles.timeLabel}>Dose {index + 1}</Text>
                                       <TouchableOpacity
                                           style={styles.timePickerButton}
                                           onPress={() => {
                                               setCurrentTimeIndex(index);
                                               setShowTimePicker(true);
                                           }}
                                       >
                                           <MaterialCommunityIcons
                                               name="clock-outline"
                                               size={20}
                                               color={COLORS.primary}
                                           />
                                           <Text style={styles.timeText}>
                                               {formatTime(time)}
                                           </Text>
                                       </TouchableOpacity>
                                   </View>
                               ))}
                           </View>
              
                           {showTimePicker && (
                               <Modal
                                   transparent={true}
                                   animationType="fade"
                                   visible={showTimePicker}
                                   onRequestClose={() => setShowTimePicker(false)}
                               >
                                   <View
                                       style={{
                                           flex: 1,
                                           justifyContent: "center",
                                           alignItems: "center",
                                           backgroundColor: "rgba(0,0,0,0.5)",
                                       }}
                                   >
                                       <View
                                           style={{
                                               backgroundColor: 'rgba(40, 40, 40)',
                                               borderRadius: 16,
                                               padding: 16,
                                               width: "90%",
                                               elevation: 5,
                                               shadowColor: "#000",
                                               shadowOffset: { width: 0, height: 2 },
                                               shadowOpacity: 0.8,
                                               shadowRadius: 3,
                                           }}
                                       >
                                           <DateTimePicker
                                               value={doseTimes[currentTimeIndex]}
                                               mode="time"
                                               display={Platform.OS === "ios" ? "spinner" : "default"}
                                               onChange={(event, selectedTime) => {
                                                   if (Platform.OS === "android") setShowTimePicker(false);
                                                   handleTimeChange(event, selectedTime);
                                               }}
                                           />
                                           <TouchableOpacity
                                               style={{
                                                   marginTop: 12,
                                                   alignSelf: "flex-end",
                                                   paddingVertical: 8,
                                                   paddingHorizontal: 16,
                                                   backgroundColor: COLORS.primary,
                                                   borderRadius: 8,
                                               }}
                                               onPress={() => setShowTimePicker(false)}
                                           >
                                               <Text
                                                   style={{
                                                       color: "#fff",
                                                       fontWeight: "600",
                                                       fontSize: 16,
                                                   }}
                                               >
                                                   Done
                                               </Text>
                                           </TouchableOpacity>
                                       </View>
                                   </View>
                               </Modal>
                           )}
                       </View>
                   );


           default:
               return null;
       }
   };


   return (
       <Modal
           visible={visible}
           transparent={true}
           animationType="fade"
           onRequestClose={handleClose}
       >
           <View style={styles.modalOverlay}>
               <View style={styles.modalContent}>
                   <View style={styles.modalHeader}>
                       <Text style={styles.modalTitle}>
                           Set Medication Schedule
                       </Text>
                       <TouchableOpacity
                           onPress={handleClose}
                           style={styles.closeButton}
                       >
                           <MaterialCommunityIcons
                               name="close"
                               size={24}
                               color="#666"
                           />
                       </TouchableOpacity>
                   </View>


                   <Text style={styles.medicineName}>{medicineName}</Text>


                   {/* Progress Indicator */}
                   <View style={styles.progressContainer}>
                       {[1, 2, 3, 4].map((s) => (
                           <View
                               key={s}
                               style={[
                                   styles.progressDot,
                                   s === step && styles.progressDotActive,
                                   s < step && styles.progressDotComplete,
                               ]}
                           />
                       ))}
                   </View>


                   <ScrollView style={styles.stepContainer}>
                       {renderStep()}
                   </ScrollView>


                   <View style={styles.buttonContainer}>
                       {step > 1 && (
                           <TouchableOpacity
                               style={[styles.button, styles.backButton]}
                               onPress={handleBack}
                           >
                               <Text style={styles.backButtonText}>Back</Text>
                           </TouchableOpacity>
                       )}
                       <TouchableOpacity
                           style={[
                               styles.button,
                               styles.nextButton,
                               step === 1 && styles.fullWidthButton,
                           ]}
                           onPress={handleNext}
                       >
                           <Text style={styles.nextButtonText}>
                               {step === 4 ? "Add to Schedule" : "Next"}
                           </Text>
                       </TouchableOpacity>
                   </View>
               </View>
           </View>
       </Modal>
   );
};


const styles = StyleSheet.create({
   modalOverlay: {
       flex: 1,
       backgroundColor: "rgba(0, 0, 0, 0.5)",
       justifyContent: "center",
       alignItems: "center",
       paddingHorizontal: 20,
   },
   modalContent: {
       backgroundColor: COLORS.white,
       borderRadius: 24,
       padding: SIZES.padding,
       paddingBottom: 40,
       maxHeight: "85%",
       width: "100%",
       maxWidth: 500,
   },
   modalHeader: {
       flexDirection: "row",
       justifyContent: "space-between",
       alignItems: "center",
       marginBottom: 20,
   },
   modalTitle: {
       fontSize: 24,
       fontWeight: "bold",
       color: "#000",
   },
   closeButton: {
       padding: 4,
   },
   medicineName: {
       fontSize: 18,
       fontWeight: "600",
       color: COLORS.primary,
       marginBottom: 16,
   },
   progressContainer: {
       flexDirection: "row",
       justifyContent: "center",
       alignItems: "center",
       gap: 8,
       marginBottom: 24,
   },
   progressDot: {
       width: 8,
       height: 8,
       borderRadius: 4,
       backgroundColor: "#E5E5E5",
   },
   progressDotActive: {
       backgroundColor: COLORS.primary,
       width: 24,
   },
   progressDotComplete: {
       backgroundColor: COLORS.primary,
   },
   stepContainer: {
       minHeight: 300,
       maxHeight: 400,
   },
   stepTitle: {
       fontSize: 20,
       fontWeight: "600",
       color: "#000",
       marginBottom: 20,
   },
   optionsContainer: {
       gap: 12,
   },
   optionButton: {
       flexDirection: "row",
       justifyContent: "space-between",
       alignItems: "center",
       padding: 16,
       backgroundColor: "#F5F5F7",
       borderRadius: 12,
       borderWidth: 2,
       borderColor: "transparent",
   },
   optionButtonSelected: {
       backgroundColor: "#F0EBFF",
       borderColor: COLORS.primary,
   },
   optionText: {
       fontSize: 16,
       fontWeight: "500",
       color: "#666",
   },
   optionTextSelected: {
       color: COLORS.primary,
       fontWeight: "600",
   },
   datePickerButton: {
       flexDirection: "row",
       alignItems: "center",
       padding: 16,
       backgroundColor: "#F5F5F7",
       borderRadius: 12,
       gap: 12,
   },
   datePickerText: {
       fontSize: 18,
       fontWeight: "600",
       color: "#000",
   },
   timeListContainer: {
       gap: 12,
   },
   timeRow: {
       flexDirection: "row",
       justifyContent: "space-between",
       alignItems: "center",
       padding: 16,
       backgroundColor: "#F5F5F7",
       borderRadius: 12,
   },
   timeLabel: {
       fontSize: 16,
       fontWeight: "500",
       color: "#000",
   },
   timePickerButton: {
       flexDirection: "row",
       alignItems: "center",
       gap: 8,
       backgroundColor: COLORS.white,
       paddingHorizontal: 12,
       paddingVertical: 8,
       borderRadius: 8,
   },
   timeText: {
       fontSize: 16,
       fontWeight: "600",
       color: "#000",
   },
   buttonContainer: {
       flexDirection: "row",
       gap: 12,
       marginTop: 20,
   },
   button: {
       flex: 1,
       paddingVertical: 16,
       borderRadius: 12,
       alignItems: "center",
       justifyContent: "center",
   },
   fullWidthButton: {
       flex: 1,
   },
   backButton: {
       backgroundColor: "#F5F5F7",
   },
   nextButton: {
       backgroundColor: COLORS.primary,
   },
   backButtonText: {
       fontSize: 16,
       fontWeight: "600",
       color: "#666",
   },
   nextButtonText: {
       fontSize: 16,
       fontWeight: "600",
       color: COLORS.white,
   },
});


export default TimingModal;
