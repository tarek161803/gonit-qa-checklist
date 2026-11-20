export type Platform = "mobile" | "web";
export type Result = "pass" | "fail";

export interface Meta {
  tester?: string;
  date?: string;
  build?: string;
  device?: string;
}

export interface PlatformState {
  results: Record<string, Result>;
  notes: Record<string, string>;
  meta: Meta;
}

export interface AppState {
  platform: Platform;
  mobile: PlatformState;
  web: PlatformState;
  collapsed: Record<number, boolean>;
}
