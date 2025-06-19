
"use client";

import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useServerUrl } from '@/hooks/useServerUrl';
import { useRequestHistory } from '@/hooks/useRequestHistory';
import { sendColorRequest, sendBrightnessRequest, resetLed as apiResetLed } from '@/lib/api';
import type { LedRequestParams, ApiMethod, LedStyle } from '@/lib/types';
import { PREDEFINED_COLORS, LED_STYLES } from '@/lib/types';
import { Palette, Zap, PowerOff, RefreshCcw, Lightbulb, Send, Settings2, Wand2 } from 'lucide-react';
import { ColorPickerInput } from './ColorPickerInput';
import { suggestRelevantColor as suggestRelevantColorAction } from '@/ai/flows/suggest-relevant-color';
import { useEffect } from 'react';
import { resolveColorToHexOrOff } from '@/lib/utils';

const formSchema = z.object({
  color: z.string().min(1, { message: "Color is required." }), // Will be hex or "off"
  style: z.enum(LED_STYLES).optional(),
  duration: z.coerce.number().min(0).optional(),
  brightness: z.coerce.number().min(0).max(100).optional(),
  method: z.enum(['GET', 'POST']).default('GET'),
});

type LedControlFormValues = z.infer<typeof formSchema>;

interface LedControlDashboardProps {
  initialValues?: Partial<LedControlFormValues>;
  onApplyConfiguration?: (config: LedRequestParams) => void;
}

export function LedControlDashboard({ initialValues, onApplyConfiguration }: LedControlDashboardProps) {
  const [serverUrl] = useServerUrl();
  const { addHistoryItem } = useRequestHistory();
  const { toast } = useToast();
  
  const defaultFormValues: LedControlFormValues = {
    color: PREDEFINED_COLORS.find(c => c.value === 'white')?.hex || '#ffffff', // Default to white's hex
    style: 'solid' as LedStyle,
    duration: 5,
    brightness: 80,
    method: 'GET' as ApiMethod,
  };

  const form = useForm<LedControlFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...defaultFormValues,
      ...(initialValues 
        ? { ...initialValues, color: resolveColorToHexOrOff(initialValues.color) } 
        : {}),
    },
  });

  useEffect(() => {
    if (initialValues) {
      const resolvedInitialValues: Partial<LedControlFormValues> = { ...initialValues };
      if (initialValues.color !== undefined) {
        resolvedInitialValues.color = resolveColorToHexOrOff(initialValues.color);
      }
      form.reset({ ...defaultFormValues, ...resolvedInitialValues });
    } else {
      form.reset(defaultFormValues);
    }
  }, [initialValues, form]);


  const onSubmit: SubmitHandler<LedControlFormValues> = async (data) => {
    if (!serverUrl) {
      toast({ title: 'Server URL not set', description: 'Please configure the server URL first.', variant: 'destructive' });
      return;
    }

    const params: LedRequestParams = {
      color: data.color, // Use 'color' as the key for the API
      style: data.style,
      time: data.duration,
      brightness: data.brightness,
    };
    
    if (onApplyConfiguration) {
        onApplyConfiguration(params);
        form.reset(params as LedControlFormValues); 
        return;
    }

    const response = await sendColorRequest(serverUrl, params, data.method as ApiMethod);

    if (response.success) {
      toast({ title: 'LED Updated', description: `Color set to ${data.color}.`, variant: 'default' });
      addHistoryItem({ ...params, method: data.method as ApiMethod, serverUrl, status: 'success', endpoint: '/color' });
    } else {
      toast({ title: 'Error Updating LED', description: response.message || 'Failed to update LED.', variant: 'destructive' });
      addHistoryItem({ ...params, method: data.method as ApiMethod, serverUrl, status: 'failure', endpoint: '/color' });
    }
  };

  const handleQuickAction = async (action: 'test' | 'off' | 'reset') => {
    if (!serverUrl) {
      toast({ title: 'Server URL not set', description: 'Please configure the server URL first.', variant: 'destructive' });
      return;
    }
    let response;
    let params: LedRequestParams = {};
    let endpoint = '/color';
    let successMessage = '';

    switch (action) {
      case 'test':
        params = { color: PREDEFINED_COLORS.find(c=> c.value === 'white')?.hex || '#ffffff', style: 'blink', time: 1, brightness: 50 };
        successMessage = 'LED Test signal sent.';
        response = await sendColorRequest(serverUrl, params, 'GET');
        break;
      case 'off':
        params = { color: 'off' }; // Use 'color' as the key
        successMessage = 'LED Turned Off.';
        response = await sendColorRequest(serverUrl, params, 'GET');
        break;
      case 'reset':
        endpoint = '/reset';
        successMessage = 'LED Reset to default.';
        response = await apiResetLed(serverUrl);
        // For reset, params might be empty or not relevant for history other than endpoint
        params = {}; // Reset params for history logging for /reset
        break;
    }

    if (response.success) {
      toast({ title: successMessage, variant: 'default' });
      addHistoryItem({ ...params, method: 'GET', serverUrl, status: 'success', endpoint });
    } else {
      toast({ title: `Error ${action}`, description: response.message || `Failed to ${action} LED.`, variant: 'destructive' });
      addHistoryItem({ ...params, method: 'GET', serverUrl, status: 'failure', endpoint });
    }
  };
  
  const handleAiSuggestColor = async () => {
    try {
      const result = await suggestRelevantColorAction({ currentDate: new Date().toISOString().split('T')[0] });
      form.setValue('color', result.colorSuggestion, { shouldValidate: true });
      toast({
        title: 'AI Color Suggestion',
        description: `Suggested: ${result.colorSuggestion}. Reason: ${result.reason}`,
      });
    } catch (error) {
      toast({
        title: 'AI Suggestion Failed',
        description: 'Could not get a color suggestion at this time.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Lightbulb className="h-6 w-6" />
          LED Controls
        </CardTitle>
        <CardDescription>
          Configure your LED color, style, duration, and brightness.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                   <ColorPickerInput value={field.value} onChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="button" variant="outline" onClick={handleAiSuggestColor} className="w-full sm:w-auto">
              <Wand2 className="mr-2 h-4 w-4" /> AI Suggest Color
            </Button>

            <FormField
              control={form.control}
              name="style"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Style</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col sm:flex-row gap-4"
                    >
                      {LED_STYLES.map(style => (
                        <FormItem key={style} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={style} />
                          </FormControl>
                          <FormLabel className="font-normal capitalize">
                            {style}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (seconds)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 5" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}/>
                    </FormControl>
                    <FormDescription>Optional. For blink/fade styles.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brightness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brightness ({field.value === undefined ? 'Not set' : field.value}%)</FormLabel>
                    <FormControl>
                       <Slider
                        defaultValue={[80]}
                        value={field.value === undefined ? [] : [field.value]}
                        max={100}
                        step={1}
                        onValueChange={(value) => field.onChange(value[0])}
                        aria-label="Brightness"
                      />
                    </FormControl>
                     <FormDescription>Optional. 0-100%.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>API Request Method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="GET" />
                        </FormControl>
                        <FormLabel className="font-normal">GET</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="POST" />
                        </FormControl>
                        <FormLabel className="font-normal">POST</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              <Send className="mr-2 h-5 w-5" /> Apply Configuration
            </Button>
            <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
              <Button type="button" variant="outline" onClick={() => handleQuickAction('test')}>
                <Palette className="mr-2 h-4 w-4" /> Test
              </Button>
              <Button type="button" variant="outline" onClick={() => handleQuickAction('off')}>
                <PowerOff className="mr-2 h-4 w-4" /> Off
              </Button>
              <Button type="button" variant="outline" onClick={() => handleQuickAction('reset')}>
                <RefreshCcw className="mr-2 h-4 w-4" /> Reset
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
