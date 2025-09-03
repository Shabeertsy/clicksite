import { create } from "zustand";

export const useBookingStore = create((set) => ({
  pickupLocation: null,
  dropoffLocation: null,
  pickupCoords: null,
  dropoffCoords: null,

  setPickupLocation: (location) => set({ pickupLocation: location }),
  setDropoffLocation: (location) => set({ dropoffLocation: location }),
  setPickupCoords: (coords) => set({ pickupCoords: coords }),
  setDropoffCoords: (coords) => set({ dropoffCoords: coords }),
}));
