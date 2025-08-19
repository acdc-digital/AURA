// EXTENSION INITIALIZER - Auto-register all extensions on app startup
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/extensions/ExtensionInitializer.tsx

"use client";

import { useEffect } from 'react';
import { extensionRegistry } from '@/lib/extensions/registry';
import { LogoGeneratorExtension } from '@/lib/extensions/logoGeneratorExtension';
import { MarketingOfficerExtension } from '@/lib/extensions/marketingOfficerExtension';
import { CampaignDirectorExtension } from '@/lib/extensions/campaignDirectorExtension';

export function ExtensionInitializer() {
  useEffect(() => {
    // Register all extensions
    const extensions = [
      new LogoGeneratorExtension(),
      new MarketingOfficerExtension(),
      new CampaignDirectorExtension(),
    ];

    extensions.forEach(extension => {
      extensionRegistry.register(extension);
    });

    console.log(`🧩 Extension system initialized with ${extensions.length} extensions`);
  }, []);

  return null; // This component doesn't render anything
}

export default ExtensionInitializer;
