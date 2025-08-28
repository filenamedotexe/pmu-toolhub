# PMU ToolHub - 2025 Architecture Guide

## 📁 Project Structure (Following 2025 Best Practices)

```
/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Route groups for auth pages
│   ├── admin/             # Admin dashboard & components
│   ├── dashboard/         # User dashboard
│   ├── tool/[slug]/       # Dynamic tool routing
│   └── unlock/[slug]/     # Dynamic unlock URLs
├── features/              # Feature-based organization (2025)
│   ├── calculator/        # Calculator feature
│   ├── review-link-generator/  # Review link generator feature
│   ├── text-analyzer/     # Text analyzer feature
│   └── shared/           # Shared tool components
├── components/           # Reusable UI components
│   └── ui/              # shadcn/ui components
├── lib/                 # Utilities and configurations
│   ├── tool-registry.ts # Central tool registry
│   ├── auth.ts         # Authentication helpers
│   └── tools.ts        # Tool management functions
├── supabase/           # Database migrations
└── app/api/            # API routes
    ├── review-links/   # Review links data endpoints
    └── google-places-search/ # Google Places API proxy
```

## 🏗️ Architecture Principles

### 1. Feature-Based Organization
Each tool is organized as a **feature** with its own directory:
- Self-contained functionality
- Easy to maintain and extend
- Clear separation of concerns
- Following 2025 React/Next.js best practices

### 2. Tool Registry System
Central configuration in `lib/tool-registry.ts`:
```typescript
export const TOOL_REGISTRY: Record<string, ToolComponent> = {
  'calculator': {
    component: CalculatorTool,
    description: 'Advanced calculator with basic arithmetic operations',
    category: 'utilities'
  },
  // ... more tools
};
```

### 3. Dynamic Component Loading
Tools are loaded dynamically using the registry:
```typescript
const toolConfig = getToolComponent(tool.slug);
if (toolConfig) {
  const ToolComponent = toolConfig.component;
  return <ToolComponent tool={tool} />;
}
```

## ✨ Adding New Tools

### Step 1: Create Feature Directory
```bash
mkdir features/your-tool-name
```

### Step 2: Create Tool Component
```typescript
// features/your-tool-name/your-tool-component.tsx
'use client';

import { ToolLayout } from "../shared";
import { Tool } from "@/lib/tools";

interface YourToolProps {
  tool: Tool;
}

export function YourTool({ tool }: YourToolProps) {
  return (
    <ToolLayout tool={tool}>
      {/* Your tool UI here */}
    </ToolLayout>
  );
}
```

### Step 3: Create Index File
```typescript
// features/your-tool-name/index.ts
export { YourTool } from './your-tool-component';
```

### Step 4: Register in Tool Registry
```typescript
// lib/tool-registry.ts
import { YourTool } from "@/features/your-tool-name";

export const TOOL_REGISTRY = {
  // ... existing tools
  'your-tool-slug': {
    component: YourTool,
    description: 'Your tool description',
    category: 'your-category'
  }
};
```

### Step 5: Add to Database
```sql
INSERT INTO tools (name, slug, description, is_active) 
VALUES ('Your Tool Name', 'your-tool-slug', 'Tool description', true);
```

## 🔧 Shared Resources

### ToolLayout Component
All tools use the shared `ToolLayout` component for:
- Consistent navigation (Back to Dashboard)
- Tool title and description display
- Active badge
- Responsive container layout

### UI Components
- Located in `components/ui/`
- Using shadcn/ui design system
- Shared across all tools and features

### Authentication & Access Control
- Built-in access verification
- Role-based permissions (user/admin)
- URL-based tool unlocking system

## 🚀 Benefits of This Architecture

### ✅ Maintainability
- Clear separation between features
- Easy to locate and modify tool code
- Consistent patterns across all tools

### ✅ Scalability  
- Easy to add new tools without touching routing
- Feature-based organization scales well
- Minimal code duplication

### ✅ Developer Experience
- TypeScript throughout for type safety
- Hot module replacement for fast development
- Clear file naming conventions

### ✅ Performance
- Dynamic imports for code splitting
- Suspense boundaries for loading states
- Tree shaking for unused code elimination

## 📊 Current Tools

1. **Calculator** (`features/calculator/`)
   - Full arithmetic operations
   - State management for calculations
   - Professional calculator UI

2. **Review Link Generator** (`features/review-link-generator/`)
   - Generate direct review links for Google My Business and Facebook
   - Google Places API integration for business search
   - Data persistence for user configurations
   - Completion badges and copy-paste functionality

3. **Text Analyzer** (`features/text-analyzer/`)
   - Comprehensive text metrics
   - Reading time estimation
   - Word frequency analysis
   - Readability statistics

## 🔄 Migration Benefits

**Before (Old Structure):**
- All tools in one large file (252 lines)
- Hard-coded switch statements
- Repeated layout code
- Difficult to maintain

**After (2025 Structure):**
- Individual feature directories
- Dynamic component registry
- Shared layout component  
- Easy to extend and maintain

This architecture follows **2025 Next.js best practices** and provides a solid foundation for scaling the tool platform!