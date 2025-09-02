import { useEffect, useRef, useState } from "react";

export default function CustomDropdown() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Select Departure");
  const dropdownRef = useRef(null);

  const options = [
    {
      label: (
        <>
          <img src="assets/img/about.png" width="20" alt="USA" /> New York
        </>
      ),
      value: "New York",
    },
    {
      label: (
        <>
          <img src="assets/img/about.png" width="20" alt="Spain" /> Barcelona
        </>
      ),
      value: "Barcelona",
    },
    {
      label: (
        <>
          <img src="assets/img/about.png" width="20" alt="UAE" /> Dubai
        </>
      ),
      value: "Dubai",
    },
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="form-item" style={{ position: "relative", width: "100%" }}>
      <div className="custom-dropdown" ref={dropdownRef}>
        <label>Departure:</label>
        <div
          className="dropdown-btn"
          style={{
            padding: "5px",
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={() => setOpen((o) => !o)}
        >
          {selected}
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
          }}
        >
          {options.map((opt, idx) => (
            <div
              className="dropdown-item"
              style={{
                padding: "5px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
              key={opt.value}
              onClick={() => {
                setSelected(opt.label);
                setOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}