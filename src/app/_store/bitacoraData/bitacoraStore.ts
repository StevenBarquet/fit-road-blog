import { create, type StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';
import { type BitacoraFromDB } from 'src/server/entities/bitacora/bitacoraTypes';
import dayjs from 'dayjs';

interface State {
  entries: BitacoraFromDB[];
  selectedDate: string | null;
  currentMonth: number;
  currentYear: number;
}

const initialState: State = {
  entries: [],
  selectedDate: dayjs().format('YYYY-MM-DD'),
  currentMonth: dayjs().month(),
  currentYear: dayjs().year(),
};

export interface BitacoraStore extends State {
  setEntries: (entries: BitacoraFromDB[]) => void;
  setSelectedDate: (date: string | null) => void;
  setCurrentMonth: (month: number, year: number) => void;
  getSelectedEntry: () => BitacoraFromDB | undefined;
  reset: () => void;
}

const actions: StateCreator<BitacoraStore> = (set, get) => ({
  ...initialState,
  setEntries: (entries) => set({ entries }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setCurrentMonth: (currentMonth, currentYear) => set({ currentMonth, currentYear }),
  getSelectedEntry: () => {
    const { entries, selectedDate } = get();
    if (!selectedDate) return undefined;
    return entries.find((e) => e.fecha === selectedDate);
  },
  reset: () => set(initialState),
});

export const useBitacoraStore = create<BitacoraStore>()(
  devtools(actions, { name: 'BitacoraData' }),
);
