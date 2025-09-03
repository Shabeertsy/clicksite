import { useEffect, useRef, useState } from "react";
import { useVehicleStore } from "../store/vehicleStore";

export default function CustomDropdown() {
  const [open, setOpen] = useState(false); 
  const dropdownRef = useRef(null);



  const selected = useVehicleStore((state) => state.selected);
  const setSelected = useVehicleStore((state) => state.setSelected);
  const vehicleTypes = useVehicleStore((state) => state.vehicleTypes);
  const loading = useVehicleStore((state) => state.loading);
  const error = useVehicleStore((state) => state.error);
  const fetchVehicleTypes = useVehicleStore((state) => state.fetchVehicleTypes);



  useEffect(() => {
    if (!vehicleTypes || vehicleTypes.length === 0) {
      fetchVehicleTypes();
    }
  }, [fetchVehicleTypes, vehicleTypes]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);


  
  return (
    <div className="form-item" style={{ position: "relative", width: "100%" }}>
      <div className="custom-dropdown" ref={dropdownRef}>
        <label>Vehicle Type:</label>
        <div
          className="dropdown-btn"
          style={{ padding: "5px", cursor: "pointer", userSelect: "none" }}
          onClick={() => setOpen((o) => !o)}
        >
          {selected ? (
            <>
              {selected.icon && (
                <img
                  src={selected.icon}
                  width="20"
                  alt={selected.label}
                  style={{ marginRight: 6 }}
                />
              )}
              {selected.label}
              {selected.seat_capacity && (
                <span style={{ marginLeft: 8, color: "#888", fontSize: 12 }}>
                  ({selected.seat_capacity} seats)
                </span>
              )}
            </>
          ) : (
            "Select Vehicle Type"
          )}
          <span className="arrow arrow-right" style={{ float: "right" }}>
            &#9662;
          </span>
        </div>
        <div
          className="dropdown-content"
          style={{
            display: open ? "block" : "none",
            position: "absolute",
            background: "#fff",
            width: "100%",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            zIndex: 1,
            maxHeight: 250,
            overflowY: "auto",
          }}
        >
          {loading && <div className="dropdown-item">Loading...</div>}
          {error && <div className="dropdown-item" style={{ color: "red" }}>{error}</div>}
          {!loading && !error && vehicleTypes.length === 0 && (
            <div className="dropdown-item">No vehicle types found</div>
          )}
          {!loading && !error &&
            vehicleTypes.map((type) => (
              <div
                className="dropdown-item"
                key={type.id}
                style={{ padding: "5px", cursor: "pointer", display: "flex", alignItems: "center" }}
                onClick={() => {
                  setSelected(type);
                  setOpen(false);
                }}
              >
                {type.icon && (
                  <img
                    src={type.icon}
                    width="20"
                    alt={type.label}
                    style={{ marginRight: 6 }}
                  />
                )}
                <span>{type.type_name}</span>
                {type.seat_capacity && (
                  <span style={{ marginLeft: 8, color: "#888", fontSize: 12 }}>
                    ({type.seat_capacity} seats)
                  </span>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
