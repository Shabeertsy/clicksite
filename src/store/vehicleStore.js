// src/store/usePlacesStore.js
import { create } from "zustand";
import { baseUrl } from "../Constants";


export const useVehicleStore = create((set) => ({
  vehicles: [],
  loading: false,
  error: null,

  fetchPlaces: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${baseUrl}list-owner-vehicles/`);
      const data = await res.json();
      console.log(data.vehicles,'data');
      
      set({ vehicles: data.vehicles, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  updateBooking: (id, newBooking) =>
    set((state) => ({
        vehicles: state.vehicles.map((p) =>
        p.id === id ? { ...p, booking: newBooking } : p
      ),
    })),
}));
