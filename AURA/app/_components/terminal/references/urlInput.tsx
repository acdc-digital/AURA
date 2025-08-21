// URL Input Component for Onboarding
// /Users/matthewsimon/Projects/eac/eac/app/_components/terminal/_components/urlInput.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
}

export function UrlInput({ onSubmit, isLoading = false }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const validateUrl = (url: string): boolean => {
    try {
      // Add protocol if missing
      const urlToTest = url.startsWith('http://') || url.startsWith('https://') 
        ? url 
        : `https://${url}`;
      
      new URL(urlToTest);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    if (!validateUrl(url.trim())) {
      setError("Please enter a valid URL (e.g., example.com or https://example.com)");
      return;
    }

    setError("");
    
    // Ensure URL has protocol
    const formattedUrl = url.trim().startsWith('http://') || url.trim().startsWith('https://') 
      ? url.trim() 
      : `https://${url.trim()}`;
    
    onSubmit(formattedUrl);
  };

  return (
    <div className="p-4 border border-[#333] rounded-md bg-[#1e1e1e] space-y-4">
      <div className="space-y-2">
        <Label htmlFor="brand-url" className="text-sm font-medium text-[#cccccc]">
          Brand URL for Inspiration
        </Label>
        <p className="text-xs text-[#999999]">
          Enter your website URL so we can analyze your brand and create personalized instructions for content creation.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <Input
            id="brand-url"
            type="text"
            placeholder="example.com or https://example.com"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(""); // Clear error on change
            }}
            disabled={isLoading}
            className="bg-[#2d2d2d] border-[#404040] text-[#cccccc] placeholder-[#666666]"
          />
          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}
        </div>
        
        <Button 
          type="submit" 
          disabled={isLoading || !url.trim()}
          className="w-full bg-[#0e639c] hover:bg-[#1177bb] text-white"
        >
          {isLoading ? "Analyzing Brand..." : "Analyze Brand & Create Instructions"}
        </Button>
      </form>
      
      <div className="text-xs text-[#666666] space-y-1">
        <p>✨ What happens next:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>We'll analyze your website's design and content</li>
          <li>Extract your brand colors, fonts, and style</li>
          <li>Generate custom instructions for consistent content creation</li>
          <li>Save everything to your personalized workspace</li>
        </ul>
      </div>
    </div>
  );
}
