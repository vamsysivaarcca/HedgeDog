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

const apiUrl = process.env.REACT_APP_BACKEND_URL;
const BookmakerScreen = ({ route, navigation }) => {
  const { sport, region, userId } = route.params;

  const [bookmakers, setBookmakers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmakers = async () => {
    try {
      const response = await axios.get(
        `'http://3.128.158.120:8080'/api/odds/bookmakers?sport=${sport}&region=${region}`
      );
      setBookmakers(response.data || []);
    } catch (error) {
      console.error('Error fetching bookmakers:', error.message);
      Alert.alert('Error', 'Failed to fetch bookmakers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmakers();
  }, []);

  const handleBookmakerSelect = (bookmaker) => {
    navigation.navigate('MarketsScreen', {
      sport,
      region,
      bookmaker, // Pass selected bookmaker
      userId,
    });
    
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Bookmaker</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={bookmakers}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => handleBookmakerSelect(item)}>
              <Text style={styles.itemText}>{item || 'Unknown Bookmaker'}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  item: { padding: 15, marginVertical: 5, backgroundColor: '#007bff', borderRadius: 8 },
  itemText: { fontSize: 18, color: '#fff', textAlign: 'center' },
});

export default BookmakerScreen;
