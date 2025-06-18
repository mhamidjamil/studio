import type { LedRequestParams, GpioRequestParams, ApiMethod, ApiResponse } from './types';

async function makeRequest(
  baseUrl: string,
  endpoint: string,
  method: ApiMethod,
  params?: Record<string, any>
): Promise<ApiResponse> {
  let url = `${baseUrl}${endpoint}`;

  const options: RequestInit = {
    method,
    headers: {},
  };

  if (method === 'GET' && params) {
    const query = new URLSearchParams();
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        query.append(key, params[key].toString());
      }
    }
    if (query.toString()) {
      url += `?${query.toString()}`;
    }
  } else if (method === 'POST' && params) {
    (options.headers as Record<string, string>)['Content-Type'] = 'application/json';
    options.body = JSON.stringify(params);
  }
  
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      return { success: false, message: errorData?.message || `HTTP error ${response.status}`, data: errorData };
    }
    // For /ping and /reset, the response might be JSON or empty for other successful calls
    // Try to parse JSON, if it fails but status is OK, assume success with no specific data
    try {
        const data = await response.json();
        return { success: true, data };
    } catch (e) {
        // If response is OK but not JSON (e.g. 204 No Content, or simple text)
        if (response.ok) {
           return { success: true, message: "Request successful, no JSON response." };
        }
        return { success: false, message: "Failed to parse JSON response."};
    }
  } catch (error) {
    console.error('API request failed:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Network error' };
  }
}

export async function sendColorRequest(
  baseUrl: string,
  params: LedRequestParams,
  method: ApiMethod
): Promise<ApiResponse> {
  return makeRequest(baseUrl, '/color', method, params);
}

export async function sendBrightnessRequest(
  baseUrl: string,
  value: number,
): Promise<ApiResponse> {
  return makeRequest(baseUrl, '/brightness', 'GET', { value });
}

export async function sendGpioRequest(
  baseUrl: string,
  params: GpioRequestParams
): Promise<ApiResponse> {
  return makeRequest(baseUrl, '/gpio', 'GET', params);
}

export async function testConnection(baseUrl: string): Promise<ApiResponse> {
  return makeRequest(baseUrl, '/ping', 'GET');
}

export async function resetLed(baseUrl: string): Promise<ApiResponse> {
  return makeRequest(baseUrl, '/reset', 'GET');
}
