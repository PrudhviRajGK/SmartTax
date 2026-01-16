import React, { createContext, useContext, useState, useEffect } from 'react';
import type { SectionStatus, Form16Data, TaxCalculationResult } from '../types/tax.types';

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
  };
  mutualFunds: {
    status: SectionStatus;
    data: any;
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
  equity: { status: 'incomplete', data: null },
  mutualFunds: { status: 'incomplete', data: null },
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
    return saved ? JSON.parse(saved) : defaultValue;
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
