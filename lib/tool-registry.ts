import { Tool } from "@/lib/tools";
import { ComponentType } from "react";

// Tool component imports - using feature-based organization (2025 best practice)
import { CalculatorTool } from "@/features/calculator";
import { ReviewLinkGeneratorTool } from "@/features/review-link-generator";
import { TextAnalyzerTool } from "@/features/text-analyzer";

export interface ToolComponent {
  component: ComponentType<{ tool: Tool }>;
  description: string;
  category: string;
}

// Tool registry following 2025 best practices
export const TOOL_REGISTRY: Record<string, ToolComponent> = {
  'calculator': {
    component: CalculatorTool,
    description: 'Advanced calculator with basic arithmetic operations',
    category: 'utilities'
  },
  'review-link-generator': {
    component: ReviewLinkGeneratorTool,
    description: 'Generate direct review links for Google My Business and Facebook pages',
    category: 'business'
  },
  'text-analyzer': {
    component: TextAnalyzerTool,
    description: 'Comprehensive text analysis and metrics tool',
    category: 'analysis'
  }
};

// Helper function to get tool component
export function getToolComponent(slug: string): ToolComponent | null {
  return TOOL_REGISTRY[slug] || null;
}

// Helper function to get all available tools
export function getAvailableTools(): string[] {
  return Object.keys(TOOL_REGISTRY);
}

// Helper function to get tools by category
export function getToolsByCategory(category: string): string[] {
  return Object.entries(TOOL_REGISTRY)
    .filter(([, config]) => config.category === category)
    .map(([slug]) => slug);
}

// Helper function to validate if a tool exists
export function isValidTool(slug: string): boolean {
  return slug in TOOL_REGISTRY;
}