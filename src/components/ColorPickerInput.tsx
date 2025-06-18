
"use client";

import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PREDEFINED_COLORS } from "@/lib/types";
import { cn } from '@/lib/utils';

interface ColorPickerInputProps {
  value: string; // Current color value (name or hex)
  onChange: (value: string) => void; // Function to call when color changes
  label?: string;
  id?: string;
}

const isValidHex = (color: string) => /^#([0-9A-F]{3}){1,2}$/i.test(color);
const findPredefinedColorByValue = (value: string) =>
  PREDEFINED_COLORS.find(pc => pc.value.toLowerCase() === value.toLowerCase());

export function ColorPickerInput({ value, onChange, label = "Color", id = "color" }: ColorPickerInputProps) {
  const getInitialMode = () => {
    const isHex = isValidHex(value);
    const isPredefined = !!findPredefinedColorByValue(value);
    if (isHex && !isPredefined) return 'custom';
    return 'predefined';
  };

  const [colorInputMode, setColorInputMode] = useState<'predefined' | 'custom'>(getInitialMode);
  const [pickerHexValue, setPickerHexValue] = useState<string>(() => isValidHex(value) ? value : '#FFFFFF'); // Default to white

  useEffect(() => {
    const isHex = isValidHex(value);
    const isPredefined = !!findPredefinedColorByValue(value);

    if (isHex && !isPredefined) {
      setColorInputMode('custom');
      setPickerHexValue(value);
    } else { 
      setColorInputMode('predefined');
      if (isHex) { 
        setPickerHexValue(value);
      }
    }
  }, [value]);

  const handleModeChange = (newMode: 'predefined' | 'custom') => {
    setColorInputMode(newMode);
    if (newMode === 'custom') {
      if (isValidHex(value)) {
        onChange(value);
        setPickerHexValue(value);
      } else {
        // If current value is a name, switch to picker's current/default hex
        // Ensure pickerHexValue is up-to-date before calling onChange
        const currentPickerVal = isValidHex(pickerHexValue) ? pickerHexValue : '#FFFFFF';
        setPickerHexValue(currentPickerVal);
        onChange(currentPickerVal);
      }
    } else { 
      const predefined = findPredefinedColorByValue(value);
      if (!predefined && isValidHex(value)) {
        const firstPredefined = PREDEFINED_COLORS.find(c => c.value !== 'off') || PREDEFINED_COLORS[0];
        onChange(firstPredefined.value);
      }
    }
  };

  const handlePredefinedClick = (colorButtonValue: string) => {
    onChange(colorButtonValue); // This will also trigger the useEffect above
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setPickerHexValue(newHex);
    onChange(newHex); // This will also trigger the useEffect to set mode to 'custom' if needed
  };
  
  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setPickerHexValue(newText); 
    if (isValidHex(newText)) {
      onChange(newText); // This will also trigger the useEffect
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center mb-1">
        <Label htmlFor={id} className="mb-0">{label}</Label>
        <RadioGroup
          value={colorInputMode}
          onValueChange={handleModeChange}
          className="flex gap-3"
        >
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="predefined" id={`${id}-mode-predefined`} aria-label="Select from predefined colors"/>
            <Label htmlFor={`${id}-mode-predefined`} className="font-normal text-xs">Presets</Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="custom" id={`${id}-mode-custom`} aria-label="Select from color picker"/>
            <Label htmlFor={`${id}-mode-custom`} className="font-normal text-xs">Picker</Label>
          </div>
        </RadioGroup>
      </div>

      {colorInputMode === 'predefined' ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {PREDEFINED_COLORS.map((color) => {
            const isSelected = value.toLowerCase() === color.value.toLowerCase();
            return (
              <Button
                key={color.value}
                type="button" // Important for react-hook-form
                variant="outline"
                size="sm"
                onClick={() => handlePredefinedClick(color.value)}
                className={cn(
                  "transition-all",
                  isSelected && "ring-2 ring-primary ring-offset-2",
                  color.value === "off" && "border-dashed"
                )}
                aria-label={`Select color ${color.name}`}
              >
                {color.value !== "off" && (
                  <span
                    className="inline-block w-4 h-4 rounded-full border border-muted-foreground"
                    style={{ backgroundColor: color.value }} // This works for CSS color names and hex values
                    aria-hidden="true"
                  />
                )}
                <span className={cn(color.value !== "off" ? "ml-2" : "")}>
                  {color.name}
                </span>
              </Button>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-2 pt-1">
          <Input
            id={`${id}-color-picker`}
            type="color"
            value={pickerHexValue} // Use internal state for controlled color input
            onChange={handlePickerChange}
            className="p-1 h-10 w-14 min-w-[3.5rem] cursor-pointer" // min-w to prevent squishing
            aria-label="Custom color picker"
          />
          <Input
            id={`${id}-hex-input`}
            type="text"
            value={pickerHexValue} // Show the current hex from picker/input
            onChange={handleHexInputChange} // Allow direct hex input
            placeholder="#RRGGBB"
            className="flex-grow font-mono text-sm" // Smaller text for hex
            aria-label="Custom color hex input"
            maxLength={7}
          />
        </div>
      )}
    </div>
  );
}

