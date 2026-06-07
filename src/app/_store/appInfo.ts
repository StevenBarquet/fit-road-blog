import { create, type StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';

interface State {
  isMobile: boolean;
  winSize?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  width?: number;
  isLoadingGlobal: boolean;
  clientLoaded: boolean;
}

const initialState: State = {
  isMobile: false,
  isLoadingGlobal: false,
  clientLoaded: false,
};

export interface AppInfoStore extends State {
  update: (data: Partial<State>) => void;
  set: (data: State) => void;
  reset: () => void;
  isLoadingOn: () => void;
  isLoadingOff: () => void;
}

// Si quieres ocupar logica compleja, puedes manejar las actions en otro archivo
const actions: StateCreator<AppInfoStore> = (set) => ({
  ...initialState,
  update: (data) => set((state) => ({ ...state, ...data })),
  set: (data) => set(() => data),
  reset: () => set(() => initialState),
  isLoadingOn: () => set((state) => ({ ...state, isLoadingGlobal: true })),
  isLoadingOff: () => set((state) => ({ ...state, isLoadingGlobal: false })),
});

// ------------BOILERPLATE-----

export const useAppInfoStore = create<AppInfoStore>()(
  devtools(actions, { name: 'AppInfo' }),
);
