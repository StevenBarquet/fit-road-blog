import { create, type StateCreator } from 'zustand';
import { devtools, persist, type PersistOptions } from 'zustand/middleware';

interface State {
  isAuth: boolean;
  /**Controla si la vista del calendario es por cantidad o por tarea */
  isCountView: boolean;
}

const initialState: State = {
  isAuth: false,
  isCountView: false,
};

export interface UserInfoStore extends State {
  update: (data: Partial<State>) => void;
  set: (data: State) => void;
  reset: () => void;
}

// Si quieres ocupar logica compleja, puedes manejar las actions en otro archivo
const actions: StateCreator<UserInfoStore> = (set) => ({
  ...initialState,
  update: (data) => set((state) => ({ ...state, ...data })),
  set: (data) => set(() => data),
  reset: () => set(() => initialState),
});

// ------------BOILERPLATE-----
type PersistFn = (
  config: StateCreator<UserInfoStore>,
  options: PersistOptions<UserInfoStore>,
) => StateCreator<UserInfoStore>;

const withPersist = (persist as PersistFn)(actions, { name: 'UserInfoStorageKey' });

export const useUserInfoStore = create<UserInfoStore>()(
  devtools(withPersist, { name: 'UserInfo' }),
);