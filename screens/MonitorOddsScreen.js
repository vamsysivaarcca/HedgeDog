import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';

const MonitorOddsScreen = ({ route, navigation }) => {
  const { userId } = route.params;

  const [odds, setOdds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch monitored odds from the backend
  const fetchMonitoredOdds = async () => {
    try {
      console.log('Fetching monitored odds for User ID:', userId);

      const response = await axios.get(
        `http://192.168.86.25:8080/api/odds/fetch-monitored-odds?userId=${userId}`
      );

      const data = response.data;

      if (data.message) {
        Alert.alert('Info', data.message); // Handle no monitored odds case
        setOdds([]);
      } else if (data.odds && data.odds.length > 0) {
        console.log('Fetched Odds:', data.odds);
        setOdds(data.odds);
      } else {
        Alert.alert('No Odds', 'No odds data available.');
      }
    } catch (error) {
      console.error('Error fetching monitored odds:', error.message);
      Alert.alert('Error', 'Failed to fetch monitored odds.');
    } finally {
      setLoading(false);
    }
  };

  // Function to stop monitoring odds
  const stopMonitoringOdds = async () => {
    try {
      console.log('Stopping monitoring for User ID:', userId);

      const response = await axios.delete(
        `http://192.168.86.25:8080/api/odds/stop-monitor?userId=${userId}`
      );

      console.log('Stop Monitoring Response:', response.data);
      Alert.alert('Success', 'Stopped monitoring odds.');
      navigation.goBack(); // Navigate back
    } catch (error) {
      console.error('Error stopping monitoring:', error.message);
      Alert.alert('Error', 'Failed to stop monitoring odds.');
    }
  };

  useEffect(() => {
    fetchMonitoredOdds();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>
        {item.name}: {item.price}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monitored Odds</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : odds.length > 0 ? (
        <FlatList
          data={odds}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
        />
      ) : (
        <Text style={styles.noDataText}>No odds are currently being monitored.</Text>
      )}

      {/* Stop Monitoring Button */}
      <TouchableOpacity style={styles.stopButton} onPress={stopMonitoringOdds}>
        <Text style={styles.buttonText}>Stop Monitoring</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  item: { padding: 15, marginVertical: 5, backgroundColor: '#e9ecef', borderRadius: 8 },
  itemText: { fontSize: 18, color: '#333', textAlign: 'center' },
  noDataText: { fontSize: 18, color: 'gray', textAlign: 'center', marginTop: 20 },
  stopButton: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#dc3545',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
});

export default MonitorOddsScreen;
