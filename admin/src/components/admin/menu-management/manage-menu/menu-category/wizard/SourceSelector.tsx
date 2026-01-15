import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, PenTool } from "lucide-react";
import { SourceType } from "./types/wizardTypes";

interface SourceSelectorProps {
  onSelect: (source: SourceType) => void;
}

export default function SourceSelector({ onSelect }: SourceSelectorProps) {
  return (
    <div className="py-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          How would you like to add categories?
        </h2>
        <p className="text-gray-600">
          Choose from pre-made templates or create your own custom category
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Browse Templates Option */}
        <Card
          className="p-6 cursor-pointer hover:shadow-xl hover:border-orange-300 transition-all duration-200 border-2 group"
          onClick={() => onSelect("templates")}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-8 h-8 text-orange-600" />
            </div>

            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-gray-900">
                  Browse Templates
                </h3>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  Recommended
                </Badge>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Choose from hundreds of pre-made category templates organized by
                cuisine type. Perfect for quick setup!
              </p>
            </div>

            <div className="w-full pt-4 border-t">
              <ul className="text-sm text-gray-500 space-y-1">
                <li>✓ Organized by cuisine</li>
                <li>✓ Add multiple at once</li>
                <li>✓ Professionally curated</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Create Custom Option */}
        <Card
          className="p-6 cursor-pointer hover:shadow-xl hover:border-blue-300 transition-all duration-200 border-2 group"
          onClick={() => onSelect("custom")}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PenTool className="w-8 h-8 text-blue-600" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Create Custom
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Design a unique category from scratch with your own name,
                description, and image.
              </p>
            </div>

            <div className="w-full pt-4 border-t">
              <ul className="text-sm text-gray-500 space-y-1">
                <li>✓ Full customization</li>
                <li>✓ Unique categories</li>
                <li>✓ Save as template</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        Don&apos;t worry, you can always add more categories later!
      </div>
    </div>
  );
}
