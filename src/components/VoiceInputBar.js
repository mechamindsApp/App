import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const VoiceInputBar = ({ value, onChangeText, onVoicePress }) => (
  <View style={styles.inputBar}>
    <TextInput
      style={styles.input}
      placeholder="Mesajınızı yazın veya sesli ekleyin..."
      value={value}
      onChangeText={onChangeText}
    />
    <TouchableOpacity style={styles.voiceBtn} onPress={onVoicePress}>
      <Text>🎤</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  inputBar: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 16, padding: 8, marginRight: 8 },
  voiceBtn: { padding: 8, backgroundColor: '#eee', borderRadius: 16 },
});

export default VoiceInputBar;
