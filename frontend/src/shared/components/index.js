// ===================================
// 📁 frontend/src/shared/components/index.js - INDEX PRINCIPAL
// ===================================

// Layout Components
export * from '@/shared/components/layout';

// UI Components
export * from '@/shared/components/badges';
export * from '@/shared/components/buttons';
export * from '@/shared/components/cards';
export * from '@/shared/components/inputs';
export * from '@/shared/components/tables';

// Specialized Components
export * from '@/shared/components/error';
export * from '@/shared/components/export';
export * from '@/shared/components/filters';
export * from '@/shared/components/page';
export * from '@/shared/components/skeleton';
export * from '@/shared/components/ui';

// Default exports for common components
export { default as Layout } from '@/shared/components/layout/Layout';
export { default as ErrorBoundary } from '@/shared/components/error/ErrorBoundary';
export { default as CBMButton } from '@/shared/components/buttons/CBMButton';
export { default as CBMCard } from '@/shared/components/cards/CBMCard';
export { default as PageTitle } from '@/shared/components/page/PageTitle';
export { default as PageWrapper } from '@/shared/components/page/PageWrapper';
export { default as LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
export { default as ExportExcelButton } from '@/shared/components/export/ExportExcelButton';
