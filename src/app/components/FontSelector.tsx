import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useTheme, AVAILABLE_FONTS, FontName } from '../context/ThemeContext';

export default function FontSelector() {
  const { font, setFont, availableFonts, theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const fontNames = Object.keys(availableFonts) as FontName[];

  const handleFontSelect = (selectedFont: FontName) => {
    setFont(selectedFont);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-bold transition-all ${
          theme === 'dark' 
            ? 'bg-card border-border text-foreground hover:bg-muted' 
            : 'bg-card border-border text-foreground hover:bg-muted'
        }`}
      >
        <span>{font}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-full left-0 mt-2 w-64 rounded-xl shadow-lg border-2 z-50 max-h-80 overflow-y-auto ${
          theme === 'dark' 
            ? 'bg-card border-border' 
            : 'bg-card border-border'
        }`}>
          <div className="p-2">
            {fontNames.map((fontName) => (
              <button
                key={fontName}
                onClick={() => handleFontSelect(fontName)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  font === fontName
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : theme === 'dark'
                      ? 'hover:bg-muted text-foreground'
                      : 'hover:bg-muted text-foreground'
                }`}
              >
                <span>{fontName}</span>
                {font === fontName && <Check className="w-4 h-4 text-red-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
