import { Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { colors, radius, shadow } from '../theme/tokens';

// Single floating pill toast styled to match the mockup (`{{ toast }}` —
// purple pill, bottom-center, shown from useToast().show(...)).
function PillToast({ text1 }) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.brand,
          borderRadius: radius.pill,
          paddingVertical: 10,
          paddingHorizontal: 18,
          alignSelf: 'center',
          maxWidth: '86%',
        },
        shadow.toast,
      ]}
    >
      <Text className="font-body-bold text-[13px] text-white text-center">{text1}</Text>
    </View>
  );
}

const toastConfig = {
  success: (props) => <PillToast {...props} />,
  error: (props) => <PillToast {...props} />,
  info: (props) => <PillToast {...props} />,
};

export default function ToastHost() {
  return <Toast config={toastConfig} />;
}
