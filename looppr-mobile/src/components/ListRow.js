import { Pressable, Text, View } from 'react-native';

export default function ListRow({ title, subtitle, left, right, onPress, className = '' }) {
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      onPress={onPress}
      className={`flex-row items-center gap-md bg-white border border-border rounded-md px-lg py-[13px] ${className}`}
    >
      {left}
      <View className="flex-1 min-w-0">
        <Text className="font-body-bold text-[13px] text-ink" numberOfLines={1}>{title}</Text>
        {subtitle ? <Text className="font-body text-[11.5px] text-muted mt-[1px]" numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right}
    </Wrapper>
  );
}
