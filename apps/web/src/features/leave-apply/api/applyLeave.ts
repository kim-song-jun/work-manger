// Re-exports the entity API so that pages may import from the feature slice
// without crossing FSD boundaries. The actual fetch lives in entities/leave.
export { applyLeave } from "@entities/leave";
export type { LeaveApplyBody } from "@entities/leave";
