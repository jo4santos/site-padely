import { createContext, useContext, useState } from 'react';

const AutoRefreshContext = createContext();

export function AutoRefreshProvider({ children }) {
    const [autoRefresh, setAutoRefresh] = useState(true);

    return (
        <AutoRefreshContext.Provider value={{ autoRefresh, setAutoRefresh }}>
            {children}
        </AutoRefreshContext.Provider>
    );
}

export function useAutoRefresh() {
    const context = useContext(AutoRefreshContext);
    if (!context) {
        throw new Error('useAutoRefresh must be used within AutoRefreshProvider');
    }
    return context;
}
