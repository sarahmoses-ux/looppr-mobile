import { Pressable, View } from 'react-native';

export default function Card({ children, onPress, className = '', style, ...rest }) {
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      onPress={onPress}
      className={`bg-white border border-border rounded-md p-lg ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </Wrapper>
  );
}
