import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Pressable,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { supabase } from '../../lib/supabase';

const C = Colors.light;

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const allValid = hasMinLength && hasNumber && email.includes('@');

  const handleSignup = async () => {
    setErrorMsg('');
    if (!email.trim() || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }
    if (!allValid) {
      setErrorMsg('Please ensure all password requirements are met.');
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        setErrorMsg('An account with this email already exists. Try logging in.');
      } else {
        setErrorMsg(error.message);
      }
    }
  };

  const hasError = errorMsg.length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.brand}>CJunctionFind</Text>
              <Text style={styles.subheading}>Create Staff Account</Text>
            </View>

            {hasError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input, hasError && styles.inputError]}
                value={email}
                onChangeText={(t) => { setEmail(t); setErrorMsg(''); }}
                placeholder="you@clothingjunction.com"
                placeholderTextColor={C.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, hasError && styles.inputError]}
                value={password}
                onChangeText={(t) => { setPassword(t); setErrorMsg(''); }}
                placeholder="Create a password"
                placeholderTextColor={C.textMuted}
                secureTextEntry
              />
              <View style={styles.validationBox}>
                <View style={styles.validationRow}>
                  <View style={[styles.dot, hasMinLength && styles.dotValid]} />
                  <Text style={[styles.validationText, hasMinLength && styles.validationTextValid]}>8+ characters</Text>
                </View>
                <View style={styles.validationRow}>
                  <View style={[styles.dot, hasNumber && styles.dotValid]} />
                  <Text style={[styles.validationText, hasNumber && styles.validationTextValid]}>1+ number</Text>
                </View>
              </View>
            </View>

            <Pressable 
              style={({ pressed }) => [
                styles.primaryBtn, 
                pressed && !(!allValid || loading) && styles.primaryBtnPressed,
                (!allValid || loading) && styles.btnDisabled
              ]} 
              onPress={handleSignup}
              disabled={!allValid || loading}
            >
              {loading ? (
                <ActivityIndicator color={C.card} size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>Sign Up</Text>
              )}
            </Pressable>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable hitSlop={10}>
                  {({ pressed }) => (
                    <Text style={[styles.linkText, pressed && styles.linkTextPressed]}>Log in</Text>
                  )}
                </Pressable>
              </Link>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.background,
  },
  kav: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 32,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brand: {
    fontFamily: 'Inter_700Bold',
    fontSize: 26,
    color: C.text,
    letterSpacing: -0.8,
  },
  subheading: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: C.textMuted,
    marginTop: 6,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    color: C.error,
    fontSize: 13,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: C.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    fontFamily: 'Inter_400Regular',
    height: 56,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: C.text,
  },
  inputError: {
    borderColor: C.error,
    backgroundColor: '#FEF2F2',
  },
  validationBox: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    marginLeft: 4,
  },
  validationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.border,
  },
  dotValid: {
    backgroundColor: C.success,
  },
  validationText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: C.textMuted,
  },
  validationTextValid: {
    color: C.text,
  },
  primaryBtn: {
    height: 56,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderRadius: 14,
  },
  primaryBtnPressed: {
    backgroundColor: C.accent,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    fontFamily: 'Inter_600SemiBold',
    color: C.card, 
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: C.textMuted,
  },
  linkText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: C.primary,
  },
  linkTextPressed: {
    color: C.accent,
  },
});
