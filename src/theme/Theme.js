import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Theme = {
    colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        background: '#0F172A',
        surface: '#1E293B',
        border: '#334155',
        text: 'white',
        textMuted: '#94A3B8',
        white: '#FFFFFF',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 20, // This is your standard horizontal padding
        xl: 24,
        xxl: 32,
    },
    layout: {
        windowWidth: width,
        windowHeight: height,
        screenPadding: 20, // Reusable horizontal padding constant
    }
};
