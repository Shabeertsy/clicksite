import { create } from "zustand";
import { baseUrl } from "../Constants";

export const useVehicleStore = create((set) => ({
  vehicles: [],
  vehicleTypes: [],
  loading: false,
  error: null,
  data: null,
  selected: null, 
  distance: { text: "", value: null },

  setSelected: (selected) => set({ selected }),

  setDistance: (distance) => set({ distance }), 

  fetchVehicleTypes: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${baseUrl}list-vehicle-types/`);
      const types = await res.json();
      
      let normalizedTypes = [];
      if (Array.isArray(types)) {
        normalizedTypes = types.map((type) => ({
          id: type.id ?? type.vehicle_type ?? JSON.stringify(type),
          label: type.label ?? type.vehicle_type ?? "Unknown",
          seat_capacity: type.seat_capacity ?? "-",
          type_name: type.type_name ?? type.label ?? type.vehicle_type ?? "Unknown",
          icon: type.icon ?? null,
        }));
      }
      set({ vehicleTypes: normalizedTypes, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false, vehicleTypes: [] });
    }
  },

  updateBooking: (id, newBooking) =>
    set((state) => ({
      vehicles: state.vehicles.map((p) =>
        p.id === id ? { ...p, booking: newBooking } : p
      ),
    })),
}));
