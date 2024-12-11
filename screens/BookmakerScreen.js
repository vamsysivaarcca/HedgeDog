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
  const { sport, region, userId } = route.params;
  console.log('Received User ID in BookmakerScreen:', userId);
  const [bookmakers, setBookmakers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmakers = async () => {
    try {
      console.log(`Fetching bookmakers for sport: ${sport}, region: ${region}`);
      const response = await axios.get(
        `http://192.168.86.25:8080/api/odds/bookmakers?sport=${sport}&region=${region}`
      );
      setBookmakers(response.data);
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

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        navigation.navigate('CompetitionsScreen', {
          sport,
          region,
          bookmaker: item,
          userId,
        })
      }
    >
      <Text style={styles.itemText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Bookmaker</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={bookmakers}
          keyExtractor={(item) => item}
          renderItem={renderItem}
        />
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
});

export default BookmakerScreen;
