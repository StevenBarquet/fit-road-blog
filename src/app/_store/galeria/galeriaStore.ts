import { create, type StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';

type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface State {
  from: string | null;
  to: string | null;
  frequency: Frequency;
  page: number;
  panelOpen: boolean;
}

const initialState: State = {
  from: null,
  to: null,
  frequency: 'daily',
  page: 1,
  panelOpen: true,
};

export interface GaleriaStore extends State {
  setFilters: (filters: { from: string; to: string; frequency: Frequency }) => void;
  setPage: (page: number) => void;
  setPanelOpen: (open: boolean) => void;
  reset: () => void;
}

const actions: StateCreator<GaleriaStore> = (set) => ({
  ...initialState,
  setFilters: ({ from, to, frequency }) => set({ from, to, frequency, page: 1, panelOpen: false }),
  setPage: (page) => set({ page }),
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  reset: () => set(initialState),
});

export const useGaleriaStore = create<GaleriaStore>()(
  devtools(actions, { name: 'Galeria' }),
);
