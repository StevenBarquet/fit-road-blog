import { create, type StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';
import { type BitacoraFromDB } from 'src/server/entities/bitacora/bitacoraTypes';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

type DrawerMode = 'closed' | 'read' | 'form';

function computeDateRange() {
  const today = dayjs();
  const currentWeekMonday = today.isoWeekday(1);
  const from = currentWeekMonday.subtract(3, 'week').format('YYYY-MM-DD');
  const to = currentWeekMonday.add(1, 'week').subtract(1, 'day').format('YYYY-MM-DD');
  return { from, to };
}

interface State {
  entries: BitacoraFromDB[];
  selectedDate: string | null;
  dateRange: { from: string; to: string };
  drawerMode: DrawerMode;
}

const initialState: State = {
  entries: [],
  selectedDate: dayjs().format('YYYY-MM-DD'),
  dateRange: computeDateRange(),
  drawerMode: 'closed',
};

export interface BitacoraStore extends State {
  setEntries: (entries: BitacoraFromDB[]) => void;
  setSelectedDate: (date: string | null) => void;
  setDateRange: (range: { from: string; to: string }) => void;
  setDrawerMode: (mode: DrawerMode) => void;
  openDay: (date: string) => void;
  getSelectedEntry: () => BitacoraFromDB | undefined;
  getEntriesByDate: () => Map<string, BitacoraFromDB>;
  reset: () => void;
}

const actions: StateCreator<BitacoraStore> = (set, get) => ({
  ...initialState,
  setEntries: (entries) => set({ entries }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setDateRange: (dateRange) => set({ dateRange }),
  setDrawerMode: (drawerMode) => set({ drawerMode }),
  openDay: (date) => {
    const { entries } = get();
    const hasEntry = entries.some((e) => e.id === date);
    set({
      selectedDate: date,
      drawerMode: hasEntry ? 'read' : 'form',
    });
  },
  getSelectedEntry: () => {
    const { entries, selectedDate } = get();
    if (!selectedDate) return undefined;
    return entries.find((e) => e.id === selectedDate);
  },
  getEntriesByDate: () => {
    const { entries } = get();
    return new Map(entries.map((e) => [e.id, e]));
  },
  reset: () => set(initialState),
});

export const useBitacoraStore = create<BitacoraStore>()(
  devtools(actions, { name: 'BitacoraData' }),
);
