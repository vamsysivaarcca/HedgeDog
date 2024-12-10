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

const BookmakerScreen = ({ route, navigation }) => {
  const { sport, region } = route.params; // Receive sport and region
  const [bookmakers, setBookmakers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch bookmakers based on sport and region
  const fetchBookmakers = async () => {
    try {
      console.log(`Fetching bookmakers for sport: ${sport}, region: ${region}`);
      const response = await axios.get(
        `http://192.168.86.25:8080/api/odds/bookmakers?sport=${sport}&region=${region}`
      );

      setBookmakers(response.data); // Assuming the API returns a list of bookmaker names
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookmakers:', error.message);
      Alert.alert('Error', 'Failed to fetch bookmakers.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmakers();
  }, [sport, region]);

  // Render each bookmaker item
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        console.log('Selected Bookmaker:', item);
        // Navigate to the competitions screen with the selected bookmaker
        navigation.navigate('CompetitionsScreen', {
          sport,
          region,
          bookmaker: item,
        });
      }}
    >
      <Text style={styles.itemText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Bookmaker</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : bookmakers.length > 0 ? (
        <FlatList
          data={bookmakers}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={renderItem}
        />
      ) : (
        <Text style={styles.noDataText}>No bookmakers found for this sport and region.</Text>
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
  noDataText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default BookmakerScreen;
