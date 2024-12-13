import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import axios from 'axios';

const BookmakerScreen = ({ route, navigation }) => {
  const { sport, region, userId } = route.params;
  console.log('Received userId on the BookmakerScreen:', userId);
  const [bookmakers, setBookmakers] = useState([]);
  const [selectedBookmaker, setSelectedBookmaker] = useState(null);
  const [markets, setMarkets] = useState([]); // Dynamic markets
  const [loading, setLoading] = useState(true);

  // Fetch bookmakers and their available markets dynamically
  const fetchBookmakers = async () => {
    try {
      console.log('Fetching bookmakers for:', { sport, region });
      const response = await axios.get(
        `http://192.168.86.25:8080/api/odds/bookmakers?sport=${sport}&region=${region}`
      );
  
      setBookmakers(response.data || []);
    } catch (error) {
      console.error('Error fetching bookmakers:', error.message);
      Alert.alert('Error', 'Failed to fetch bookmakers.');
    }
  };
  

  // Extract markets dynamically for the selected bookmaker
  const fetchMarkets = (bookmaker) => {
    const marketsList = bookmaker?.markets?.map((market) => market.key) || [];
    console.log('Available Markets:', marketsList);
    setMarkets(marketsList);
  };

  useEffect(() => {
    fetchBookmakers();
  }, []);

  const handleBookmakerSelect = (bookmaker) => {
    setSelectedBookmaker(bookmaker.key);
    fetchMarkets(bookmaker);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Bookmaker</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <>
          <FlatList
            data={bookmakers}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.item,
                  selectedBookmaker === item.key && { backgroundColor: '#28a745' },
                ]}
                onPress={() => handleBookmakerSelect(item)}
              >
                <Text style={styles.itemText}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />

          {markets.length > 0 && (
            <>
              <Text style={styles.subtitle}>Available Markets:</Text>
              {markets.map((market, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.marketItem}
                  onPress={() =>
                    navigation.navigate('CompetitionsScreen', {
                      sport,
                      userId,
                      region,
                      bookmaker: selectedBookmaker,
                      market, // Pass the selected market
                    })
                  }
                >
                  <Text style={styles.marketText}>{market}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </>
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
  subtitle: { fontSize: 20, marginTop: 20, textAlign: 'center', fontWeight: 'bold' },
  marketItem: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#6c757d',
    borderRadius: 8,
  },
  marketText: { fontSize: 16, color: '#fff', textAlign: 'center' },
});

export default BookmakerScreen;
