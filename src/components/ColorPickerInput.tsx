
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PREDEFINED_COLORS } from "@/lib/types";
import { cn } from '@/lib/utils';

interface ColorPickerInputProps {
  value: string; // Current color value (hex or "off")
  onChange: (value: string) => void; // Function to call when color changes (hex or "off")
  label?: string;
  id?: string;
}

const isValidHex = (color: string): boolean => /^#([0-9a-f]{3}){1,2}$/i.test(color);

export function ColorPickerInput({ value, onChange, label = "Color", id = "color" }: ColorPickerInputProps) {
  const [colorInputMode, setColorInputMode] = useState<'predefined' | 'custom'>('predefined');
  // pickerHexValue is the hex for the <input type="color"> and text hex input.
  // It defaults to white if the actual value is "off" for picker usability.
  const [pickerHexValue, setPickerHexValue] = useState<string>('#ffffff');

  useEffect(() => {
    const lowerValue = value ? value.toLowerCase() : '#ffffff';

    if (lowerValue === 'off') {
      setColorInputMode('predefined');
      setPickerHexValue('#000000'); // Default picker to black when "Off" is active
    } else if (isValidHex(lowerValue)) {
      setPickerHexValue(lowerValue);
      const isPredefinedHex = PREDEFINED_COLORS.some(pc => pc.hex.toLowerCase() === lowerValue);
      if (isPredefinedHex) {
        setColorInputMode('predefined');
      } else {
        setColorInputMode('custom');
      }
    } else {
      // This case should ideally not happen if parent ensures `value` is hex or "off".
      // For robustness, treat unknown as custom white.
      setColorInputMode('custom');
      setPickerHexValue('#ffffff');
    }
  }, [value]);

  const handleModeChange = (newMode: 'predefined' | 'custom') => {
    setColorInputMode(newMode);
    if (newMode === 'custom') {
      // If switching to custom, ensure a valid hex is propagated from pickerHexValue
      if (isValidHex(pickerHexValue)) {
        onChange(pickerHexValue);
      } else {
        onChange('#ffffff'); // Default to white if pickerHexValue somehow became invalid
      }
    } else {
      // If switching to predefined, and current value is not among predefined hexes or "off",
      // select the first non-"off" predefined color.
      const currentIsPredefined = PREDEFINED_COLORS.some(pc => pc.hex.toLowerCase() === value.toLowerCase());
      if (!currentIsPredefined) {
        const firstPredefined = PREDEFINED_COLORS.find(c => c.hex !== 'off') || PREDEFINED_COLORS[0];
        onChange(firstPredefined.hex);
      } else {
         // If current value is already a predefined one, no need to call onChange,
         // just ensure mode is set. RHF value is already correct.
      }
    }
  };

  const handlePredefinedClick = (colorHex: string) => {
    onChange(colorHex); // This will call RHF's onChange, which updates `value` prop, triggering useEffect
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value.toLowerCase();
    setPickerHexValue(newHex); // Update internal picker state
    onChange(newHex); // Propagate change upwards
  };
  
  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setPickerHexValue(newText); // Update internal picker state
    if (isValidHex(newText)) {
      onChange(newText.toLowerCase()); // Propagate valid hex change upwards
    }
  };

  const actualDisplayHex = value === 'off' ? pickerHexValue : value;

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
            const isSelected = value.toLowerCase() === color.hex.toLowerCase();
            return (
              <Button
                key={color.value} // Keep original value for key stability
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePredefinedClick(color.hex)}
                className={cn(
                  "transition-all",
                  isSelected && "ring-2 ring-primary ring-offset-2",
                  color.hex === "off" && "border-dashed"
                )}
                aria-label={`Select color ${color.name}`}
              >
                {color.hex !== "off" && (
                  <span
                    className="inline-block w-4 h-4 rounded-full border border-muted-foreground"
                    style={{ backgroundColor: color.hex }}
                    aria-hidden="true"
                  />
                )}
                <span className={cn(color.hex !== "off" ? "ml-2" : "")}>
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
            value={actualDisplayHex === 'off' ? '#000000' : actualDisplayHex} // Picker shows black if main value is "off"
            onChange={handlePickerChange}
            className="p-1 h-10 w-14 min-w-[3.5rem] cursor-pointer"
            aria-label="Custom color picker"
            disabled={value === 'off' && colorInputMode === 'predefined'} // Disable if "Off" is truly selected via preset
          />
          <Input
            id={`${id}-hex-input`}
            type="text"
            value={actualDisplayHex === 'off' ? '' : actualDisplayHex} // Show actual hex, or empty if "off"
            onChange={handleHexInputChange}
            placeholder="#rrggbb"
            className="flex-grow font-mono text-sm"
            aria-label="Custom color hex input"
            maxLength={7}
            disabled={value === 'off' && colorInputMode === 'predefined'}
          />
        </div>
      )}
    </div>
  );
}
