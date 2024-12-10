import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';

const CompetitionsScreen = ({ route, navigation }) => {
  const { sport, region, bookmaker } = route.params; // Parameters passed
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch competitions for the selected sport, region, and bookmaker
  const fetchCompetitions = async () => {
    try {
      const markets = 'h2h'; // Default market
      const url = `http://192.168.86.25:8080/api/odds/live-odds?sport=${sport}&region=${region}&bookmakers=${bookmaker}&markets=${markets}`;
      console.log('Fetching Competitions URL:', url);

      const response = await axios.get(url);
      const events = response.data || [];

      setCompetitions(events);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching competitions:', error.message);
      Alert.alert('Error', 'Failed to fetch competitions.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, [sport, region, bookmaker]);

  // Function to start monitoring odds for a competition
  const startMonitoringOdds = async (eventId) => {
    try {
      const url = `http://192.168.86.25:8080/api/odds/monitor?userId=${userId}&eventId=${eventId}&sport=${sport}&region=${region}&bookmakers=${bookmaker}`;
      console.log('Starting monitoring odds with URL:', url);
  
      const response = await axios.post(url);
      Alert.alert('Success', `Started monitoring odds for Event ID: ${eventId}`);
    } catch (error) {
      console.error('Error starting odds monitoring:', error.message);
      Alert.alert('Error', 'Failed to start monitoring odds.');
    }
  };
  
  
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>
        {item.home_team} vs {item.away_team}
      </Text>
      <Text style={styles.timeText}>Time: {item.commence_time}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => startMonitoringOdds(item.id)}
      >
        <Text style={styles.buttonText}>Monitor Odds</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Competitions ({sport} - {bookmaker.toUpperCase()})
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : competitions.length > 0 ? (
        <FlatList
          data={competitions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      ) : (
        <Text style={styles.noDataText}>
          No competitions found for this bookmaker.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  item: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#007bff',
    borderRadius: 8,
  },
  itemText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#e1e1e1',
    textAlign: 'center',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  noDataText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default CompetitionsScreen;
