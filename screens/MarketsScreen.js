import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, FlatList } from 'react-native';
import axios from 'axios';

const MarketsScreen = ({ route, navigation }) => {
  const { userId, sport, region, bookmaker } = route.params;
  console.log('Received userId on the MarketsScreen:', userId);
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch markets dynamically
  const fetchMarkets = async () => {
    try {
      console.log('Fetching markets for:', { sport, region, bookmaker });
      const response = await axios.get(
        `http://192.168.86.25:8080/api/odds/markets?sport=${sport}&region=${region}&bookmakers=${bookmaker}`
      );

      console.log('Available Markets:', response.data);
      setMarkets(response.data || []);
    } catch (error) {
      console.error('Error fetching markets:', error.message);
      Alert.alert('Error', 'Failed to fetch markets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  const handleMarketSelection = (market) => {
    navigation.navigate('EventOddsScreen', {
      sport,
      userId,
      region,
      bookmaker,
      market, // Pass the selected market to the next screen
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => handleMarketSelection(item)}>
      <Text style={styles.itemText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Market</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : markets.length > 0 ? (
        <FlatList
          data={markets}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
        />
      ) : (
        <Text style={styles.noDataText}>No markets available.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  item: { padding: 15, backgroundColor: '#007bff', marginVertical: 5, borderRadius: 8 },
  itemText: { fontSize: 18, color: '#fff', textAlign: 'center' },
  noDataText: { fontSize: 18, color: 'gray', textAlign: 'center', marginTop: 20 },
});

export default MarketsScreen;
