export type {
  InboxKind,
  InboxTargetType,
  InboxStatus,
  InboxRole,
  InboxItem,
  InboxList,
  InboxCounts,
} from "./model/types";

export { fetchInbox } from "./api/fetchInbox";
export type { InboxQuery } from "./api/fetchInbox";
export { approveInbox, rejectInbox } from "./api/decideInbox";
export type { DecisionBody } from "./api/decideInbox";
