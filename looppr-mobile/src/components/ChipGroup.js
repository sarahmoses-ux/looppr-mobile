import { Pressable, Text, View } from 'react-native';
import { colors } from '../theme/tokens';

// Row of selectable pill chips (fold style, detergent, water temp, etc.).
export default function ChipGroup({ label, options, value, onChange }) {
  return (
    <View className="mb-lg">
      <Text className="font-body-bold text-[11px] tracking-wider uppercase text-muted mb-sm">{label}</Text>
      <View className="flex-row flex-wrap gap-sm">
        {options.map((opt) => {
          const active = opt.key === value;
          return (
            <Pressable
              key={opt.key}
              onPress={() => onChange(opt.key)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 20,
                backgroundColor: active ? colors.tint : colors.white,
                borderWidth: 1.5,
                borderColor: active ? colors.tint : colors.border,
              }}
            >
              <Text style={{ color: active ? colors.brandDeep : colors.ink, fontSize: 12.5, fontWeight: '700' }}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
