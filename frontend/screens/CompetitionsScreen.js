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
  const { sport, region, bookmaker, market, userId } = route.params;
  console.log('Received params in CompetitionsScreen:', { sport, region, bookmaker, market, userId });
  
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch events (competitions) with odds
  const fetchCompetitions = async () => {
    try {
      console.log('Fetching competitions with params:', {
        sport,
        region,
        bookmaker,
        market,
      });

      const response = await axios.get(
        'http://3.128.158.120:8080/api/odds/live-odds?sport=${sport}&region=${region}&bookmakers=${bookmaker}&markets=${market}'
      );

      console.log('Raw Events Response:', response.data);

      const groupedEvents = groupByCompetition(response.data);
      setCompetitions(groupedEvents);
    } catch (error) {
      console.error('Error fetching competitions:', error.message);
      Alert.alert('Error', 'Failed to fetch competitions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Group events by sport_title
  const groupByCompetition = (events) => {
    const grouped = {};
    events.forEach((event) => {
      const competitionName = event.sport_title || 'Others';
      if (!grouped[competitionName]) {
        grouped[competitionName] = [];
      }
      grouped[competitionName].push(event);
    });
    return grouped;
  };

  useEffect(() => {
    fetchCompetitions();
  }, [sport, region, bookmaker, market]);

  const handleEventSelect = (event) => {
    console.log('Selected Event:', event);
    navigation.navigate('EventOddsScreen', {
      eventId: event.id,
      sport,
      region,
      bookmaker,
      market,
      userId,
    });
  };

  const renderCompetition = ({ item }) => {
    const [competitionName, events] = item;
    return (
      <View style={styles.competitionSection}>
        <Text style={styles.competitionTitle}>{competitionName}</Text>
        {events.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.eventItem}
            onPress={() => handleEventSelect(event)}
          >
            <Text style={styles.eventText}>
              {event.home_team} vs {event.away_team}
            </Text>
            <Text style={styles.subText}>Commence Time: {event.commence_time}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Competition</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={Object.entries(competitions)} // Convert grouped data into array
          keyExtractor={(item) => item[0]}
          renderItem={renderCompetition}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  competitionSection: { marginBottom: 20 },
  competitionTitle: { fontSize: 20, fontWeight: 'bold', color: '#007bff', marginBottom: 10 },
  eventItem: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
  },
  eventText: { fontSize: 16, color: '#333', textAlign: 'center' },
  subText: { fontSize: 14, color: 'gray', textAlign: 'center' },
});

export default CompetitionsScreen;
