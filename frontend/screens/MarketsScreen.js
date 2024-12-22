import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const marketTypes = [
  'h2h',
  'spreads',
  'totals',
  'player_props',
  'alternate_totals',
  'alternate_spreads',
];
const apiUrl = process.env.REACT_APP_BACKEND_URL;
const MarketsScreen = ({ route, navigation }) => {
  const { sport, region, bookmaker, userId } = route.params;

  console.log('Received params in MarketsScreen:', { sport, region, bookmaker, userId });

  const handleMarketSelect = (item) => {
    console.log('Selected Market:', item);

    navigation.navigate('CompetitionsScreen', {
      sport,
      region,
      bookmaker, // Use the passed bookmaker value
      market: item, // Pass the selected market
      userId,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Market</Text>
      <FlatList
        data={marketTypes}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => handleMarketSelect(item)}
          >
            <Text style={styles.itemText}>{item.toUpperCase()}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  item: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#007bff',
    borderRadius: 8,
  },
  itemText: { fontSize: 18, color: '#fff', textAlign: 'center' },
});

export default MarketsScreen;
