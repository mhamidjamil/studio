"use client";

import { useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { ServerConfig } from '@/components/ServerConfig';
import { LedControlDashboard } from '@/components/LedControlDashboard';
import { RequestHistory } from '@/components/RequestHistory';
import { AiColorSuggestion } from '@/components/AiColorSuggestion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LedRequestParams } from '@/lib/types';

export default function Home() {
  // State to pass configuration from History/AI to Dashboard
  const [configToApply, setConfigToApply] = useState<Partial<LedRequestParams> | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("control");

  const handleApplyConfigFromHistory = (config: LedRequestParams) => {
    setConfigToApply(config);
    setActiveTab("control"); // Switch to control tab
  };
  
  const handleApplyColorFromAI = (color: string) => {
    setConfigToApply(prev => ({ ...prev, color }));
    setActiveTab("control"); // Switch to control tab
  };


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
              key={JSON.stringify(configToApply)} // Force re-render with new initialValues
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
