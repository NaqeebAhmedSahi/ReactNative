import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Alert, ScrollView,
  TouchableOpacity, Image
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import CustomButton from '../../components/CustomButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import { commonStyles } from '../../styles/commonStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'AddCompany'>;

export default function AddCompany({ navigation }: Props) {
  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [location, setLocation] = useState('');
  const [pin, setPin] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [taxId, setTaxId] = useState('');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

const handleSelectLogo = () => {
  launchImageLibrary({ mediaType: 'photo' }, async (response) => {
    if (!response.didCancel && !response.errorCode && response.assets?.[0]?.uri) {
      const originalPath = response.assets[0].uri;

      try {
        // 1. Create full folder path: /DocumentDirectoryPath/images/company
        const baseDir = `${RNFS.DocumentDirectoryPath}/images/company`;

        // 2. Ensure directory exists
        const dirExists = await RNFS.exists(baseDir);
        if (!dirExists) {
          await RNFS.mkdir(baseDir);
        }

        // 3. Define new file path
        const fileName = `company_logo_${Date.now()}.jpg`;
        const newPath = `${baseDir}/${fileName}`;

        // 4. Copy image to that path
        await RNFS.copyFile(originalPath, newPath);

        const fileUri = 'file://' + newPath;
        setCompanyLogo(fileUri);

        // 5. Log path for confirmation
        console.log("✅ Image saved to:", fileUri);
      } catch (err) {
        console.error('❌ Image save error:', err);
        Alert.alert('Error', 'Failed to save image locally.');
      }
    }
  });
};

  const handleAddCompany = async () => {
    if (!companyName || !businessType || !contactInfo || !location || !pin) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (pin.length < 4) {
      Alert.alert('Error', 'PIN must be at least 4 characters');
      return;
    }

    setLoading(true);

    try {
      const companyData = {
        companyName,
        businessType,
        contactInfo,
        location,
        pin,
        registrationNumber,
        taxId,
        logoUrl: companyLogo, // local file path
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      await firestore().collection('companies').add(companyData);
      Alert.alert('Success', 'Company added successfully');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to add company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Company</Text>
      <View style={styles.card}>
        {/* Logo Picker */}
        <TouchableOpacity onPress={handleSelectLogo} style={styles.logoContainer}>
          {companyLogo ? (
            <Image source={{ uri: companyLogo }} style={styles.logoImage} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Icon name="camera" size={40} color="#555" />
              <Text style={styles.logoText}>Add Company Logo</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Basic Information</Text>
        <View style={styles.inputGroup}>
          <Icon name="domain" size={20} color="#4CAF50" style={styles.icon} />
          <TextInput
            placeholder="Company Name *"
            value={companyName}
            onChangeText={setCompanyName}
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Icon name="briefcase" size={20} color="#2196F3" style={styles.icon} />
          <TextInput
            placeholder="Business Type *"
            value={businessType}
            onChangeText={setBusinessType}
            style={styles.input}
          />
        </View>

        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.inputGroup}>
          <Icon name="phone" size={20} color="#FF9800" style={styles.icon} />
          <TextInput
            placeholder="Contact Info *"
            value={contactInfo}
            onChangeText={setContactInfo}
            style={styles.input}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Icon name="map-marker" size={20} color="#9C27B0" style={styles.icon} />
          <TextInput
            placeholder="Location *"
            value={location}
            onChangeText={setLocation}
            style={styles.input}
          />
        </View>

        <Text style={styles.sectionTitle}>Legal Information</Text>
        <View style={styles.inputGroup}>
          <Icon name="lock" size={20} color="#607D8B" style={styles.icon} />
          <TextInput
            placeholder="Company PIN *"
            value={pin}
            onChangeText={setPin}
            style={styles.input}
            secureTextEntry
            maxLength={6}
          />
        </View>

        <View style={styles.inputGroup}>
          <Icon name="file-document" size={20} color="#795548" style={styles.icon} />
          <TextInput
            placeholder="Registration Number"
            value={registrationNumber}
            onChangeText={setRegistrationNumber}
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Icon name="receipt" size={20} color="#F44336" style={styles.icon} />
          <TextInput
            placeholder="Tax ID"
            value={taxId}
            onChangeText={setTaxId}
            style={styles.input}
          />
        </View>

        <CustomButton
          title="Add Company"
          onPress={handleAddCompany}
          color="#4CAF50"
          loading={loading}
          icon={<Icon name="plus" size={18} color="white" />}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F5F7FA',
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginTop: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 8,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
    color: '#333',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  logoText: {
    marginTop: 8,
    color: '#555',
    fontSize: 14,
  },
});
