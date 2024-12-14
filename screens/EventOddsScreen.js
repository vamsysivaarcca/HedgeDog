import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import axios from 'axios';

const EventOddsScreen = ({ route, navigation }) => {
  const { sport, region, bookmaker, market, userId, eventId } = route.params;
  console.log('Received route params on the EventOddsScreen:', route.params);

  const [marketsData, setMarketsData] = useState([]); // Store all markets dynamically
  const [loading, setLoading] = useState(true);
  const [selectedOutcome, setSelectedOutcome] = useState(null); // Selected team/outcome
  const [betAmount, setBetAmount] = useState(''); // Bet amount input

  // Fetch odds data dynamically
  const fetchEventOdds = async () => {
    try {
      console.log('Fetching odds for:', {
        sport,
        region,
        bookmaker,
        market,
        eventId,
      });

      const response = await axios.get(
        `http://192.168.86.25:8080/api/odds/live-odds?sport=${sport}&region=${region}&bookmakers=${bookmaker}&markets=${market}`
      );

      const selectedEvent = response.data?.find((e) => e.id === eventId);
      if (!selectedEvent || !selectedEvent.bookmakers?.length) {
        Alert.alert('No Data', 'No odds data found for this event.');
        return;
      }

      // Extract all markets and outcomes dynamically
      const markets = selectedEvent.bookmakers[0]?.markets || [];
      console.log('Fetched Markets Data:', markets);
      setMarketsData(markets);
    } catch (error) {
      console.error('Error fetching odds:', error.message);
      Alert.alert('Error', 'Failed to fetch event odds.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventOdds();
  }, []);

  // Handle navigation to MonitorOddsScreen
  const handleMonitorOdds = async () => {
    if (!selectedOutcome) {
      Alert.alert('Error', 'Please select a team or outcome to monitor.');
      return;
    }
  
    if (!betAmount || isNaN(betAmount) || parseFloat(betAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid bet amount.');
      return;
    }
  
    console.log('Starting to monitor odds:', {
      userId,
      eventId,
      sport,
      region,
      market,
      bookmaker,
      selectedOutcome,
      betAmount,
    });
  
    try {
      // Make a GET request to match the backend's parameter structure
      const response = await axios.get('http://192.168.86.25:8080/api/odds/monitor', {
        params: {
          userId,
          eventId,
          sport,
          region,
          markets: market, // Ensure "markets" key matches backend
          bookmakers: bookmaker, // Ensure "bookmakers" matches backend
        },
      });
  
      console.log('Monitor API Response:', response.data);
  
      // Navigate to MonitorOddsScreen only after the API succeeds
      navigation.navigate('MonitorOddsScreen', {
        userId,
        eventId,
        selectedTeam: selectedOutcome,
        betAmount,
      });
    } catch (error) {
      console.error('Error starting monitor:', error.message);
      Alert.alert('Error', 'Failed to monitor odds. Please try again.');
    }
  };
  
  

  
  // Render outcomes for a market
  const renderMarketSection = ({ item }) => {
    const { key, outcomes } = item;
    return (
      <View style={styles.marketSection}>
        <Text style={styles.marketTitle}>{key.toUpperCase()}</Text>
        {outcomes?.map((outcome, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.outcomeItem,
              selectedOutcome === outcome.name && { backgroundColor: '#28a745' },
            ]}
            onPress={() => setSelectedOutcome(outcome.name)}
          >
            <Text style={styles.outcomeText}>
              {outcome.name}: {outcome.price}
              {outcome.point ? ` (${outcome.point})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Event Odds</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : marketsData.length > 0 ? (
        <FlatList
          data={marketsData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderMarketSection}
          ListHeaderComponent={
            <>
              <Text style={styles.inputLabel}>Enter Bet Amount</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Bet Amount"
                keyboardType="numeric"
                value={betAmount}
                onChangeText={setBetAmount}
              />
            </>
          }
          ListFooterComponent={
            <TouchableOpacity
              style={[
                styles.monitorButton,
                (!selectedOutcome || !betAmount) && { backgroundColor: '#ccc' },
              ]}
              onPress={handleMonitorOdds}
            >
              <Text style={styles.buttonText}>Monitor Odds</Text>
            </TouchableOpacity>
          }
        />
      ) : (
        <Text style={styles.noDataText}>No odds available for this event.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  marketSection: {
    marginBottom: 20,
    backgroundColor: '#e9ecef',
    padding: 10,
    borderRadius: 8,
  },
  marketTitle: { fontSize: 20, fontWeight: 'bold', color: '#007bff', marginBottom: 10 },
  outcomeItem: {
    marginVertical: 5,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 8,
  },
  outcomeText: { fontSize: 16, color: '#fff', textAlign: 'center' },
  inputLabel: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 25,
    fontSize: 18,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  monitorButton: {
    padding: 15,
    backgroundColor: '#28a745',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
  noDataText: { fontSize: 18, color: 'gray', textAlign: 'center', marginTop: 20 },
});

export default EventOddsScreen;