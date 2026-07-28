import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAllStores } from '../database/db';

const StoreContext = createContext(null);

/**
 * Manages the currently selected store (multi-store support).
 * All data (products, stock, sales) is filtered by store on the
 * database side — see src/database/db.js.
 */
export function StoreProvider({ children }) {
  const [stores, setStores] = useState([]);
  const [currentStoreId, setCurrentStoreId] = useState(1);

  useEffect(() => {
    getAllStores().then((rows) => {
      setStores(rows);
      if (rows.length > 0) {
        setCurrentStoreId(rows[0].id);
      }
    });
  }, []);

  const currentStore = stores.find((s) => s.id === currentStoreId) || null;

  return (
    <StoreContext.Provider value={{ stores, currentStoreId, setCurrentStoreId, currentStore }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
