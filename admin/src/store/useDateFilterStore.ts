import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  DateFilterType, 
  DateRange, 
  DateRangeCalculator, 
  DateFilterStorage, 
  StoredDateFilter 
} from '@/utils/dashboardDateUtils'; 
interface DateFilterState {
  // Current filter state
  selectedFilter: DateFilterType;
  customStartDate: Date | null;
  customEndDate: Date | null;
  
  // UI state
  isCustomRangeOpen: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Computed values
  currentDateRange: DateRange;
  displayText: string;
}

interface DateFilterActions {
  // Filter actions
  setFilter: (filter: DateFilterType) => void;
  setCustomRange: (start: Date, end: Date) => void;
  
  // UI actions
  toggleCustomRange: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Utility actions
  getDateRange: () => DateRange;
  reset: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

type DateFilterStore = DateFilterState & DateFilterActions;

const getInitialState = (): DateFilterState => {
  const defaultFilter: DateFilterType = 'last7days';
  const defaultRange = DateRangeCalculator.getDateRange(defaultFilter);
  
  return {
    selectedFilter: defaultFilter,
    customStartDate: null,
    customEndDate: null,
    isCustomRangeOpen: false,
    isLoading: false,
    error: null,
    currentDateRange: defaultRange,
    displayText: DateRangeCalculator.formatDisplayRange(defaultFilter)
  };
};

export const useDateFilterStore = create<DateFilterStore>()(
  devtools(
    (set, get) => ({
      ...getInitialState(),

      setFilter: (filter: DateFilterType) => {
        const state = get();
        
        try {
          let dateRange: DateRange;
          let displayText: string;
          
          if (filter === 'custom') {
            if (!state.customStartDate || !state.customEndDate) {
              set({ 
                selectedFilter: filter,
                isCustomRangeOpen: true,
                error: null 
              });
              return;
            }
            dateRange = DateRangeCalculator.getDateRange(filter, state.customStartDate, state.customEndDate);
            displayText = DateRangeCalculator.formatDisplayRange(filter, state.customStartDate, state.customEndDate);
          } else {
            dateRange = DateRangeCalculator.getDateRange(filter);
            displayText = DateRangeCalculator.formatDisplayRange(filter);
          }

          set({
            selectedFilter: filter,
            currentDateRange: dateRange,
            displayText,
            isCustomRangeOpen: false,
            error: null
          });

          // Save to session storage
          get().saveToStorage();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to set date filter' 
          });
        }
      },

      setCustomRange: (start: Date, end: Date) => {
        try {
          // Validate the date range
          const validation = DateRangeCalculator.validateDateRange(start, end);
          if (!validation.isValid) {
            set({ error: validation.error || 'Invalid date range' });
            return;
          }

          const dateRange = DateRangeCalculator.custom(start, end);
          const displayText = DateRangeCalculator.formatDisplayRange('custom', start, end);

          set({
            selectedFilter: 'custom',
            customStartDate: start,
            customEndDate: end,
            currentDateRange: dateRange,
            displayText,
            isCustomRangeOpen: false,
            error: null
          });

          // Save to session storage
          get().saveToStorage();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to set custom date range' 
          });
        }
      },

      toggleCustomRange: () => {
        set(state => ({ 
          isCustomRangeOpen: !state.isCustomRangeOpen,
          error: null 
        }));
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      getDateRange: () => {
        return get().currentDateRange;
      },

      reset: () => {
        const initialState = getInitialState();
        set(initialState);
        DateFilterStorage.clear();
      },

      loadFromStorage: () => {
        try {
          const stored = DateFilterStorage.load();
          if (stored) {
            const { selectedFilter, customStartDate, customEndDate } = stored;
            
            if (selectedFilter === 'custom' && customStartDate && customEndDate) {
              const start = new Date(customStartDate);
              const end = new Date(customEndDate);
              
              // Validate stored custom dates
              const validation = DateRangeCalculator.validateDateRange(start, end);
              if (validation.isValid) {
                get().setCustomRange(start, end);
                return;
              }
            } else if (selectedFilter !== 'custom') {
              get().setFilter(selectedFilter);
              return;
            }
          }
        } catch (error) {
          console.warn('Failed to load date filter from storage:', error);
        }
        
        // If loading fails or stored data is invalid, use default
        get().setFilter('last7days');
      },

      saveToStorage: () => {
        const state = get();
        const toStore: StoredDateFilter = {
          selectedFilter: state.selectedFilter,
          customStartDate: state.customStartDate?.toISOString(),
          customEndDate: state.customEndDate?.toISOString()
        };
        
        DateFilterStorage.save(toStore);
      }
    }),
    {
      name: 'date-filter-store'
    }
  )
);