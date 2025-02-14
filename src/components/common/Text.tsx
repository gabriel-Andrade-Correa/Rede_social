import { Text as RNText, TextProps as RNTextProps } from 'react-native';

interface TextProps extends RNTextProps {
  children: React.ReactNode;
}

export function Text({ children, style, ...rest }: TextProps) {
  return (
    <RNText style={style} {...rest}>
      {children}
    </RNText>
  );
} 