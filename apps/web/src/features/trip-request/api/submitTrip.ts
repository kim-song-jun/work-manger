// Re-exports the entity API so pages may import from the feature slice without
// crossing FSD boundaries. The actual fetch lives in entities/trip.
export { createTrip } from "@entities/trip";
export type { CreateTripBody } from "@entities/trip";
