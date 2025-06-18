import { ThemeToggle } from "@/components/ThemeToggle";
import { Lightbulb } from "lucide-react";

export function AppHeader() {
  return (
    <header className="py-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold font-headline text-primary">
            LED Remote
          </h1>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
