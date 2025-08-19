// EXTENSIONS PANEL - Extension marketplace and activation UI
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/activity/_components/extensions/ExtensionsPanel.tsx

"use client";

import { useExtensionStore } from "@/lib/extensions/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { 
  Crown, 
  CheckCircle2, 
  ShoppingCart, 
  Loader2, 
  Info,
  Zap,
  Star
} from "lucide-react";

export default function ExtensionsPanel() {
  const { user } = useUser();
  const { 
    selectedExtensionId,
    purchasingExtensionId,
    availableExtensions,
    purchasedExtensions,
    setSelectedExtension,
    refreshExtensions,
    purchaseExtension,
    hasAccess,
    isPurchased,
  } = useExtensionStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshExtensions();
    setLoading(false);
  }, [refreshExtensions]);

  const handleExtensionSelect = (extensionId: string) => {
    setSelectedExtension(
      selectedExtensionId === extensionId ? undefined : extensionId
    );
  };

  const handlePurchase = async (extensionId: string) => {
    if (!user?.id) return;
    
    try {
      const success = await purchaseExtension(extensionId, user.id);
      if (success) {
        console.log(`✅ Successfully purchased extension: ${extensionId}`);
      } else {
        console.log(`⚠️ Purchase failed or already owned: ${extensionId}`);
      }
    } catch (error) {
      console.error('Purchase error:', error);
    }
  };

  const getExtensionIcon = (icon: string) => {
    return <span className="text-lg">{icon}</span>;
  };

  const getExtensionStatusColor = (extensionId: string) => {
    if (!user?.id) return "text-[#858585]";
    
    const purchased = isPurchased(extensionId);
    const hasExtensionAccess = hasAccess(extensionId, user.id);
    
    if (purchased || hasExtensionAccess) return "text-[#4ec9b0]";
    return "text-[#d4af37]"; // Premium gold
  };

  const getExtensionBadge = (extension: { id: string; isPremium: boolean }) => {
    if (!user?.id) {
      return (
        <Badge variant="outline" className="text-xs bg-[#858585]/10 border-[#858585]/20 text-[#858585]">
          Sign In Required
        </Badge>
      );
    }

    const purchased = isPurchased(extension.id);
    const hasExtensionAccess = hasAccess(extension.id, user.id);

    if (purchased || hasExtensionAccess) {
      return (
        <Badge variant="outline" className="text-xs bg-[#4ec9b0]/10 border-[#4ec9b0]/20 text-[#4ec9b0]">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Owned
        </Badge>
      );
    }

    if (extension.isPremium) {
      return (
        <Badge variant="outline" className="text-xs bg-[#d4af37]/10 border-[#d4af37]/20 text-[#d4af37]">
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="text-xs bg-[#4ec9b0]/10 border-[#4ec9b0]/20 text-[#4ec9b0]">
        Free
      </Badge>
    );
  };

  const getPurchaseButton = (extension: { id: string; isPremium: boolean; pricing: { price: number } }) => {
    if (!user?.id) {
      return (
        <Button
          variant="outline"
          size="sm"
          disabled
          className="text-xs h-8 bg-[#858585]/10 border-[#858585]/20 text-[#858585]"
        >
          Sign In to Purchase
        </Button>
      );
    }

    const purchased = isPurchased(extension.id);
    const hasExtensionAccess = hasAccess(extension.id, user.id);
    const isPurchasing = purchasingExtensionId === extension.id;

    if (purchased || hasExtensionAccess) {
      return (
        <Button
          variant="outline"
          size="sm"
          disabled
          className="text-xs h-8 bg-[#4ec9b0]/10 border-[#4ec9b0]/20 text-[#4ec9b0]"
        >
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Owned
        </Button>
      );
    }

    if (!extension.isPremium) {
      return (
        <Button
          variant="outline"
          size="sm"
          disabled
          className="text-xs h-8 bg-[#4ec9b0]/10 border-[#4ec9b0]/20 text-[#4ec9b0]"
        >
          Free Extension
        </Button>
      );
    }

    return (
      <Button
        variant="outline"
        size="sm"
        disabled={isPurchasing}
        onClick={(e) => {
          e.stopPropagation();
          handlePurchase(extension.id);
        }}
        className="text-xs h-8 bg-[#d4af37]/10 border-[#d4af37]/20 text-[#d4af37] hover:bg-[#d4af37]/20"
      >
        {isPurchasing ? (
          <>
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ShoppingCart className="w-3 h-3 mr-1" />
            ${extension.pricing.price}
          </>
        )}
      </Button>
    );
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#858585]" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#454545]">
        <h3 className="text-[#cccccc] font-medium mb-2 flex items-center gap-2">
          🧩 AI EXTENSIONS
        </h3>
        <p className="text-[#858585] text-xs">
          Professional AI-powered tools for marketing automation and design
        </p>
      </div>

      {/* Extensions List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {availableExtensions.map((extension) => {
            const isSelected = selectedExtensionId === extension.id;

            return (
              <div
                key={extension.id}
                className={`rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#007acc] bg-[#007acc]/5"
                    : "border-[#454545] bg-[#2d2d2d] hover:border-[#606060] hover:bg-[#3c3c3c]"
                }`}
                onClick={() => handleExtensionSelect(extension.id)}
              >
                <div className="p-3">
                  {/* Extension Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div className={`${getExtensionStatusColor(extension.id)} transition-colors`}>
                        {getExtensionIcon(extension.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[#cccccc] text-sm font-medium truncate">
                          {extension.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          {getExtensionBadge(extension)}
                          <span className="text-[#858585] text-xs">
                            {extension.tools.length} tools
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Purchase/Status Button */}
                    <div className="ml-2">
                      {getPurchaseButton(extension)}
                    </div>
                  </div>

                  {/* Extension Description */}
                  <p className="text-[#858585] text-xs mb-3 leading-relaxed">
                    {extension.description}
                  </p>

                  {/* Expanded Details */}
                  {isSelected && (
                    <div className="space-y-3 pt-2 border-t border-[#454545]">
                      {/* Pricing Details */}
                      {extension.isPremium && (
                        <div className="bg-gradient-to-r from-[#d4af37]/5 to-transparent border border-[#d4af37]/20 rounded p-2">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-[#d4af37] text-xs font-medium">
                              <Crown className="w-3 h-3" />
                              Premium Extension
                            </div>
                            <div className="text-[#d4af37] text-sm font-bold">
                              ${extension.pricing.price}
                            </div>
                          </div>
                          <p className="text-[#858585] text-xs">
                            {extension.pricing.model === 'one-time' && 'One-time purchase with lifetime access'}
                            {extension.pricing.model === 'subscription' && 'Monthly subscription'}
                            {extension.pricing.model === 'usage-based' && 'Pay per use'}
                          </p>
                        </div>
                      )}

                      {/* Tools */}
                      <div>
                        <h5 className="text-[#cccccc] text-xs font-medium mb-2 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Available Tools
                        </h5>
                        <div className="space-y-2">
                          {extension.tools.map((tool) => (
                            <div key={tool.command} className="bg-[#1e1e1e] rounded p-2">
                              <div className="flex items-center gap-2 mb-1">
                                <code className="text-[#4ec9b0] text-xs bg-[#0f0f0f] px-1 rounded">
                                  {tool.command}
                                </code>
                                <span className="text-[#cccccc] text-xs font-medium">
                                  {tool.name}
                                </span>
                              </div>
                              <p className="text-[#858585] text-xs">
                                {tool.description}
                              </p>
                              {tool.usage && (
                                <div className="mt-1">
                                  <code className="text-[#858585] text-xs bg-[#0f0f0f] px-1 rounded">
                                    {tool.usage}
                                  </code>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Value Proposition */}
                      {extension.isPremium && (
                        <div>
                          <h5 className="text-[#cccccc] text-xs font-medium mb-2 flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Why This Extension?
                          </h5>
                          <div className="bg-[#1e1e1e] rounded p-2">
                            <div className="text-[#858585] text-xs space-y-1">
                              {extension.id === 'logo-generator' && (
                                <>
                                  <div>• Professional logo design at fraction of designer cost</div>
                                  <div>• DALL-E 3 integration for high-quality results</div>
                                  <div>• Guided workflow ensures comprehensive brand brief</div>
                                  <div>• Multiple format exports (SVG, PNG, PDF)</div>
                                </>
                              )}
                              {extension.id === 'marketing-officer' && (
                                <>
                                  <div>• Complete campaign strategy equivalent to $500+ consultation</div>
                                  <div>• 5-phase structured planning process</div>
                                  <div>• Multi-platform strategy with audience analysis</div>
                                  <div>• Comprehensive reports with KPIs and metrics</div>
                                </>
                              )}
                              {extension.id === 'campaign-director' && (
                                <>
                                  <div>• Replaces $2000+ campaign development and management</div>
                                  <div>• Generate 100+ posts with strategic distribution</div>
                                  <div>• Enterprise-level batch processing and optimization</div>
                                  <div>• Complete campaign export with deployment guide</div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-[#454545]">
        <div className="flex items-center justify-between text-xs">
          <div className="text-[#858585]">
            {purchasedExtensions.size} of {availableExtensions.length} extensions owned
          </div>
          <div className="flex items-center gap-1 text-[#858585]">
            <Info className="w-3 h-3" />
            Extensions add tools to terminal
          </div>
        </div>
        
        {purchasedExtensions.size > 0 && (
          <div className="mt-2 text-xs text-[#4ec9b0]">
            ✓ Extensions ready - access their tools in the terminal
          </div>
        )}
      </div>
    </div>
  );
}
