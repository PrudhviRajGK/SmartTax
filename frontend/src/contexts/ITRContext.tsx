import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  SectionStatus,
  Form16Data,
  TaxCalculationResult,
  HousePropertyEntry,
  HousePropertyAggregate,
} from '../types/tax.types';

export interface EquityUpload {
  broker: string;
  stcg_before: number;
  stcg_after: number;
  ltcg_before: number;
  ltcg_after: number;
  uploadedAt: string;
}

interface SalarySection {
  status: SectionStatus;
  data: Form16Data | null;
}

interface ReviewSection {
  status: SectionStatus;
}

interface ITR1State {
  salary: SalarySection;
  review: ReviewSection;
  calculated: boolean;
  calculationResult: TaxCalculationResult | null;
  lastCalculatedAt: string | null;
}

interface ITR2State {
  salary: SalarySection;
  equity: {
    status: SectionStatus;
    data: any;
    uploads: EquityUpload[];
  };
  mutualFunds: {
    status: SectionStatus;
    data: any;
  };
  houseProperty: {
    status: SectionStatus;
    /** Array of individual properties, each with their own result */
    properties: HousePropertyEntry[];
    /** Aggregated totals across all properties */
    aggregate: HousePropertyAggregate | null;
  };
  review: ReviewSection;
  calculated: boolean;
  calculationResult: TaxCalculationResult | null;
  lastCalculatedAt: string | null;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

interface ITRContextValue {
  itr1State: ITR1State;
  itr2State: ITR2State;
  updateITR1: (section: keyof ITR1State, data: any) => void;
  updateITR2: (section: keyof ITR2State, data: any) => void;
  addEquityUpload: (upload: EquityUpload) => void;
  removeEquityUpload: (index: number) => void;
  getAggregatedEquityData: () => { stcg_before: number; stcg_after: number; ltcg_before: number; ltcg_after: number };
  resetITR1: () => void;
  resetITR2: () => void;
  validateSalaryData: (itrType: 'itr1' | 'itr2') => ValidationResult;
}

const ITRContext = createContext<ITRContextValue | undefined>(undefined);

const INITIAL_ITR1_STATE: ITR1State = {
  salary: { status: 'incomplete', data: null },
  review: { status: 'incomplete' },
  calculated: false,
  calculationResult: null,
  lastCalculatedAt: null,
};

const INITIAL_ITR2_STATE: ITR2State = {
  salary: { status: 'incomplete', data: null },
  equity: { status: 'incomplete', data: null, uploads: [] },
  mutualFunds: { status: 'incomplete', data: null },
  houseProperty: {
    status: 'incomplete',
    properties: [],
    aggregate: null,
  },
  review: { status: 'incomplete' },
  calculated: false,
  calculationResult: null,
  lastCalculatedAt: null,
};

const STORAGE_KEYS = {
  ITR1: 'itr1State',
  ITR2: 'itr2State',
} as const;

function loadStateFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return defaultValue;
    const parsed = JSON.parse(saved);
    // Migration: if old single-property shape exists, reset house property
    if (parsed.houseProperty && !Array.isArray(parsed.houseProperty.properties)) {
      parsed.houseProperty = INITIAL_ITR2_STATE.houseProperty;
    }
    // Migration: if equity doesn't have uploads array, initialize it
    if (parsed.equity && !Array.isArray(parsed.equity.uploads)) {
      parsed.equity.uploads = [];
    }
    return parsed;
  } catch {
    return defaultValue;
  }
}

function saveStateToStorage<T>(key: string, state: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
}

export const ITRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [itr1State, setITR1State] = useState<ITR1State>(() =>
    loadStateFromStorage(STORAGE_KEYS.ITR1, INITIAL_ITR1_STATE)
  );

  const [itr2State, setITR2State] = useState<ITR2State>(() =>
    loadStateFromStorage(STORAGE_KEYS.ITR2, INITIAL_ITR2_STATE)
  );

  useEffect(() => {
    saveStateToStorage(STORAGE_KEYS.ITR1, itr1State);
  }, [itr1State]);

  useEffect(() => {
    saveStateToStorage(STORAGE_KEYS.ITR2, itr2State);
  }, [itr2State]);

  const updateITR1 = (section: keyof ITR1State, data: any) => {
    setITR1State((prev) => {
      if (typeof data === 'object' && data !== null && 'status' in data) {
        return { ...prev, [section]: data };
      }
      const currentSection = prev[section];
      if (typeof currentSection === 'object' && currentSection !== null) {
        return { ...prev, [section]: { ...currentSection, ...data } };
      }
      return { ...prev, [section]: data };
    });
  };

  const updateITR2 = (section: keyof ITR2State, data: any) => {
    setITR2State((prev) => {
      if (typeof data === 'object' && data !== null && 'status' in data) {
        return { ...prev, [section]: data };
      }
      const currentSection = prev[section];
      if (typeof currentSection === 'object' && currentSection !== null) {
        return { ...prev, [section]: { ...currentSection, ...data } };
      }
      return { ...prev, [section]: data };
    });
  };

  const addEquityUpload = (upload: EquityUpload) => {
    setITR2State((prev) => {
      const newUploads = [...prev.equity.uploads, upload];
      const aggregated = newUploads.reduce(
        (acc, u) => ({
          stcg_before: acc.stcg_before + u.stcg_before,
          stcg_after: acc.stcg_after + u.stcg_after,
          ltcg_before: acc.ltcg_before + u.ltcg_before,
          ltcg_after: acc.ltcg_after + u.ltcg_after,
        }),
        { stcg_before: 0, stcg_after: 0, ltcg_before: 0, ltcg_after: 0 }
      );
      return {
        ...prev,
        equity: {
          status: 'complete',
          data: aggregated,
          uploads: newUploads,
        },
      };
    });
  };

  const removeEquityUpload = (index: number) => {
    setITR2State((prev) => {
      const newUploads = prev.equity.uploads.filter((_, i) => i !== index);
      const aggregated = newUploads.reduce(
        (acc, u) => ({
          stcg_before: acc.stcg_before + u.stcg_before,
          stcg_after: acc.stcg_after + u.stcg_after,
          ltcg_before: acc.ltcg_before + u.ltcg_before,
          ltcg_after: acc.ltcg_after + u.ltcg_after,
        }),
        { stcg_before: 0, stcg_after: 0, ltcg_before: 0, ltcg_after: 0 }
      );
      return {
        ...prev,
        equity: {
          status: newUploads.length > 0 ? 'complete' : 'incomplete',
          data: newUploads.length > 0 ? aggregated : null,
          uploads: newUploads,
        },
      };
    });
  };

  const getAggregatedEquityData = () => {
    return itr2State.equity.uploads.reduce(
      (acc, u) => ({
        stcg_before: acc.stcg_before + u.stcg_before,
        stcg_after: acc.stcg_after + u.stcg_after,
        ltcg_before: acc.ltcg_before + u.ltcg_before,
        ltcg_after: acc.ltcg_after + u.ltcg_after,
      }),
      { stcg_before: 0, stcg_after: 0, ltcg_before: 0, ltcg_after: 0 }
    );
  };

  const resetITR1 = () => {
    setITR1State(INITIAL_ITR1_STATE);
    localStorage.removeItem(STORAGE_KEYS.ITR1);
  };

  const resetITR2 = () => {
    setITR2State(INITIAL_ITR2_STATE);
    localStorage.removeItem(STORAGE_KEYS.ITR2);
  };

  const validateSalaryData = (itrType: 'itr1' | 'itr2'): ValidationResult => {
    const state = itrType === 'itr1' ? itr1State : itr2State;

    if (!state.salary.data) {
      return {
        isValid: false,
        error: 'Salary data is missing. Please upload Form-16.',
      };
    }

    const grossSalary = state.salary.data.gross_salary || state.salary.data.salary || 0;

    if (grossSalary === 0) {
      return {
        isValid: false,
        error: 'Gross salary cannot be zero. Please re-upload Form-16 with valid data.',
      };
    }

    return { isValid: true };
  };

  const contextValue: ITRContextValue = {
    itr1State,
    itr2State,
    updateITR1,
    updateITR2,
    addEquityUpload,
    removeEquityUpload,
    getAggregatedEquityData,
    resetITR1,
    resetITR2,
    validateSalaryData,
  };

  return <ITRContext.Provider value={contextValue}>{children}</ITRContext.Provider>;
};

export const useITR = (): ITRContextValue => {
  const context = useContext(ITRContext);
  if (!context) {
    throw new Error('useITR must be used within ITRProvider');
  }
  return context;
};
