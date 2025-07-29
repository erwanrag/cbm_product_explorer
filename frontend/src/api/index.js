// frontend/src / api / index.js - POINT D'ENTRÉE PRINCIPAL
export * from './services';
export { default as api } from './core/apiClient';

// Fonctions helper pour compatibilité avec l'ancien code
export const fetchDashboardFiche = (payload) => {
    const { dashboardService } = require('./services');
    return dashboardService.getFiche(payload);
};

export const fetchProductDetails = (payload) => {
    const { productService } = require('./services');
    return productService.getDetails(payload);
};

export const fetchCodProMatchList = (payload) => {
    const { productService } = require('./services');
    return productService.getMatches(payload);
};

export const fetchSalesHistory = (payload, lastNMonths = 12) => {
    const { salesService } = require('./services');
    return salesService.getHistory(payload, lastNMonths);
};

export const fetchStockHistory = (payload, lastNMonths = 12) => {
    const { stockService } = require('./services');
    return stockService.getHistory(payload, lastNMonths);
};

export const resolveCodPro = (payload) => {
    const { identifierService } = require('./services');
    return identifierService.resolveCodPro(payload);
};

export const autocompleteRefintOrCodpro = (query) => {
    const { suggestionService } = require('./services');
    return suggestionService.autocompleteRefintOrCodpro(query);
};

export const autocompleteRefCrn = (query) => {
    const { suggestionService } = require('./services');
    return suggestionService.autocompleteRefCrn(query);
};

export const autocompleteRefExt = (query) => {
    const { suggestionService } = require('./services');
    return suggestionService.autocompleteRefExt(query);
};

export const getRefCrnByCodPro = (codPro) => {
    const { suggestionService } = require('./services');
    return suggestionService.getRefCrnByCodPro(codPro);
};