
"use client";

import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { ServerConfig } from '@/components/ServerConfig';
import { LedControlDashboard } from '@/components/LedControlDashboard';
import { RequestHistory } from '@/components/RequestHistory';
import { AiColorSuggestion } from '@/components/AiColorSuggestion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LedRequestParams } from '@/lib/types';
import { resolveColorToHexOrOff } from '@/lib/utils';

export default function Home() {
  const [configToApply, setConfigToApply] = useState<Partial<LedRequestParams> | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("control");

  const handleApplyConfigFromHistory = (config: LedRequestParams) => {
    // Assuming history items already store color as hex or "off" due to new saving logic
    setConfigToApply(config);
    setActiveTab("control"); 
  };
  
  const handleApplyColorFromAI = (color: string) => {
    // AI flow now returns hex or "off", but resolve just in case for robustness
    const resolvedColor = resolveColorToHexOrOff(color);
    setConfigToApply(prev => ({ ...prev, color: resolvedColor }));
    setActiveTab("control"); 
  };

  // Effect to clear configToApply after LedControlDashboard has used it
  // This ensures subsequent navigations to the control tab don't re-apply old config
  useEffect(() => {
    if (configToApply && activeTab === "control") {
      // Set a timeout to clear it after the dashboard likely has re-rendered
      // This is a bit of a workaround for direct prop passing for one-time application
      const timer = setTimeout(() => {
        setConfigToApply(undefined);
      }, 100); 
      return () => clearTimeout(timer);
    }
  }, [configToApply, activeTab]);


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
        <ServerConfig />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 mb-4">
            <TabsTrigger value="control">LED Control</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="ai">AI Color</TabsTrigger>
          </TabsList>
          
          <TabsContent value="control">
            <LedControlDashboard 
              key={configToApply ? JSON.stringify(configToApply) : 'default'} // Force re-render with new initialValues
              initialValues={configToApply} 
            />
          </TabsContent>
          <TabsContent value="history">
            <RequestHistory onApplyConfig={handleApplyConfigFromHistory} />
          </TabsContent>
          <TabsContent value="ai">
            <AiColorSuggestion onApplyColor={handleApplyColorFromAI} />
          </TabsContent>
        </Tabs>
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        LED Remote App &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
