export type MotionPermissionState = "checking" | "granted" | "prompt" | "blocked" | "unavailable";

export type MotionCapabilities = {
  accelerometerAvailable: boolean | null;
  deviceMotionAvailable: boolean | null;
  gyroscopeAvailable: boolean | null;
  magnetometerAvailable: boolean | null;
};

export type ImmersiveModelKey = "room" | "clava";

export type ImmersiveModelOption = {
  asset: number;
  label: string;
};
