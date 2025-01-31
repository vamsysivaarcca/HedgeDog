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

  const [marketsData, setMarketsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [betAmount, setBetAmount] = useState('');
  const [adjustedOdds, setAdjustedOdds] = useState(0);

  const fetchEventOdds = async () => {
    try {
      const response = await axios.get(
        `https://c5ac-68-194-58-76.ngrok-free.app/api/odds/live-odds?sport=${sport}&region=${region}&bookmakers=${bookmaker}&markets=${market}`
      );

      const selectedEvent = response.data?.find((e) => e.id === eventId);
      if (!selectedEvent || !selectedEvent.bookmakers?.length) {
        Alert.alert('No Data', 'No odds data found for this event.');
        return;
      }

      const markets = selectedEvent.bookmakers[0]?.markets || [];
      setMarketsData(markets);

      const firstOutcome = markets[0]?.outcomes[0];
      if (firstOutcome) {
        setAdjustedOdds(firstOutcome.price);
      }
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

  const adjustOdds = (direction) => {
    setAdjustedOdds((prevOdds) => {
      let newOdds = direction === 'up' ? prevOdds + 0.1 : prevOdds - 0.1;
      return Math.max(1, Math.min(newOdds, 100));
    });
  };

  const handleMonitorOdds = async () => {
    if (!selectedOutcome) {
      Alert.alert('Error', 'Please select a team or outcome to monitor.');
      return;
    }

    if (!betAmount || isNaN(betAmount) || parseFloat(betAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid bet amount.');
      return;
    }

    try {
      const response = await axios.get('https://c5ac-68-194-58-76.ngrok-free.app/api/odds/monitor', {
        params: {
          userId,
          eventId,
          sport,
          region,
          markets: market,
          bookmakers: bookmaker,
          team: selectedOutcome,
          initialOdds: adjustedOdds,
          betAmount: betAmount,
        },
      });

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

  const renderMarketSection = ({ item }) => {
    const { key, outcomes } = item;

    return (
      <View style={styles.card}>
        <Text style={styles.marketTitle}>{key.toUpperCase()}</Text>
        {outcomes?.map((outcome, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.outcomeItem,
              selectedOutcome === outcome.name && { backgroundColor: '#28a745' },
            ]}
            onPress={() => {
              setSelectedOutcome(outcome.name);
              setAdjustedOdds(outcome.price);
            }}
          >
            <Text style={styles.outcomeText}>
              {outcome.name} - {outcome.price}
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
              <Text style={styles.inputLabel}>Adjust Odds</Text>
              <View style={styles.adjustOddsContainer}>
                <TouchableOpacity style={styles.adjustButton} onPress={() => adjustOdds('down')}>
                  <Text style={styles.adjustButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.adjustedOddsText}>{adjustedOdds.toFixed(2)}</Text>
                <TouchableOpacity style={styles.adjustButton} onPress={() => adjustOdds('up')}>
                  <Text style={styles.adjustButtonText}>+</Text>
                </TouchableOpacity>
              </View>

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
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', color: '#007bff', marginBottom: 20 },
  inputLabel: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#555' },
  adjustOddsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  adjustButton: { backgroundColor: '#007bff', borderRadius: 10, padding: 10, marginHorizontal: 10 },
  adjustButtonText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  adjustedOddsText: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  input: { height: 50, borderColor: '#ddd', borderWidth: 1, marginBottom: 20, paddingHorizontal: 15, borderRadius: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  marketTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#007bff' },
  outcomeItem: { backgroundColor: '#e9ecef', padding: 10, borderRadius: 8, marginBottom: 5 },
  outcomeText: { fontSize: 16, color: '#333' },
  monitorButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
  noDataText: { fontSize: 18, color: 'gray', textAlign: 'center', marginTop: 20 },
});

export default EventOddsScreen;