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
  const { sport, region, bookmaker, userId } = route.params;
  console.log('Received User ID in CompetitionsScreen:', userId);
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default market for now
  const defaultMarket = 'h2h';

  // Fetch competitions (events) with odds
  const fetchCompetitions = async () => {
    try {
      console.log('Fetching competitions with params:', {
        sport,
        region,
        bookmaker,
        markets: defaultMarket,
      });

      const response = await axios.get(
        `http://192.168.86.25:8080/api/odds/live-odds?sport=${sport}&region=${region}&bookmakers=${bookmaker}&markets=${defaultMarket}`
      );

      console.log('Fetched Competitions:', response.data);

      const events = response.data || [];
      setCompetitions(events);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching competitions:', error.message);
      Alert.alert('Error', 'Failed to fetch competitions. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, [sport, region, bookmaker]);

  const handleEventSelect = (event) => {
    console.log('Selected Event:', event);
    navigation.navigate('MarketsScreen', {
      userId,
      eventId: event.id,
      sport,
      region,
      bookmaker,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => handleEventSelect(item)}>
      <Text style={styles.itemText}>
        {item.home_team} vs {item.away_team}
      </Text>
      <Text style={styles.subText}>Commence Time: {item.commence_time}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Competitions</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : competitions.length > 0 ? (
        <FlatList
          data={competitions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      ) : (
        <Text style={styles.noDataText}>No competitions available.</Text>
      )}
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
  },
  itemText: { fontSize: 18, color: '#fff', textAlign: 'center' },
  subText: { fontSize: 14, color: '#ddd', textAlign: 'center' },
  noDataText: { fontSize: 18, color: 'gray', textAlign: 'center', marginTop: 20 },
});

export default CompetitionsScreen;
