export type ClockKind = "OFFICE" | "WFH";

export type ClockInBody = {
  location: { latitude: number; longitude: number; accuracy_m: number };
  kind: ClockKind;
  client_time: string;
};
