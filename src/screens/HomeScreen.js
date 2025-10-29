import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/theme';

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with gradient */}
      <LinearGradient
        colors={[COLORS.primary, '#4F46E5']}
        style={styles.header}
      >
        <Text style={styles.greeting}>Hello! 👋</Text>
        <Text style={styles.title}>Welcome to MedSync</Text>
      </LinearGradient>

      {/* Main content */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardText}>Scan Medicine 📸</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardText}>View Schedule 📅</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardText}>My Medications 💊</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.padding,
    paddingTop: 30,
    paddingBottom: 30,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  greeting: {
    fontSize: SIZES.h3,
    color: COLORS.white,
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  content: {
    padding: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    marginTop: 8,
  },
  card: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: 12,
  },
  cardText: {
    fontSize: SIZES.body,
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default HomeScreen;