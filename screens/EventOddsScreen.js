import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import axios from 'axios';

const EventOddsScreen = ({ route, navigation }) => {
  const { userId, eventId, sport, region, bookmaker } = route.params;
  console.log('Received userId in EventOddsScreen:', userId);

  const [odds, setOdds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [betAmount, setBetAmount] = useState('');

  // Fetch odds for the selected event
  const fetchOdds = async () => {
    try {
      console.log('Fetching Odds:', { eventId, sport, region, bookmaker });
      const response = await axios.get(
        `http://192.168.86.25:8080/api/odds/live-odds?sport=${sport}&region=${region}&bookmakers=${bookmaker}&markets=h2h`
      );

      console.log('Full API Response:', response.data);

      // Find the selected event and outcomes
      const selectedEvent = response.data?.find((e) => e.id === eventId);
      const outcomes =
        selectedEvent?.bookmakers?.[0]?.markets?.[0]?.outcomes || [];

      setOdds(outcomes);
    } catch (error) {
      console.error('Error fetching odds:', error.message);
      Alert.alert('Error', 'Failed to fetch odds. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOdds();
  }, []);

  const handleMonitorOdds = async () => {
    if (!selectedTeam) {
      showToast("Please select a team to monitor.");
      return;
    }
    if (!betAmount || isNaN(betAmount) || betAmount <= 0) {
      showToast("Please enter a valid bet amount.");
      return;
    }
  
    try {
      const response = await axios.get(
        `http://192.168.86.25:8080/api/odds/monitor`,
        {
          params: {
            userId,
            eventId,
            sport,
            region,
            markets: "h2h",
            bookmakers: bookmaker,
          },
        }
      );
  
      if (response.data.message.includes("Started monitoring")) {
        navigation.navigate("MonitorOddsScreen", {
          userId,
          selectedTeam,
          betAmount,
          eventId,
        });
      } else {
        Alert.alert("Error", "Failed to start monitoring the event.");
      }
    } catch (error) {
      console.error("Error monitoring odds:", error.message);
      Alert.alert("Error", "Failed to monitor odds. Please try again.");
    }
  };
  

  // Toast-style in-app notification
  const showToast = (message) => {
    Alert.alert('Notification', message, [{ text: 'OK' }]);
  };

  // Render odds list with selectable teams
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.item,
        selectedTeam === item.name && { backgroundColor: '#28a745' },
      ]}
      onPress={() => setSelectedTeam(item.name)}
    >
      <Text style={styles.itemText}>{item.name}</Text>
      <Text style={styles.itemText}>Odds: {item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Team & Enter Bet Amount</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : odds.length > 0 ? (
        <FlatList
          data={odds}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
        />
      ) : (
        <Text style={styles.noDataText}>No odds available for this market.</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Enter Bet Amount"
        keyboardType="numeric"
        value={betAmount}
        onChangeText={setBetAmount}
      />

      <TouchableOpacity style={styles.monitorButton} onPress={handleMonitorOdds}>
        <Text style={styles.buttonText}>Monitor Odds</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  item: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#007bff',
    borderRadius: 8,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  itemText: { fontSize: 18, color: '#fff' },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  monitorButton: {
    padding: 15,
    backgroundColor: '#28a745',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
  noDataText: { fontSize: 18, color: 'gray', textAlign: 'center', marginTop: 20 },
});

export default EventOddsScreen;