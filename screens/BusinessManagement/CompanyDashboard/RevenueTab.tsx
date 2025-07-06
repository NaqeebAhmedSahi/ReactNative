import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './styles';
import { RevenueInputState } from './types';

interface RevenueTabProps {
  revenueRecords: any[];
  revenueInput: RevenueInputState;
  setRevenueInput: React.Dispatch<React.SetStateAction<RevenueInputState>>;
  handleAddRevenue: () => Promise<void>;
  loading: boolean;
}

export const RevenueTab: React.FC<RevenueTabProps> = ({
  revenueRecords,
  revenueInput,
  setRevenueInput,
  handleAddRevenue,
  loading,
}) => {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Add Revenue Record</Text>
      <View style={styles.revenueForm}>
        <View style={styles.pickerRow}>
          <Picker
            selectedValue={revenueInput.month}
            onValueChange={value => setRevenueInput(prev => ({ ...prev, month: value }))}
            style={styles.picker}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <Picker.Item key={month} label={new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })} value={month} />
            ))}
          </Picker>
          <Picker
            selectedValue={revenueInput.year}
            onValueChange={value => setRevenueInput(prev => ({ ...prev, year: value }))}
            style={styles.picker}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
              <Picker.Item key={year} label={year.toString()} value={year} />
            ))}
          </Picker>
        </View>
        <TextInput
          placeholder="Revenue Amount (₹)"
          value={revenueInput.amount}
          onChangeText={text => setRevenueInput(prev => ({ ...prev, amount: text }))}
          keyboardType="numeric"
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddRevenue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.addButtonText}>Add Revenue</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Revenue History</Text>
      {revenueRecords.length > 0 ? (
        <View style={styles.revenueList}>
          {revenueRecords.slice().reverse().map(record => (
            <View key={record.id} style={styles.revenueItem}>
              <Text style={styles.revenueDate}>
                {new Date(record.year, record.month - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </Text>
              <Text style={styles.revenueAmount}>₹{record.amount.toLocaleString()}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Icon name="attach-money" size={40} color="#ccc" />
          <Text style={styles.emptyText}>No revenue records found</Text>
        </View>
      )}
    </View>
  );
};