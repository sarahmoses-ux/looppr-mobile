import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/tokens';

export default function BackButton({ onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      className="w-8 h-8 rounded-sm bg-white border border-border items-center justify-center"
      style={style}
    >
      <Ionicons name="chevron-back" size={16} color={colors.ink} />
    </Pressable>
  );
}
