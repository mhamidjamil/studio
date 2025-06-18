export interface LedRequestParams {
  name?: string; // color name or hex
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

export const PREDEFINED_COLORS = [
  { name: "Red", value: "red" },
  { name: "Green", value: "green" },
  { name: "Blue", value: "blue" },
  { name: "Yellow", value: "yellow" },
  { name: "Cyan", value: "cyan" },
  { name: "Magenta", value: "magenta" },
  { name: "White", value: "white" },
  { name: "Orange", value: "orange" },
  { name: "Purple", value: "purple" },
  { name: "Pink", value: "pink" },
  { name: "Off", value: "off" },
];

export const LED_STYLES = ['solid', 'blink', 'fade'] as const;
export type LedStyle = typeof LED_STYLES[number];
