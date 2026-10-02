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
} from 'react-native';
import { Link } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { supabase } from '../../lib/supabase';

const C = Colors.light;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    setErrorMsg('');
    if (!email.trim() || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setErrorMsg('Invalid login credentials. Do you have an account?');
      } else {
        setErrorMsg(error.message);
      }
    }
  };

  const hasError = errorMsg.length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <View style={styles.scrollContent}>
          
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.brand}>CJunctionFind</Text>
              <Text style={styles.subheading}>Staff Portal</Text>
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
                placeholder="Enter password"
                placeholderTextColor={C.textMuted}
                secureTextEntry
              />
            </View>

            <Pressable 
              style={({ pressed }) => [
                styles.primaryBtn, 
                pressed && styles.primaryBtnPressed,
                loading && styles.btnDisabled
              ]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={C.card} size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>Log In</Text>
              )}
            </Pressable>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/(auth)/signup" asChild>
                <Pressable hitSlop={10}>
                  {({ pressed }) => (
                    <Text style={[styles.linkText, pressed && styles.linkTextPressed]}>Sign up</Text>
                  )}
                </Pressable>
              </Link>
            </View>
          </View>

        </View>
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
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
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
    opacity: 0.7,
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
