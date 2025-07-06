import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Company {
  id: string;
  companyName: string;
  employeeCount: number;
  logoUrl?: string;
  pin?: string;
}

type Props = NativeStackScreenProps<RootStackParamList, 'BusinessDashboard'>;

export default function BusinessDashboard({ navigation }: Props) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companiesQuery = await firestore().collection('companies').get();
        const companiesData: Company[] = [];

        for (const doc of companiesQuery.docs) {
          const employeesQuery = await firestore()
            .collection('employees')
            .where('companyId', '==', doc.id)
            .get();

          companiesData.push({
            id: doc.id,
            companyName: doc.data()?.companyName || 'Unknown Company',
            employeeCount: employeesQuery.size,
            logoUrl: doc.data()?.logoUrl || '',
            pin: doc.data()?.pin || '',
          });
        }

        setCompanies(companiesData);
        setFilteredCompanies(companiesData);
      } catch (error) {
        console.error('Error fetching companies:', error);
        Alert.alert('Error', 'Failed to load companies');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();

    const unsubscribe = firestore()
      .collection('companies')
      .onSnapshot(() => fetchCompanies());

    return () => unsubscribe();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    const filtered = companies.filter(company =>
      company.companyName.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCompanies(filtered);
  };

  const handleCardPress = (company: Company) => {
    setSelectedCompany(company);
    setEnteredPin('');
    setPinModalVisible(true);
  };

  const validatePinAndNavigate = () => {
    if (!enteredPin) {
      Alert.alert('PIN Required', 'Please enter the PIN to continue.');
      return;
    }

    if (enteredPin !== selectedCompany?.pin) {
      Alert.alert('Incorrect PIN', 'The entered PIN is incorrect.');
      return;
    }

    setPinModalVisible(false);
    navigation.navigate('CompanyDashboard', {
      companyId: selectedCompany.id,
      companyName: selectedCompany.companyName,
    });
  };

  const renderCompanyCard = ({ item }: { item: Company }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleCardPress(item)}>
      <View style={styles.cardContent}>
        {item.logoUrl ? (
          <Image source={{ uri: item.logoUrl }} style={styles.logo} />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Icon name="office-building" size={30} color="white" />
          </View>
        )}
        <View style={styles.textContent}>
          <Text style={styles.companyName}>{item.companyName}</Text>
          <Text style={styles.employeeCount}>
            {item.employeeCount} {item.employeeCount === 1 ? 'Employee' : 'Employees'}
          </Text>
        </View>
        <Icon name="chevron-right" size={28} color="#999" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10 }}>Loading companies...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Business Dashboard</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search companies..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filteredCompanies}
        renderItem={renderCompanyCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No matching companies found.</Text>}
      />

      <Modal
        visible={pinModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPinModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter PIN</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Company PIN"
              secureTextEntry
              keyboardType="number-pad"
              value={enteredPin}
              onChangeText={setEnteredPin}
              maxLength={6}
            />
            <View style={styles.modalButtons}>
              <Pressable style={styles.modalButton} onPress={validatePinAndNavigate}>
                <Text style={styles.modalButtonText}>Submit</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, { backgroundColor: '#ddd' }]} onPress={() => setPinModalVisible(false)}>
                <Text style={[styles.modalButtonText, { color: '#333' }]}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f6fb',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  listContainer: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContent: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  employeeCount: {
    color: '#666',
    fontSize: 14,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 30,
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
