import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pressable, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AuthShell from '../../src/features/auth/AuthShell';
import BackButton from '../../src/components/BackButton';
import AvatarTile from '../../src/components/AvatarTile';
import Button from '../../src/components/Button';
import { loginSchema, registerSchema, otpSchema } from '../../src/features/auth/authSchemas';
import { AUTH_ROLE_COPY } from '../../src/features/auth/roleOptions';
import { ROLE_LABEL } from '../../src/constants/roles';
import { useAuth } from '../../src/context/AuthContext';
import { useToast } from '../../src/context/ToastContext';
import { colors } from '../../src/theme/tokens';

function OtpStep({ role, roleLabel, roleCopy, otpState, onBack }) {
  const { verifyOtp, resendOtp } = useAuth();
  const toast = useToast();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const onVerify = async () => {
    const parsed = otpSchema.safeParse({ code });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const signedInUser = await verifyOtp({ challengeToken: otpState.challengeToken, code, role });
      if (signedInUser.ownedRoles.length > 1) {
        router.replace('/(auth)/choose-account');
      } else {
        router.replace('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResend = async () => {
    setIsResending(true);
    try {
      await resendOtp({ challengeToken: otpState.challengeToken });
      toast.show(`New code sent to ${otpState.email}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View className="flex-1 px-2xl pt-lg pb-2xl">
      <BackButton onPress={onBack} style={{ marginBottom: 26 }} />
      <AvatarTile label={roleCopy.mark} bg={roleCopy.bg} fg={roleCopy.c} size={52} radius={15} />
      <Text className="font-display-semibold text-[22px] text-ink mt-md mb-[4px]">Enter your code</Text>
      <Text className="font-body text-[12.5px] text-muted leading-[18px] mb-lg">
        We emailed a 6-digit code to {otpState.email}.
      </Text>

      <View className="bg-white border-[1.5px] border-borderInput rounded-md px-md py-[11px] mb-md">
        <Text className="font-body-bold text-[10px] tracking-wider uppercase text-muted">6-digit code</Text>
        <TextInput
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="123456"
          className="font-body-semibold text-[13.5px] text-ink mt-[2px] p-0"
        />
      </View>
      {error ? <Text className="text-[11px] text-danger mb-md -mt-sm">{error}</Text> : null}

      <Button title="Verify & continue" onPress={onVerify} loading={isSubmitting} className="mb-sm" />
      <Button title="Resend code" variant="secondary" onPress={onResend} loading={isResending} />

      <Text className="font-body text-[11px] text-faint text-center mt-auto pt-2xl">
        One backend, one login — your role decides your dashboard.
      </Text>
    </View>
  );
}

export default function Login() {
  const { role } = useLocalSearchParams();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [serverError, setServerError] = useState('');
  const [otpState, setOtpState] = useState(null); // { challengeToken, email } once a code has been sent
  const roleLabel = ROLE_LABEL[role] ?? 'Looppr';
  const roleCopy = AUTH_ROLE_COPY[role] ?? {};

  const isRegister = mode === 'register';
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
    defaultValues: { email: '', password: '', name: '', phone: '' },
  });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const result = isRegister
        ? await signUp({ ...values, role })
        : await signIn({ ...values, role });

      if (result?.requiresOtp) {
        setOtpState(result);
        return;
      }

      if (result.ownedRoles.length > 1) {
        router.replace('/(auth)/choose-account');
      } else {
        router.replace('/');
      }
    } catch (err) {
      setServerError(err.message);
    }
  };

  if (otpState) {
    return (
      <AuthShell>
        <OtpStep role={role} roleLabel={roleLabel} roleCopy={roleCopy} otpState={otpState} onBack={() => setOtpState(null)} />
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <View className="flex-1 px-2xl pt-lg pb-2xl">
        <BackButton onPress={() => router.back()} style={{ marginBottom: 26 }} />
        <AvatarTile label={roleCopy.mark} bg={roleCopy.bg} fg={roleCopy.c} size={52} radius={15} />
        <Text className="font-display-semibold text-[22px] text-ink mt-md mb-[4px]">
          {isRegister ? `Sign up as ${roleLabel}` : `Continue as ${roleLabel}`}
        </Text>
        <Text className="font-body text-[12.5px] text-muted leading-[18px] mb-lg">{roleCopy.desc}</Text>

        {isRegister ? (
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="bg-white border-[1.5px] border-borderInput rounded-md px-md py-[11px] mb-sm">
                <Text className="font-body-bold text-[10px] tracking-wider uppercase text-muted">Full name</Text>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Maya Thompson"
                  className="font-body-semibold text-[13.5px] text-ink mt-[2px] p-0"
                />
              </View>
            )}
          />
        ) : null}
        {errors.name ? <Text className="text-[11px] text-danger mb-sm">{errors.name.message}</Text> : null}

        {isRegister ? (
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="bg-white border-[1.5px] border-borderInput rounded-md px-md py-[11px] mb-sm">
                <Text className="font-body-bold text-[10px] tracking-wider uppercase text-muted">Phone</Text>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                  placeholder="(405) 555-0134"
                  className="font-body-semibold text-[13.5px] text-ink mt-[2px] p-0"
                />
              </View>
            )}
          />
        ) : null}
        {errors.phone ? <Text className="text-[11px] text-danger mb-sm">{errors.phone.message}</Text> : null}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="bg-white border-[1.5px] border-borderInput rounded-md px-md py-[11px] mb-sm">
              <Text className="font-body-bold text-[10px] tracking-wider uppercase text-muted">Email or phone</Text>
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
        {errors.email ? <Text className="text-[11px] text-danger mb-sm">{errors.email.message}</Text> : null}

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="bg-white border-[1.5px] border-borderInput rounded-md px-md py-[11px] mb-lg">
              <Text className="font-body-bold text-[10px] tracking-wider uppercase text-muted">Password</Text>
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
        {errors.password ? <Text className="text-[11px] text-danger mb-md -mt-sm">{errors.password.message}</Text> : null}

        {!isRegister ? (
          <Pressable onPress={() => router.push({ pathname: '/(auth)/forgot-password', params: { role } })} className="self-end mb-md -mt-sm">
            <Text className="font-body-bold text-[11.5px] text-brandDeep">Forgot password?</Text>
          </Pressable>
        ) : null}

        {serverError ? (
          <View className="flex-row gap-sm items-start bg-dangerBg border border-dangerBorder rounded-md px-md py-[10px] mb-md">
            <Text style={{ color: colors.danger, fontSize: 13 }}>⚠</Text>
            <Text className="flex-1 font-body-semibold text-[12px] text-dangerText leading-[17px]">{serverError}</Text>
          </View>
        ) : null}

        <Button
          title={isRegister ? 'Create account' : 'Log in'}
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          className="mb-sm"
        />
        <Button
          title={isRegister ? 'I already have an account' : `Sign up as ${roleLabel}`}
          variant="secondary"
          onPress={() => { setServerError(''); setMode(isRegister ? 'login' : 'register'); }}
        />

        <Text className="font-body text-[11px] text-faint text-center mt-auto pt-2xl">
          One backend, one login — your role decides your dashboard.
        </Text>
      </View>
    </AuthShell>
  );
}
