import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AuthShell from '../../src/features/auth/AuthShell';
import BackButton from '../../src/components/BackButton';
import AvatarTile from '../../src/components/AvatarTile';
import Button from '../../src/components/Button';
import { forgotPasswordEmailSchema, resetPasswordSchema } from '../../src/features/auth/authSchemas';
import { AUTH_ROLE_COPY } from '../../src/features/auth/roleOptions';
import { ROLES } from '../../src/constants/roles';
import { useAuth } from '../../src/context/AuthContext';
import { useToast } from '../../src/context/ToastContext';
import { colors } from '../../src/theme/tokens';

function ServerError({ message }) {
  if (!message) return null;
  return (
    <View className="flex-row gap-sm items-start bg-dangerBg border border-dangerBorder rounded-md px-md py-[10px] mb-md">
      <Text style={{ color: colors.danger, fontSize: 13 }}>⚠</Text>
      <Text className="flex-1 font-body-semibold text-[12px] text-dangerText leading-[17px]">{message}</Text>
    </View>
  );
}

// Own component (mirrors OtpStep in login.js) rather than inline JSX under
// ForgotPassword — a useForm() created at the top of ForgotPassword but only
// mounting its first Controller several renders later (once step flips to
// 'reset') left that first field's input untypeable on web. A fresh
// component mounts its own useForm at the moment it first renders instead.
function ResetStep({ role, roleCopy, email, onBack }) {
  const { resetPassword, requestPasswordReset } = useAuth();
  const toast = useToast();
  const [serverError, setServerError] = useState('');
  const [isResending, setIsResending] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: '', newPassword: '' },
  });

  const onResend = async () => {
    setIsResending(true);
    try {
      await requestPasswordReset({ email });
      toast.show(`New code sent to ${email}`);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const signedInUser = await resetPassword({ email, code: values.code, newPassword: values.newPassword, role });
      if (signedInUser.ownedRoles.length > 1) {
        router.replace('/(auth)/choose-account');
      } else {
        router.replace('/');
      }
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <View className="flex-1 px-2xl pt-lg pb-2xl">
      <BackButton onPress={onBack} style={{ marginBottom: 26 }} />
      <AvatarTile label={roleCopy.mark} bg={roleCopy.bg} fg={roleCopy.c} size={52} radius={15} />
      <Text className="font-display-semibold text-[22px] text-ink mt-md mb-[4px]">Reset your password</Text>
      <Text className="font-body text-[12.5px] text-muted leading-[18px] mb-lg">
        We emailed a 6-digit code to {email}. Enter it below with your new password.
      </Text>

      <Controller
        control={control}
        name="code"
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="bg-white border-[1.5px] border-borderInput rounded-md px-md py-[11px] mb-sm">
            <Text className="font-body-bold text-[10px] tracking-wider uppercase text-muted">6-digit code</Text>
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="123456"
              className="font-body-semibold text-[13.5px] text-ink mt-[2px] p-0"
            />
          </View>
        )}
      />
      {errors.code ? <Text className="text-[11px] text-danger mb-sm">{errors.code.message}</Text> : null}

      <Controller
        control={control}
        name="newPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="bg-white border-[1.5px] border-borderInput rounded-md px-md py-[11px] mb-lg">
            <Text className="font-body-bold text-[10px] tracking-wider uppercase text-muted">New password</Text>
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              placeholder="••••••••"
              className="font-body-semibold text-[13.5px] text-ink mt-[2px] p-0"
            />
          </View>
        )}
      />
      {errors.newPassword ? (
        <Text className="text-[11px] text-danger mb-md -mt-sm">{errors.newPassword.message}</Text>
      ) : null}

      <ServerError message={serverError} />

      <Button
        title="Reset password & log in"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        className="mb-sm"
      />
      <Button title="Resend code" variant="secondary" onPress={onResend} loading={isResending} />

      <Text className="font-body text-[11px] text-faint text-center mt-auto pt-2xl">
        One backend, one login — your role decides your dashboard.
      </Text>
    </View>
  );
}

export default function ForgotPassword() {
  const { role: rawRole } = useLocalSearchParams();
  const role = rawRole ?? ROLES.RESIDENTIAL;
  const roleCopy = AUTH_ROLE_COPY[role] ?? {};
  const { requestPasswordReset } = useAuth();

  const [step, setStep] = useState('email'); // 'email' | 'reset'
  const [email, setEmail] = useState('');
  const [serverError, setServerError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordEmailSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      await requestPasswordReset({ email: values.email });
      setEmail(values.email);
      setStep('reset');
    } catch (err) {
      setServerError(err.message);
    }
  };

  if (step === 'reset') {
    return (
      <AuthShell>
        <ResetStep
          role={role}
          roleCopy={roleCopy}
          email={email}
          onBack={() => { setServerError(''); setStep('email'); }}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <View className="flex-1 px-2xl pt-lg pb-2xl">
        <BackButton onPress={() => router.back()} style={{ marginBottom: 26 }} />
        <AvatarTile label={roleCopy.mark} bg={roleCopy.bg} fg={roleCopy.c} size={52} radius={15} />
        <Text className="font-display-semibold text-[22px] text-ink mt-md mb-[4px]">Forgot your password?</Text>
        <Text className="font-body text-[12.5px] text-muted leading-[18px] mb-lg">
          Enter the email on your account and we'll send you a code to reset it.
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="bg-white border-[1.5px] border-borderInput rounded-md px-md py-[11px] mb-sm">
              <Text className="font-body-bold text-[10px] tracking-wider uppercase text-muted">Email</Text>
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="maya@hazelct.com"
                className="font-body-semibold text-[13.5px] text-ink mt-[2px] p-0"
              />
            </View>
          )}
        />
        {errors.email ? <Text className="text-[11px] text-danger mb-md -mt-sm">{errors.email.message}</Text> : null}

        <ServerError message={serverError} />

        <Button title="Send reset code" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />

        <Text className="font-body text-[11px] text-faint text-center mt-auto pt-2xl">
          One backend, one login — your role decides your dashboard.
        </Text>
      </View>
    </AuthShell>
  );
}
