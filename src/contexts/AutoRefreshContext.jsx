import { createContext, useContext, useState } from 'react';

const AutoRefreshContext = createContext();

export function AutoRefreshProvider({ children }) {
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(20);

    return (
        <AutoRefreshContext.Provider value={{ autoRefresh, setAutoRefresh, secondsUntilRefresh, setSecondsUntilRefresh }}>
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
