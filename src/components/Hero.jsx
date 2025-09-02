import React, { useRef, useEffect, useState } from "react";
import './Hero.css'
import CustomDropdown from "./CustomDropdown";

function LocationAutocomplete({ label = "Drop Off Location", placeholder = "Search Location", onSelect }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      let interval = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    let active = true;
    if (!input || !window.google || !window.google.maps || !window.google.maps.places) {
      setSuggestions([]);
      return;
    }
    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: "in" },
        types: ["(cities)"],
      },
      (predictions, status) => {
        if (active) {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
          } else {
            setSuggestions([]);
          }
        }
      }
    );
    return () => {
      active = false;
    };
  }, [input]);

  
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(suggestion) {
    setInput(suggestion.description);
    setSuggestions([]);
    setOpen(false);
    if (onSelect) onSelect(suggestion.description);
  }

  return (
    <div className="form-item dropdown ps-2 ps-sm-3" ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <div
        data-bs-toggle="dropdown"
        data-bs-auto-close="outside"
        aria-expanded={open}
        role="menu"
        onClick={() => setOpen(true)}
      >
        <label className="form-label fs-14 text-default mb-1">
          {label}
        </label>
        <br />
        <span>{input || "Calicut"}</span>
      </div>
      <div className="dropdown-menu dropdown-md p-0" style={{ display: open ? "block" : "none", position: "absolute", width: "100%", zIndex: 2 }}>
        <div className="input-search p-3 border-bottom">
          <div className="input-group">
            <input
              ref={inputRef}
              type="text"
              className="form-control"
              placeholder={placeholder}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              autoComplete="off"
              style={{ background: "#fff" }}
            />
            <span className="input-group-text px-2 border-start-0">
              <i className="isax isax-search-normal"></i>
            </span>
          </div>
        </div>
        {suggestions.length > 0 && (
          <div style={{ maxHeight: 200, overflowY: "auto", background: "#fff" }}>
            {suggestions.map(suggestion => (
              <div
                key={suggestion.place_id}
                className="dropdown-item"
                style={{
                  padding: "5px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
                onClick={() => handleSelect(suggestion)}
              >
                 <span className="input-group-text px-2 border-start-0 m-1">
              <i className="isax isax-location5"></i>
            </span>
                {suggestion.description}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



export default function Hero() {

  return (
    <section className="hero-section">
      <div className="banner-slider banner-sec owl-carousel">
        <div className="slider-img">
          <img src="assets/img/banner/banner-01.jpg" alt="Img" />
        </div>
        <div className="slider-img">
          <img src="assets/img/banner/banner-02.jpg" alt="Img" />
        </div>
        <div className="slider-img">
          <img src="assets/img/banner/banner-03.jpg" alt="Img" />
        </div>
        <div className="slider-img">
          <img src="assets/img/banner/banner-04.jpg" alt="Img" />
        </div>
      </div>
      <div className="container">
        <div className="hero-content">
          <div className="row align-items-center">
            <div
              className="col-md-12 mx-auto wow fadeInUp"
              data-wow-delay="0.3s"
            >
              <div className="banner-content mx-auto">
                <h1 className="text-white display-5 mb-2">
                  Get Closer to the Dream: <span>Your Tour</span> Essentials Await
                </h1>
                <h6 className="text-light mx-auto">
                  Your ultimate destination for all things help you celebrate &amp; remember tour experience.
                </h6>
              </div>
              <div className="banner-form card mb-0">
                <div className="card-body">
                  <div>
                    <div className="tab-content">
                      <div className="tab-pane fade active show" id="flight">
                        <form action="https://dreamstour.dreamstechnologies.com/html/flight-grid.html">
                          <div className="normal-trip">
                            <div className="d-lg-flex">
                              <div className="d-flex form-info">

                                <LocationAutocomplete label="Drop Off Location" placeholder="Search Location" />
                                <LocationAutocomplete label="Drop Off Location" placeholder="Search Location" />
                                <div className="form-item">
                                  <label className="form-label fs-14 text-default mb-1">From Date</label>
                                  <input
                                    type="text"
                                    id="checkin"
                                    className="form-control"
                                    placeholder="Today Date"
                                    data-enable-time="true"
                                    data-date-format="d-m-Y H:i"
                                    data-min-date="today"
                                    autoComplete="off"
                                  />
                                </div>
                                {/* To Date */}
                                <div className="form-item">
                                  <label className="form-label fs-14 text-default mb-1">
                                    To Date
                                  </label>
                                  <input
                                    type="text"
                                    id="checkout"
                                    className="form-control"
                                    placeholder="Today Date"
                                  />
                                </div>
                                {/* Custom Dropdown */}
                                <CustomDropdown />
                              </div>
                              <button
                                type="submit"
                                className="btn btn-primary search-btn rounded"
                              >
                                Search
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
