
"use client";

import { useState, useEffect } from 'react';
import { useServerUrl } from '@/hooks/useServerUrl';
import { testConnection } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Zap, Wifi, WifiOff } from 'lucide-react';

export function ServerConfig() {
  const [currentUrl, setCurrentUrl] = useServerUrl();
  const [inputUrl, setInputUrl] = useState(currentUrl);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failure'>('idle');
  const { toast } = useToast();

  useEffect(() => {
    setInputUrl(currentUrl);
  }, [currentUrl]);


  const handleSaveUrl = () => {
    setCurrentUrl(inputUrl);
    setConnectionStatus('idle'); // Reset connection status when URL changes
    toast({
      title: 'Server URL Saved',
      description: `Server URL updated to: ${inputUrl}`,
      variant: 'default',
    });
  };

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    const response = await testConnection(inputUrl);

    if (response.success) { // This means HTTP status was OK (e.g., 200)
      setConnectionStatus('success');
      const serverMessage = response.data?.status === 'online'
        ? 'Server confirmed online status.'
        : (response.message || 'Successfully connected to the LED server.');
      toast({
        title: 'Connection Successful',
        description: serverMessage,
        variant: 'default',
        action: <CheckCircle className="text-green-500" />,
      });
    } else {
      setConnectionStatus('failure');
      toast({
        title: 'Connection Failed',
        description: response.message || 'Could not connect to the server. Please check the URL and ensure the server is running.',
        variant: 'destructive',
        action: <AlertCircle className="text-red-500" />,
      });
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Zap className="h-6 w-6" />
          Server Configuration
        </CardTitle>
        <CardDescription>
          Set the URL for your LED controller server. (e.g., http://localhost:5000 or http://your-pi-ip:5000)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="serverUrl">Server URL</Label>
          <div className="flex gap-2">
            <Input
              id="serverUrl"
              type="url"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                setConnectionStatus('idle'); // Reset status on URL change
              }}
              placeholder="e.g., http://192.168.1.100:5000"
              aria-label="Server URL"
            />
            <Button onClick={handleSaveUrl} variant="outline" disabled={inputUrl === currentUrl}>Save</Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <Button onClick={handleTestConnection} disabled={connectionStatus === 'testing' || !inputUrl}>
          {connectionStatus === 'testing' ? 'Testing...' : (connectionStatus === 'success' ? 'Test Again' : 'Test Connection')}
        </Button>
        {connectionStatus === 'success' && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Wifi className="h-5 w-5" />
            <span>Connected</span>
          </div>
        )}
        {connectionStatus === 'failure' && (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <WifiOff className="h-5 w-5" />
            <span>Connection Failed</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

