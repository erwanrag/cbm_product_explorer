import React, { useState } from "react";
import { LayoutContext } from "./LayoutContext";

export function LayoutProvider({ children }) {
    const [filters, setFilters] = useState({});
    const [filterType, setFilterType] = useState("none");

    return (
        <LayoutContext.Provider value={{ filters, setFilters, filterType, setFilterType }}>
            {children}
        </LayoutContext.Provider>
    );
}
