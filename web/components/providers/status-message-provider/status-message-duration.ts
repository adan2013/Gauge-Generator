export const STATUS_MESSAGE_DURATION_MS = {
  short: 2_500,
  medium: 3_500,
  long: 5_000,
} as const;

export type StatusMessageDuration = keyof typeof STATUS_MESSAGE_DURATION_MS | "persistent";
