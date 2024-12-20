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
  Button,
} from 'react-native';
import axios from 'axios';

const EventOddsScreen = ({ route, navigation }) => {
  const { sport, region, bookmaker, market, userId, eventId } = route.params;
  console.log('Received route params on the EventOddsScreen:', route.params);

  const [marketsData, setMarketsData] = useState([]); // Store all markets dynamically
  const [loading, setLoading] = useState(true);
  const [selectedOutcome, setSelectedOutcome] = useState(null); // Selected team/outcome
  const [betAmount, setBetAmount] = useState(''); // Bet amount input
  const [adjustedOdds, setAdjustedOdds] = useState(0); // Adjustable odds

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

      // Set the initial odds
      const firstOutcome = markets[0]?.outcomes[0];
      if (firstOutcome) {
        setAdjustedOdds(firstOutcome.price); // Initialize odds
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
      return Math.max(1, Math.min(newOdds, 100)); // Keep odds in range [1, 100]
    });
  };

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
      adjustedOdds,
      betAmount,
    });

    try {
      const response = await axios.get('http://192.168.86.25:8080/api/odds/monitor', {
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

      console.log('Monitor API Response:', response.data);
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
      <View style={styles.marketSection}>
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
              <Text style={styles.inputLabel}>Adjust Odds</Text>
              <View style={styles.adjustOddsContainer}>
                <Button title="-" onPress={() => adjustOdds('down')} />
                <Text style={styles.adjustedOddsText}>{adjustedOdds.toFixed(2)}</Text>
                <Button title="+" onPress={() => adjustOdds('up')} />
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
  // Existing styles
  adjustOddsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  adjustedOddsText: {
    fontSize: 20,
    marginHorizontal: 20,
    fontWeight: 'bold',
  },
});

export default EventOddsScreen;
