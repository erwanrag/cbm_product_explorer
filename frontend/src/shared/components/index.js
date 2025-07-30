// ===================================
// 📁 frontend/src/shared/components/index.js - INDEX PRINCIPAL
// ===================================

// Layout Components
export * from './layout';

// UI Components
export * from './badges';
export * from './buttons';
export * from './cards';
export * from './inputs';
export * from './tables';

// Specialized Components
export * from './error';
export * from './export';
export * from './filters';
export * from './page';
export * from './skeleton';
export * from './ui';

// Default exports for common components
export { default as Layout } from './layout/Layout';
export { default as ErrorBoundary } from './error/ErrorBoundary';
export { default as CBMButton } from './buttons/CBMButton';
export { default as CBMCard } from './cards/CBMCard';
export { default as PageTitle } from './page/PageTitle';
export { default as PageWrapper } from './page/PageWrapper';
export { default as LoadingSpinner } from './ui/LoadingSpinner';
export { default as ExportExcelButton } from './export/ExportExcelButton';