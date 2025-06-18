"use client";

import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PREDEFINED_COLORS } from "@/lib/types";
import { cn } from '@/lib/utils';

interface ColorPickerInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  id?: string;
}

export function ColorPickerInput({ value, onChange, label = "Color", id = "color" }: ColorPickerInputProps) {
  const handlePredefinedColorClick = (colorValue: string) => {
    onChange(colorValue);
  };

  const isValidHex = (color: string) => /^#([0-9A-F]{3}){1,2}$/i.test(color);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {PREDEFINED_COLORS.map((color) => (
          <Button
            key={color.value}
            variant="outline"
            size="sm"
            onClick={() => handlePredefinedColorClick(color.value)}
            className={cn(
              "transition-all",
              value === color.value && "ring-2 ring-primary ring-offset-2",
              color.value === "off" && "border-dashed"
            )}
            style={color.value !== "off" && !PREDEFINED_COLORS.find(pc => pc.value === color.value.toLowerCase() && pc.value !== color.value) && !isValidHex(color.value) ? { backgroundColor: color.value, color: '#fff' } : {}}
            aria-label={`Select color ${color.name}`}
          >
            {color.value === "off" ? "Off" : 
             color.value.startsWith("#") || PREDEFINED_COLORS.some(pc => pc.value === color.value.toLowerCase()) ? (
              <span
                className="inline-block w-4 h-4 rounded-full border border-muted-foreground"
                style={{ backgroundColor: color.value }}
                aria-hidden="true"
              />
            ) : null}
            <span className="ml-2">{color.name}</span>
          </Button>
        ))}
      </div>
      <Input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., red or #FF0000"
        aria-label="Color input (name or hex)"
      />
    </div>
  );
}
