import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import axios from 'axios';

const EventOddsScreen = ({ route, navigation }) => {
  const { eventId, sport, region, bookmaker, market, userId } = route.params;
  console.log('Received User ID in EventOddsScreen:', userId);

  const [odds, setOdds] = useState([]); // Odds data
  const [loading, setLoading] = useState(true);

  // Fetch odds for the selected event
  const fetchOdds = async () => {
    try {
      console.log('Fetching Odds:', { eventId, sport, region, bookmaker, market });
      const response = await axios.get(
        `http://192.168.86.25:8080/api/odds/live-odds?sport=${sport}&region=${region}&bookmakers=${bookmaker}&markets=${market}`
      );

      console.log('Full API Response:', response.data);

      const selectedEvent = response.data?.find((e) => e.id === eventId);
      const outcomes =
        selectedEvent?.bookmakers?.[0]?.markets?.find((m) => m.key === market)?.outcomes || [];

      console.log('Extracted Outcomes:', outcomes);

      setOdds(outcomes);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching odds:', error.message);
      Alert.alert('Error', 'Failed to fetch odds. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOdds();
  }, []);

  // Navigate to MonitorOddsScreen
  const handleMonitorOdds = () => {
    console.log('Navigating to MonitorOddsScreen with:', {
      userId,
      eventId,
      sport,
      region,
      bookmaker,
      market,
    });

    if (!userId) {
      Alert.alert('Error', 'User ID is missing. Please log in again.');
      return;
    }

    navigation.navigate('MonitorOddsScreen', {
      userId,
      eventId,
      sport,
      region,
      bookmaker,
      market,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Event Odds</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : odds && odds.length > 0 ? (
        odds.map((outcome, index) => (
          <Text key={index} style={styles.oddsText}>
            {outcome.name}: {outcome.price}
          </Text>
        ))
      ) : (
        <Text style={styles.noDataText}>No odds available for this market.</Text>
      )}

      <TouchableOpacity style={styles.monitorButton} onPress={handleMonitorOdds}>
        <Text style={styles.buttonText}>Monitor Odds</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  oddsText: { fontSize: 18, color: '#333', marginVertical: 5, textAlign: 'center' },
  noDataText: { fontSize: 18, color: 'gray', textAlign: 'center', marginTop: 20 },
  monitorButton: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#28a745',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
});

export default EventOddsScreen;
