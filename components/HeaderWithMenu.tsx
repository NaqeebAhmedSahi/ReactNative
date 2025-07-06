// components/HeaderWithMenu.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SidebarMenu from './SidebarMenu';

const HeaderWithMenu = ({ navigation, title }: { navigation: any, title?: string }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsMenuOpen(true)}>
          <Icon name="menu" size={28} color="#333" />
        </TouchableOpacity>
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={{ width: 28 }} /> {/* Spacer for alignment */}
      </View>
      
      <SidebarMenu 
        navigation={navigation} 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
      />
    </>
  );
};

const styles = {
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
};

export default HeaderWithMenu;