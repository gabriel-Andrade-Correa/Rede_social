import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  View as RNView,
  useColorScheme,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { User, updateUserProfile } from '@/services/user';

interface ProfileFormProps {
  user: User;
  onUpdate: () => void;
}

export default function ProfileForm({ user, onUpdate }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [age, setAge] = useState(user.age?.toString() || '');
  const [bio, setBio] = useState(user.bio || '');
  const [gender, setGender] = useState(user.gender || '');
  const [interests, setInterests] = useState(user.interests.join(', ') || '');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome é obrigatório');
      return;
    }

    try {
      setLoading(true);
      await updateUserProfile(user.id, {
        name: name.trim(),
        age: age ? parseInt(age) : undefined,
        bio: bio.trim(),
        gender: gender.trim(),
        interests: interests.split(',').map(i => i.trim()).filter(i => i),
      });
      
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      onUpdate();
    } catch (error: any) {
      Alert.alert('Erro', 'Erro ao atualizar perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: isDark ? '#333' : '#FFF',
      borderColor: isDark ? '#555' : '#DDD',
      color: isDark ? '#FFF' : '#000',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={[styles.label, { color: isDark ? '#999' : '#666' }]}>Nome</Text>
        <TextInput
          style={inputStyle}
          value={name}
          onChangeText={setName}
          placeholder="Seu nome"
          placeholderTextColor={isDark ? '#666' : '#999'}
          editable={!loading}
        />

        <Text style={[styles.label, { color: isDark ? '#999' : '#666' }]}>Idade</Text>
        <TextInput
          style={inputStyle}
          value={age}
          onChangeText={setAge}
          placeholder="Sua idade"
          placeholderTextColor={isDark ? '#666' : '#999'}
          keyboardType="numeric"
          editable={!loading}
        />

        <Text style={[styles.label, { color: isDark ? '#999' : '#666' }]}>Gênero</Text>
        <TextInput
          style={inputStyle}
          value={gender}
          onChangeText={setGender}
          placeholder="Seu gênero"
          placeholderTextColor={isDark ? '#666' : '#999'}
          editable={!loading}
        />

        <Text style={[styles.label, { color: isDark ? '#999' : '#666' }]}>Biografia</Text>
        <TextInput
          style={[inputStyle, styles.bioInput]}
          value={bio}
          onChangeText={setBio}
          placeholder="Conte um pouco sobre você"
          placeholderTextColor={isDark ? '#666' : '#999'}
          multiline
          numberOfLines={4}
          editable={!loading}
        />

        <Text style={[styles.label, { color: isDark ? '#999' : '#666' }]}>
          Interesses (separados por vírgula)
        </Text>
        <TextInput
          style={inputStyle}
          value={interests}
          onChangeText={setInterests}
          placeholder="música, esportes, viagens..."
          placeholderTextColor={isDark ? '#666' : '#999'}
          editable={!loading}
        />

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: Colors[isDark ? 'dark' : 'light'].primary },
            loading && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Salvar Alterações</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  input: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 