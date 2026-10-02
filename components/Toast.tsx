import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

const ICONS: Record<ToastType, string> = {
  success: 'checkmark-circle',
  error: 'close-circle',
  info: 'information-circle',
};

const COLORS: Record<ToastType, { bg: string; text: string; icon: string }> = {
  success: { bg: '#0F2310', text: '#4ADE80', icon: '#4ADE80' },
  error: { bg: '#2D0F0F', text: '#F87171', icon: '#F87171' },
  info: { bg: '#0F1B2D', text: '#60A5FA', icon: '#60A5FA' },
};

export default function Toast({
  message,
  type = 'success',
  visible,
  onHide,
  duration = 2800,
}: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(opacity, { toValue: 1, useNativeDriver: true, speed: 20 }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 20 }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -20, duration: 250, useNativeDriver: true }),
        ]).start(onHide);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  if (!visible) return null;

  const palette = COLORS[type];

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: palette.bg, opacity, transform: [{ translateY }] },
      ]}
    >
      <Ionicons name={ICONS[type] as any} size={20} color={palette.icon} style={{ marginRight: 10 }} />
      <Text style={[styles.message, { color: palette.text }]} numberOfLines={2}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
