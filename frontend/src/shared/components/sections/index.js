// ===================================
// 📁 frontend/src/shared/components/sections/index.js - VERSION SIMPLIFIÉE
// ===================================

// Composants de sections réutilisables
export { default as KPISection } from '@/shared/components/sections/KPISection';         // ✅ Déjà créé
export { default as ChartSection } from '@/shared/components/sections//ChartSection';     // ✅ Déjà créé  
export { default as TableSection } from '@/shared/components/sections//TableSection';     // ✅ Déjà créé
export { default as FilterSection } from '@/shared/components/sections//FilterSection';   // 🔄 FilterManager renommé

// Export consolidé
export const Sections = {
    KPI: KPISection,
    Chart: ChartSection,
    Table: TableSection,
    Filter: FilterSection
};