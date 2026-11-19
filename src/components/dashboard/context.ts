import { createContext, useContext } from 'react';

export type DashboardApi = {
  /** Publish the draft and show the success message. */
  publish: () => void;
  toastVisible: boolean;
  toastText: string;
  toastHref: string;
  /** Ticking clock for the door sign and the greeting. */
  now: Date;
};

export const DashboardContext = createContext<DashboardApi | null>(null);

export function useDashboard(): DashboardApi {
  const api = useContext(DashboardContext);
  if (!api) throw new Error('useDashboard must be used inside the dashboard layout.');
  return api;
}
