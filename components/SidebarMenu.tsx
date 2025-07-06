// components/SidebarMenu.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface SidebarMenuProps {
  navigation: any;
  isOpen: boolean;
  onClose: () => void;
}

const SidebarMenu = ({ navigation, isOpen, onClose }: SidebarMenuProps) => {
  if (!isOpen) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Icon name="close" size={24} color="#fff" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => {
          navigation.navigate('Home');
          onClose();
        }}
      >
        <Icon name="home" size={24} color="#fff" />
        <Text style={styles.menuText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => {
          navigation.navigate('BusinessDashboard');
          onClose();
        }}
      >
        <Icon name="office-building" size={24} color="#fff" />
        <Text style={styles.menuText}>Business Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => {
          navigation.navigate('HospitalDashboard');
          onClose();
        }}
      >
        <Icon name="hospital" size={24} color="#fff" />
        <Text style={styles.menuText}>Hospital Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '70%',
    backgroundColor: '#6c63ff',
    padding: 20,
    paddingTop: 50,
    zIndex: 100,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  menuText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 15,
  },
});

export default SidebarMenu;