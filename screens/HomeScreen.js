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
  const { region, userId } = route.params || {}; // Destructure userId properly

  if (!region) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Region not selected. Go back and select a region.
        </Text>
      </View>
    );
  }

  const [groupedSports, setGroupedSports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGroupedSports = async () => {
    try {
      console.log(`Fetching sports for region: ${region}`);
      const response = await axios.get(
        `http://192.168.86.25:8080/api/odds/sports?region=${region}`
      );

      const data = response.data;

      const sports = Object.keys(data).map((sport) => ({
        title: sport,
        competitions: data[sport],
      }));

      setGroupedSports(sports);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sports:', error.message);
      Alert.alert('Error', 'Failed to fetch sports data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupedSports();
  }, [region]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        navigation.navigate('BookmakerScreen', {
          sport: item.title,
          region,
          userId, // Pass userId forward
        })
      }
    >
      <Text style={styles.itemText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Sport (Region: {region.toUpperCase()})</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={groupedSports}
          keyExtractor={(item) => item.title}
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
