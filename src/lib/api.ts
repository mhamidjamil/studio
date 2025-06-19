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
    let errorMessage = 'Network error or server unreachable.';
    if (error instanceof Error) {
        errorMessage = error.message;
        if (error.message.toLowerCase().includes('failed to fetch')) {
            errorMessage = "Network error or CORS issue. Please check the server URL, ensure the server is running, and check your browser's developer console for CORS errors if connecting to a remote server.";
        }
    }
    return { success: false, message: errorMessage };
  }
}

export async function sendColorRequest(
  baseUrl: string,
  params: LedRequestParams,
  method: ApiMethod
): Promise<ApiResponse> {
  // The API expects 'color' as the parameter name for the color value.
  // LedRequestParams uses 'color' for the color value.
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
    // If server responds with success (e.g. 200 OK) even without specific JSON,
    // we can consider it a basic success for the test.
    const response = await makeRequest(baseUrl, '/ping', 'GET');
    if (response.success) {
        // Check if server explicitly says it's online
        if (response.data && response.data.status === 'online') {
            return { success: true, message: "Server confirmed online status.", data: response.data };
        }
        // If data is present but not the specific status, or no data but success, still OK for basic test
        return { success: true, message: response.message || "Successfully connected to the server (ping successful).", data: response.data };
    }
    return response; // Return the original failed response
}

export async function resetLed(baseUrl: string): Promise<ApiResponse> {
  return makeRequest(baseUrl, '/reset', 'GET');
}
