import { Text, TextInput, View } from 'react-native';
import { colors } from '../theme/tokens';

// Fields match looppr-backend's savedAddresses/address schema exactly
// (street/apartment/city/state/zip) — Oklahoma-only at launch, so state
// is fixed rather than editable.
export const EMPTY_ADDRESS = { label: 'Address', street: '', apartment: '', city: '', state: 'OK', zip: '' };

export function isAddressComplete(a) {
  return Boolean(a.street?.trim() && a.apartment?.trim() && a.city?.trim() && /^\d{5}(-\d{4})?$/.test(a.zip?.trim() ?? ''));
}

export default function AddressForm({ value, onChange, showLabel }) {
  return (
    <View className="gap-sm">
      {showLabel ? (
        <TextInput
          value={value.label}
          onChangeText={(label) => onChange({ ...value, label })}
          placeholder="Label (e.g. Home, Work)"
          placeholderTextColor={colors.faint}
          className="bg-white border-[1.5px] border-borderInput rounded-md px-md py-[12px] font-body-semibold text-[13.5px] text-ink"
        />
      ) : null}
      <TextInput
        value={value.street}
        onChangeText={(street) => onChange({ ...value, street })}
        placeholder="Street address"
        placeholderTextColor={colors.faint}
        className="bg-white border-[1.5px] border-borderInput rounded-md px-md py-[12px] font-body-semibold text-[13.5px] text-ink"
      />
      <TextInput
        value={value.apartment}
        onChangeText={(apartment) => onChange({ ...value, apartment })}
        placeholder="Apartment / unit"
        placeholderTextColor={colors.faint}
        className="bg-white border-[1.5px] border-borderInput rounded-md px-md py-[12px] font-body-semibold text-[13.5px] text-ink"
      />
      <View className="flex-row gap-sm">
        <TextInput
          value={value.city}
          onChangeText={(city) => onChange({ ...value, city })}
          placeholder="City"
          placeholderTextColor={colors.faint}
          className="flex-1 bg-white border-[1.5px] border-borderInput rounded-md px-md py-[12px] font-body-semibold text-[13.5px] text-ink"
        />
        <TextInput
          value={value.zip}
          onChangeText={(zip) => onChange({ ...value, zip })}
          placeholder="ZIP"
          placeholderTextColor={colors.faint}
          keyboardType="number-pad"
          maxLength={10}
          className="w-[110px] bg-white border-[1.5px] border-borderInput rounded-md px-md py-[12px] font-body-semibold text-[13.5px] text-ink"
        />
      </View>
      <Text className="font-body text-[11px] text-faint">Looppr only serves Oklahoma at launch — state is set to OK.</Text>
    </View>
  );
}
