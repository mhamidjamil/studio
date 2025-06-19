
"use client";

import { useRequestHistory } from '@/hooks/useRequestHistory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { History, Trash2, CheckCircle, AlertCircle, CornerDownLeft } from 'lucide-react';
import type { LedRequestParams, RequestHistoryItem } from '@/lib/types'; // Import RequestHistoryItem explicitly

interface RequestHistoryProps {
  onApplyConfig: (config: LedRequestParams) => void;
}

export function RequestHistory({ onApplyConfig }: RequestHistoryProps) {
  const { history, clearHistory } = useRequestHistory();

  const handleReapply = (item: RequestHistoryItem) => { // Use RequestHistoryItem type
    // Construct LedRequestParams from RequestHistoryItem for re-application
    const configToApply: LedRequestParams = {
      color: item.color,
      style: item.style,
      time: item.time,
      brightness: item.brightness,
    };
    onApplyConfig(configToApply);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <History className="h-6 w-6" />
          Request History
        </CardTitle>
        <CardDescription>
          View your last 10 LED control requests. Click an item to re-apply its settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No history yet. Make some changes to see them here!</p>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <ul className="space-y-3">
              {history.map((item) => (
                <li key={item.id} className="p-3 border rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-muted/50 transition-colors">
                  <div className="flex-grow space-y-1">
                    <div className="flex items-center gap-2">
                       {item.status === 'success' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-red-500" />}
                      <span className="font-semibold capitalize">{item.color || 'N/A'}</span>
                      {item.style && <Badge variant="secondary" className="capitalize">{item.style}</Badge>}
                      <Badge variant="outline">{item.method}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.brightness !== undefined ? `Brightness: ${item.brightness}%` : ''}
                      {item.brightness !== undefined && item.time !== undefined ? ' - ' : ''}
                      {item.time !== undefined ? `Duration: ${item.time}s` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleReapply(item)} aria-label="Re-apply configuration">
                    <CornerDownLeft className="h-4 w-4 mr-1" /> Re-apply
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
      {history.length > 0 && (
        <CardFooter>
          <Button variant="destructive" onClick={clearHistory} className="w-full sm:w-auto">
            <Trash2 className="mr-2 h-4 w-4" /> Clear History
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
