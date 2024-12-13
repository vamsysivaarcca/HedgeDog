import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import axios from 'axios';

const CompetitionsScreen = ({ route, navigation }) => {
  const { sport, region, bookmaker, market, userId } = route.params;
  console.log('Received userId on the CompetitionsScreen:', userId);
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      const response = await axios.get(
        `http://192.168.86.25:8080/api/odds/live-odds?sport=${sport}&region=${region}&bookmakers=${bookmaker}&markets=${market}`
      );

      // Group events by competition
      const groupedCompetitions = response.data.reduce((acc, event) => {
        const competition = event.sport_title || 'Unknown Competition';
        if (!acc[competition]) acc[competition] = [];
        acc[competition].push(event);
        return acc;
      }, {});

      setCompetitions(Object.entries(groupedCompetitions));
    } catch (error) {
      console.error('Error fetching competitions:', error.message);
      Alert.alert('Error', 'Failed to fetch competitions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event) => {
    const availableMarkets = event.bookmakers?.[0]?.markets || [];
    console.log('Available Markets:', availableMarkets);
  
    const spreads = availableMarkets.find((m) => m.key === 'spreads');
    const totals = availableMarkets.find((m) => m.key === 'totals');
    const h2h = availableMarkets.find((m) => m.key === 'h2h');
  
    navigation.navigate('EventOddsScreen', {
      userId,
      sport,
      market,
      eventId: event.id,
      spreads: spreads?.outcomes || [],
      totals: totals?.outcomes || [],
      h2h: h2h?.outcomes || [],
    });
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Competition</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={competitions}
          keyExtractor={(item) => item[0]}
          renderItem={({ item }) => (
            <View style={styles.competitionContainer}>
              <Text style={styles.competitionTitle}>{item[0]}</Text>
              {item[1].map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.item}
                  onPress={() => handleSelectEvent(event)}
                >
                  <Text style={styles.itemText}>
                    {event.home_team} vs {event.away_team}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  competitionContainer: { marginBottom: 15 },
  competitionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 10 },
  item: {
    padding: 10,
    backgroundColor: '#007bff',
    marginVertical: 5,
    borderRadius: 8,
  },
  itemText: { color: '#fff', fontSize: 16, textAlign: 'center' },
});

export default CompetitionsScreen;
