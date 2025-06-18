
export interface LedRequestParams {
  name?: string; // color name or hex, will become hex or "off"
  style?: 'solid' | 'blink' | 'fade';
  time?: number; // duration in seconds
  brightness?: number; // 0-100
}

export interface GpioRequestParams {
  pin: number;
  state: 0 | 1;
}

export type ApiMethod = 'GET' | 'POST';

export interface RequestHistoryItem extends LedRequestParams {
  id: string;
  timestamp: string;
  method: ApiMethod;
  serverUrl: string; // To know which server it was sent to
  status: 'success' | 'failure';
  endpoint: string; // e.g., /color, /brightness
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface PredefinedColor {
  name: string;
  value: string; // Original value, can be name or special string
  hex: string;   // Hex code or special string like "off"
}

export const PREDEFINED_COLORS: PredefinedColor[] = [
  { name: "Red", value: "red", hex: "#ff0000" },
  { name: "Green", value: "green", hex: "#008000" },
  { name: "Blue", value: "blue", hex: "#0000ff" },
  { name: "Yellow", value: "yellow", hex: "#ffff00" },
  { name: "Cyan", value: "cyan", hex: "#00ffff" },
  { name: "Magenta", value: "magenta", hex: "#ff00ff" },
  { name: "White", value: "white", hex: "#ffffff" },
  { name: "Orange", value: "orange", hex: "#ffa500" },
  { name: "Purple", value: "purple", hex: "#800080" },
  { name: "Pink", value: "pink", hex: "#ffc0cb" },
  { name: "Off", value: "off", hex: "off" },
];

export const LED_STYLES = ['solid', 'blink', 'fade'] as const;
export type LedStyle = typeof LED_STYLES[number];
