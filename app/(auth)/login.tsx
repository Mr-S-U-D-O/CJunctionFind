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
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { supabase } from '../../lib/supabase';

const C = Colors.light;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
          
          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Ionicons name="diamond" size={32} color={C.accent} />
            </View>
            <Text style={styles.brand}>CJunctionFind</Text>
            <Text style={styles.subheading}>Staff Portal • 2026 Edition</Text>
          </View>

          <View style={styles.card}>
            {hasError && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={20} color={C.error} style={{ marginRight: 8 }} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputWrapper, hasError && styles.inputError]}>
                <Ionicons name="mail-outline" size={20} color="#737373" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setErrorMsg(''); }}
                  placeholder="you@clothingjunction.com"
                  placeholderTextColor="#525252"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrapper, hasError && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color="#737373" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setErrorMsg(''); }}
                  placeholder="Enter your password"
                  placeholderTextColor="#525252"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#737373" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.primaryBtn, loading && styles.btnDisabled]} 
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>Authenticate</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>New to the team? </Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity hitSlop={10}>
                  <Text style={styles.linkText}>Register here</Text>
                </TouchableOpacity>
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
    backgroundColor: '#000000', // True black for premium dark mode
  },
  kav: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#171717',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  brand: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    color: '#FFF',
    letterSpacing: -1,
  },
  subheading: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: C.accent, // Gold accent
    marginTop: 8,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#111111',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#262626',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    color: C.error,
    fontSize: 13,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#A3A3A3',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#FFF',
    height: '100%',
  },
  eyeBtn: {
    padding: 4,
  },
  inputError: {
    borderColor: C.error,
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
  },
  primaryBtn: {
    height: 56,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderRadius: 14,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    fontFamily: 'Inter_700Bold',
    color: '#000', 
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
    color: '#737373',
  },
  linkText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: C.accent,
  },
});
