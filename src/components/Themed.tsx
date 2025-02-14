import { Text as RNText, View as RNView, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ThemedProps {
  lightColor?: string;
  darkColor?: string;
}

type TextBaseProps = React.ComponentProps<typeof RNText>;
type ViewBaseProps = React.ComponentProps<typeof RNView>;

export type TextProps = ThemedProps & TextBaseProps;
export type ViewProps = ThemedProps & ViewBaseProps;

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const colorScheme = useColorScheme();
  const color = colorScheme === 'dark' ? Colors.dark.text : Colors.light.text;

  return <RNText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? Colors.dark.background : Colors.light.background;

  return <RNView style={[{ backgroundColor }, style]} {...otherProps} />;
}

const styles = StyleSheet.create({
  default: {},
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    color: '#2e78b7',
  },
}); 