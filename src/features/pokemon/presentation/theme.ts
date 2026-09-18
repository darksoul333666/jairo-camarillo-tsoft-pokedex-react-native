import { useColorScheme } from 'react-native';

export type AppColors = {
  background: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  onAccent: string;
  cacheBg: string;
  cacheText: string;
  skeleton: string;
};

const light: AppColors = {
  background: '#F2F4F7',
  surface: '#FFFFFF',
  text: '#101828',
  muted: '#667085',
  accent: '#2563EB',
  onAccent: '#FFFFFF',
  cacheBg: '#FEF0C7',
  cacheText: '#B54708',
  skeleton: '#E4E7EC',
};

const dark: AppColors = {
  background: '#121417',
  surface: '#1C1F24',
  text: '#F2F4F7',
  muted: '#98A2B3',
  accent: '#60A5FA',
  onAccent: '#0B1220',
  cacheBg: '#3F2A0F',
  cacheText: '#FEC84B',
  skeleton: '#2A3038',
};

export function useAppColors(): AppColors {
  return useColorScheme() === 'dark' ? dark : light;
}
