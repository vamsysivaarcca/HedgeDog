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

const HomeScreen = ({ route, navigation }) => {
  const { region, userId } = route.params || {};
  console.log('Received User ID in HomeScreen:', userId);
  if (!region) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Region not selected. Go back and select a region.</Text>
      </View>
    );
  }

  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch sports and only display their names
  const fetchSports = async () => {
    try {
      console.log(`Fetching sports for region: ${region}`);
      const response = await axios.get(
        `'http://3.128.158.120:8080'/api/odds/sports?region=${region}`
      );

      const data = response.data;

      // Extract unique sport names and sort them
      const uniqueSports = [...new Set(Object.values(data).map((item) => item.group))]
        .filter((name) => name !== 'Other Sports')
        .sort((a, b) => a.localeCompare(b));

      uniqueSports.push('Other Sports'); // Add "Other Sports" to the end

      setSports(uniqueSports);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sports:', error.message);
      Alert.alert('Error', 'Failed to fetch sports data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSports();
  }, [region]);

  // Navigate to the BookmakerScreen when a sport is selected
  const handleSportSelect = (sport) => {
    console.log('Selected Sport:', sport);
    navigation.navigate('BookmakerScreen', { sport, region, userId });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => handleSportSelect(item)} // Pass selected sport name
    >
      <Text style={styles.itemText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Sport (Region: {region.toUpperCase()})</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={sports}
          keyExtractor={(item, index) => `${item}-${index}`}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});

export default HomeScreen;
