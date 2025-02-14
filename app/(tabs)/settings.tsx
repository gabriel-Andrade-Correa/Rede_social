import { StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();

  const settingsOptions = [
    { icon: 'user', title: 'Editar Perfil', type: 'link' },
    { icon: 'bell', title: 'Notificações', type: 'toggle' },
    { icon: 'lock', title: 'Privacidade', type: 'link' },
    { icon: 'question-circle', title: 'Ajuda', type: 'link' },
    { icon: 'info-circle', title: 'Sobre', type: 'link' },
    { icon: 'sign-out', title: 'Sair', type: 'link' },
  ];

  return (
    <View style={styles.container}>
      {settingsOptions.map((option, index) => (
        <TouchableOpacity key={index}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <FontAwesome
                name={option.icon}
                size={24}
                color={Colors[colorScheme ?? 'light'].primary}
                style={styles.icon}
              />
              <Text style={styles.settingTitle}>{option.title}</Text>
            </View>
            {option.type === 'toggle' ? (
              <Switch
                trackColor={{ false: '#767577', true: Colors[colorScheme ?? 'light'].primary }}
                thumbColor="#f4f3f4"
                ios_backgroundColor="#3e3e3e"
                value={true}
              />
            ) : (
              <FontAwesome
                name="chevron-right"
                size={16}
                color={Colors[colorScheme ?? 'light'].icon}
              />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
  },
}); 