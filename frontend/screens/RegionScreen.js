import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const regions = [
  { key: 'us', name: 'United States' },
  { key: 'uk', name: 'United Kingdom' },
  { key: 'eu', name: 'Europe' },
  { key: 'au', name: 'Australia' },
];


const apiUrl = process.env.REACT_APP_BACKEND_URL;
const RegionScreen = ({ navigation, route }) => {
  const { userId } = route.params || {}; // Safely extract userId

  console.log('Received User ID in RegionScreen:', userId);

  const handleRegionSelect = (regionKey) => {
    console.log('Region Selected:', regionKey);
    navigation.navigate('HomeScreen', { userId, region: regionKey });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Region</Text>
      <FlatList
        data={regions}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => handleRegionSelect(item.key)}
          >
            <Text style={styles.itemText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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

export default RegionScreen;
