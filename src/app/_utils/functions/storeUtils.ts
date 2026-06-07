import { useAppInfoStore } from "src/app/_store/appInfo";

export const setGlobalState = (state: boolean) => useAppInfoStore.setState({ isLoadingGlobal: state });
