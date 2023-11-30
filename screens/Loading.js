// components/Loading.js

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const Loading = ({ isVisible, text }) => {
  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      {text && <Text>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent white background
  },
});

export default Loading;
