import React, { useRef, useEffect, useState, useCallback } from "react";
import { useBookingStore } from "../../store/bookingStore";

// Levenshtein distance for typo correction
const levenshteinDistance = (a, b) => {
  const matrix = Array(b.length + 1)
    .fill()
    .map(() => Array(a.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  return matrix[b.length][a.length];
};

// Extract city from Google prediction
const extractCityFromPrediction = (prediction) => {
  return (
    prediction.structured_formatting?.main_text ||
    prediction.terms?.[0]?.value ||
    (typeof prediction.description === "string" ? prediction.description.split(",")[0] : "") ||
    ""
  );
};

// Correct city input with typo tolerance
const correctedCity = (query, suggestions) => {
  if (!suggestions || suggestions.length === 0) {
    return { city: query, placeId: null };
  }
  let minDistance = Infinity;
  let bestMatch = null;
  suggestions.forEach((suggestion) => {
    if (suggestion.city) {
      const dist = levenshteinDistance(query.toLowerCase(), suggestion.city.toLowerCase());
      if (dist < minDistance && dist <= 3) {
        minDistance = dist;
        bestMatch = suggestion;
      }
    }
  });
  if (bestMatch) {
    return { city: bestMatch.city, placeId: bestMatch.place_id || bestMatch.id };
  }
  return { city: query, placeId: null };
};

// Debounce utility to limit API calls
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Simple in-memory cache for suggestions
const suggestionCache = new Map();

function LocationAutocomplete({
  label = "Location",
  placeholder = "Search Location",
  dropoff = false,
  setCoords,
  onSelect
}) {
  // Zustand booking store
  const setPickupLocation = useBookingStore((state) => state.setPickupLocation);
  const setDropoffLocation = useBookingStore((state) => state.setDropoffLocation);
  const setPickupCoords = useBookingStore((state) => state.setPickupCoords);
  const setDropoffCoords = useBookingStore((state) => state.setDropoffCoords);

  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestionSelected, setSuggestionSelected] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch lat/lng from placeId
  const fetchLatLng = (placeId, city) => {
    if (!window.google?.maps?.Geocoder || !placeId) {
      if (setCoords) setCoords({ lat: null, lng: null });
      if (dropoff) setDropoffCoords({ lat: null, lng: null });
      else setPickupCoords({ lat: null, lng: null });
      return;
    }
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        const { lat, lng } = results[0].geometry.location;
        const coordsObj = { lat: lat(), lng: lng() };
        if (setCoords) setCoords(coordsObj);
        if (dropoff) setDropoffCoords(coordsObj);
        else setPickupCoords(coordsObj);
      } else {
        if (setCoords) setCoords({ lat: null, lng: null });
        if (dropoff) setDropoffCoords({ lat: null, lng: null });
        else setPickupCoords({ lat: null, lng: null });
      }
    });
  };

  // Debounced fetch suggestions
  const fetchSuggestions = useCallback(
    debounce((value) => {
      if (!value || !window.google?.maps?.places) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      if (suggestionCache.has(value)) {
        setSuggestions(suggestionCache.get(value));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        {
          input: value,
          componentRestrictions: { country: "in" },
          types: ["(cities)"],
        },
        (predictions, status) => {
          setIsLoading(false);
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            const mapped = predictions.map((p) => ({
              ...p,
              city: extractCityFromPrediction(p),
              id: p.place_id,
            }));
            suggestionCache.set(value, mapped);
            setSuggestions(mapped);
          } else {
            setSuggestions([]);
          }
        }
      );
    }, 300),
    []
  );

  useEffect(() => {
    fetchSuggestions(input);
  }, [input, fetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Display value: always show selected city if selected, otherwise input, otherwise default
  let displayValue = "";
  if (selected && (selected.city || selected.description)) {
    displayValue = selected.city || selected.description;
  } else if (input) {
    displayValue = input;
  } else {
    displayValue = "Calicut";
  }

  // When user selects a suggestion
  const handleSelect = (suggestion) => {
    const city = suggestion.city || suggestion.description;
    setInput(city);
    setSelected(suggestion);
    setSuggestionSelected(true);
    setSuggestions([]);
    setIsOpen(false);

    // Zustand store update
    if (dropoff) {
      setDropoffLocation(city);
    } else {
      setPickupLocation(city);
    }

    onSelect?.(city);
    if (suggestion.place_id) fetchLatLng(suggestion.place_id, city);
  };

  // On blur: auto-select if input exactly matches a suggestion, or use corrected city
  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      // If a suggestion was just selected, don't override
      if (suggestionSelected) {
        setSuggestionSelected(false);
        return;
      }
      // If input matches a suggestion exactly, select it
      if (input && suggestions.length > 0) {
        const exact = suggestions.find(
          (s) =>
            (s.city && s.city.toLowerCase() === input.trim().toLowerCase()) ||
            (s.description && s.description.toLowerCase() === input.trim().toLowerCase())
        );
        if (exact) {
          setSelected(exact);
          setInput(exact.city || exact.description);

          // Zustand store update
          if (dropoff) {
            setDropoffLocation(exact.city || exact.description);
          } else {
            setPickupLocation(exact.city || exact.description);
          }

          onSelect?.(exact.city || exact.description);
          if (exact.place_id) fetchLatLng(exact.place_id, exact.city || exact.description);
          setSuggestions([]);
        } else {
          // Use corrected city if typo
          const correction = correctedCity(input.trim(), suggestions);
          if (correction.city && correction.city !== input.trim()) {
            setInput(correction.city);
            setSelected(
              suggestions.find(
                (s) =>
                  (s.city && s.city.toLowerCase() === correction.city.toLowerCase()) ||
                  (s.description && s.description.toLowerCase() === correction.city.toLowerCase())
              ) || null
            );

            // Zustand store update
            if (dropoff) {
              setDropoffLocation(correction.city);
            } else {
              setPickupLocation(correction.city);
            }

            onSelect?.(correction.city);
            if (correction.placeId) fetchLatLng(correction.placeId, correction.city);
            setSuggestions([]);
          }
        }
      }
    }, 100); // Delay to allow click event to fire before blur
  };

  return (
    <div ref={containerRef} className="form-item dropdown ps-2 ps-sm-3" style={{ position: "relative", width: "100%" }}>
      <div onClick={() => setIsOpen(true)}>
        <label className="form-label fs-14 text-default mb-1">
          {dropoff && (
            <span className="way-icon badge badge-primary rounded-pill translate-middle">
              <i className="fa-solid fa-arrow-right-arrow-left"></i>
            </span>
          )}
          {label}
        </label>
        <br />
        <span>{displayValue}</span>
      </div>

      {isOpen && (
        <div
          className="dropdown-menu dropdown-md p-0 show"
          style={{ position: "absolute", width: "100%", marginTop: "140px", zIndex: 2000 }}
        >
          <div className="input-search p-3 border-bottom">
            <div className="input-group">
              <input
                ref={inputRef}
                type="text"
                className="form-control"
                placeholder={placeholder}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setIsOpen(true);
                  setSelected(null); // Clear selection on new input
                  setSuggestionSelected(false);
                }}
                onFocus={() => setIsOpen(true)}
                onBlur={handleBlur}
                autoComplete="off"
                style={{ background: "#fff" }}
              />
              <span className="input-group-text px-2 border-start-0">
                <i className="isax isax-search-normal"></i>
              </span>
            </div>
          </div>

          {isLoading && <div className="p-3">Loading...</div>}
          {!isLoading && suggestions.length > 0 && (
            <div style={{ maxHeight: 200, overflowY: "auto", background: "#fff" }}>
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.place_id}
                  className="dropdown-item"
                  style={{ padding: "5px", cursor: "pointer", display: "flex", alignItems: "center" }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(suggestion);
                  }}
                >
                  <span className="input-group-text px-2 border-start-0 m-1">
                    <i className="isax isax-location5"></i>
                  </span>
                  {suggestion.city || suggestion.description}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LocationAutocomplete;
