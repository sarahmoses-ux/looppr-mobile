import { Text, View } from 'react-native';
import Card from './Card';

export default function KpiCard({ label, value, delta, deltaPositive }) {
  return (
    <Card className="flex-1 py-[15px] px-[17px]">
      <Text className="font-body-bold text-[11.5px] tracking-wider uppercase text-muted mb-[6px]">{label}</Text>
      <Text className="font-display-semibold text-[26px] text-ink leading-none">{value}</Text>
      {delta ? (
        <Text className={`font-body-bold text-[11.5px] mt-[6px] ${deltaPositive ? 'text-success' : 'text-danger'}`}>
          {delta}
        </Text>
      ) : null}
    </Card>
  );
}
