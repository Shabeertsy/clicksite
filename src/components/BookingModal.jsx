import { useState, useEffect, useRef, useCallback } from "react";
import Slider from "react-slick";
import axios from "axios";
import { baseUrl } from "../Constants";

// Levenshtein distance function for typo correction
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
    } else {
      console.warn("Invalid suggestion format:", suggestion);
    }
  });
  if (bestMatch) {
    return { city: bestMatch.city, placeId: bestMatch.id };
  }
  return { city: query, placeId: null };
};

export function BookingModal({ onSubmit, onPickupChange, setDistanceText, setDistanceValue, setForm, form, onDropChange }) {
  const today = new Date().toISOString().split("T")[0];

  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [typesError, setTypesError] = useState(null);

  // Suggestions state for dropdowns
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState({ pickup: false, dropoff: false });
  const [suggestionSelected, setSuggestionSelected] = useState({ pickup: false, dropoff: false });

  const [pickupCoords, setPickupCoords] = useState({ lat: null, lng: null });
  const [dropoffCoords, setDropoffCoords] = useState({ lat: null, lng: null });
  const [searchResults, setSearchResults] = useState([]);

  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);

  // Local form state
  const [localForm, setLocalForm] = useState(
    form || {
      pickup: "",
      dropoff: "",
      pickupDate: today,
      pickupTime: "",
      returnDate: today,
      returnTime: "",
      vehicleType: "",
    }
  );

  // Keep localForm in sync with parent form if provided
  useEffect(() => {
    if (form) setLocalForm(form);
  }, [form]);

  // Google Maps script loader
  useEffect(() => {
    if (!window.google || !window.google.maps) {
      const script = document.createElement("script");
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  // Fetch vehicle types
  useEffect(() => {
    const fetchVehicleTypes = async () => {
      setLoadingTypes(true);
      setTypesError(null);
      try {
        const response = await axios.get(`${baseUrl}api/list-vehicle-types/`);
        let types = response.data;
        if (Array.isArray(types)) {
          const normalizedTypes = types.map((type) => ({
            id: type.id ?? type.vehicle_type ?? JSON.stringify(type),
            label: type.label ?? type.vehicle_type ?? "Unknown",
            seat_capacity: type.seat_capacity ?? "-",
            type_name: type.type_name ?? type.label ?? type.vehicle_type ?? "Unknown",
            icon: type.icon ?? null,
          }));
          setVehicleTypes(normalizedTypes);
        }
      } catch {
        setTypesError("Failed to load vehicle types");
        setVehicleTypes([]);
      } finally {
        setLoadingTypes(false);
      }
    };
    fetchVehicleTypes();
  }, []);

  // Fetch banner images
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseUrl}api/list-banner-images/`);
        const urls = Array.isArray(response.data) ? response.data.map((item) => item.url) : [];
        setImageUrls(urls);
      } catch (error) {}
    };
    fetchData();
  }, []);

  // Fetch location suggestions for dropdown (from Google Places or fallback to backend)
  const fetchLocationSuggestions = useCallback(
    async (query, forField) => {
      if (!query || query.length < 2) {
        if (forField === "pickup") setPickupSuggestions([]);
        else setDropoffSuggestions([]);
        setIsLoadingSuggestions((prev) => ({ ...prev, [forField]: false }));
        return [];
      }

      setIsLoadingSuggestions((prev) => ({ ...prev, [forField]: true }));

      // Try Google Places API first
      if (window.google && window.google.maps && window.google.maps.places) {
        const autocompleteService = new window.google.maps.places.AutocompleteService();
        try {
          const response = await new Promise((resolve, reject) => {
            autocompleteService.getPlacePredictions(
              {
                input: query,
                types: ["(regions)"],
                componentRestrictions: { country: "in" },
              },
              (predictions, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                  resolve(predictions || []);
                } else {
                  reject(new Error(status));
                }
              }
            );
          });

          const suggestions = response
            .map((prediction) => {
              const terms = prediction.structured_formatting?.secondary_text?.split(", ") || [];
              if (terms.some((term) => term.includes("India"))) {
                return {
                  id: prediction.place_id,
                  city: prediction.structured_formatting?.main_text || prediction.description || "",
                  district: terms[0] || "",
                  state: terms[1] || "",
                  lat: null,
                  lng: null,
                };
              }
              return null;
            })
            .filter((suggestion) => suggestion !== null);

          if (forField === "pickup") setPickupSuggestions(suggestions);
          else setDropoffSuggestions(suggestions);

          setIsLoadingSuggestions((prev) => ({ ...prev, [forField]: false }));
          return suggestions;
        } catch (error) {
          // fallback to backend below
        }
      }

      // Fallback: backend API
      try {
        const response = await axios.get(`${baseUrl}api/location-search-by-map/`, {
          params: { q: query, page: 1, country: "in" },
        });
        const suggestions = Array.isArray(response.data.results)
          ? response.data.results.filter((suggestion) =>
              suggestion.state?.toLowerCase().includes("india") ||
              suggestion.district?.toLowerCase().includes("india") ||
              suggestion.city?.toLowerCase().includes("india")
            )
          : [];
        if (forField === "pickup") setPickupSuggestions(suggestions);
        else setDropoffSuggestions(suggestions);
        setIsLoadingSuggestions((prev) => ({ ...prev, [forField]: false }));
        return suggestions;
      } catch (error) {
        if (forField === "pickup") setPickupSuggestions([]);
        else setDropoffSuggestions([]);
        setIsLoadingSuggestions((prev) => ({ ...prev, [forField]: false }));
        return [];
      }
    },
    [setPickupSuggestions, setDropoffSuggestions]
  );

  // Fetch place details (lat/lng) for a selected suggestion
  const fetchPlaceDetails = (placeId, forField) => {
    if (!placeId || !window.google || !window.google.maps || !window.google.maps.places) {
      return;
    }
    const placesService = new window.google.maps.places.PlacesService(document.createElement("div"));
    placesService.getDetails(
      { placeId, fields: ["geometry"] },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          if (lat >= 6 && lat <= 37 && lng >= 68 && lng <= 97) {
            if (forField === "pickup") {
              setPickupCoords({ lat, lng });
              if (typeof onPickupChange === "function") {
                onPickupChange({ lat, lng });
              }
            } else {
              onDropChange && onDropChange({ lat, lng });
              setDropoffCoords({ lat, lng });
            }
          } else {
            alert("Selected location is not in India.");
          }
        }
      }
    );
  };

  // Handle input change for pickup/dropoff
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalForm((prev) => ({ ...prev, [name]: value }));
    setForm && setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "pickup") {
      setSuggestionSelected((prev) => ({ ...prev, pickup: false }));
      fetchLocationSuggestions(value, "pickup");
      setPickupCoords({ lat: null, lng: null });
    }
    if (name === "dropoff") {
      setSuggestionSelected((prev) => ({ ...prev, dropoff: false }));
      fetchLocationSuggestions(value, "dropoff");
      setDropoffCoords({ lat: null, lng: null });
    }
  };

  // Handle blur for pickup input
  const handlePickupBlur = async () => {
    if (suggestionSelected.pickup) {
      setPickupSuggestions([]);
      return;
    }
    if (localForm.pickup && localForm.pickup.length >= 2) {
      const suggestions = await fetchLocationSuggestions(localForm.pickup, "pickup");
      if (suggestions.length > 0) {
        const corrected = correctedCity(localForm.pickup, suggestions);
        setLocalForm((prev) => ({ ...prev, pickup: corrected.city }));
        setForm && setForm((prev) => ({ ...prev, pickup: corrected.city }));
        if (corrected.placeId) {
          fetchPlaceDetails(corrected.placeId, "pickup");
        }
      } else {
        alert("Please enter a valid location in India.");
      }
      setPickupSuggestions([]);
    }
  };

  // Handle blur for dropoff input
  const handleDropoffBlur = async () => {
    if (suggestionSelected.dropoff) {
      setDropoffSuggestions([]);
      return;
    }
    if (localForm.dropoff && localForm.dropoff.length >= 2) {
      const suggestions = await fetchLocationSuggestions(localForm.dropoff, "dropoff");
      if (suggestions.length > 0) {
        const corrected = correctedCity(localForm.dropoff, suggestions);
        setLocalForm((prev) => ({ ...prev, dropoff: corrected.city }));
        setForm && setForm((prev) => ({ ...prev, dropoff: corrected.city }));
        if (corrected.placeId) {
          fetchPlaceDetails(corrected.placeId, "dropoff");
        }
      } else {
        alert("Please enter a valid location in India.");
      }
      setDropoffSuggestions([]);
    }
  };

  // Fetch distance between pickup and dropoff
  const fetchDistance = () => {
    if (!pickupCoords.lat || !pickupCoords.lng || !dropoffCoords.lat || !dropoffCoords.lng) {
      setDistanceText && setDistanceText("");
      setDistanceValue && setDistanceValue(null);
      return;
    }

    if (!window.google || !window.google.maps) {
      setDistanceText && setDistanceText("Google Maps not loaded");
      setDistanceValue && setDistanceValue(null);
      return;
    }

    const service = new window.google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [new window.google.maps.LatLng(pickupCoords.lat, pickupCoords.lng)],
        destinations: [new window.google.maps.LatLng(dropoffCoords.lat, dropoffCoords.lng)],
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (
          status === "OK" &&
          response.rows &&
          response.rows.length > 0 &&
          response.rows[0].elements &&
          response.rows[0].elements.length > 0 &&
          response.rows[0].elements[0].status === "OK"
        ) {
          const element = response.rows[0].elements[0];
          setDistanceText && setDistanceText(element.distance.text);
          setDistanceValue && setDistanceValue(element.distance.value);
        } else {
          setDistanceText && setDistanceText(status === "OK" ? "Distance not available" : "Error fetching distance");
          setDistanceValue && setDistanceValue(null);
        }
      }
    );
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const params = {
      lat: pickupCoords.lat ?? null,
      lng: pickupCoords.lng ?? null,
      type: localForm.vehicleType || null,
    };
    fetchDistance();
    try {
      const response = await axios.get(`${baseUrl}api/list-owner-vehicles/`, { params });
      setSearchResults(response.data);
      if (typeof onSubmit === "function") {
        onSubmit(response.data);
      }
    } catch (error) {
      setSearchResults([]);
    }
  };

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickupRef.current && !pickupRef.current.contains(event.target)) {
        setPickupSuggestions([]);
      }
      if (dropoffRef.current && !dropoffRef.current.contains(event.target)) {
        setDropoffSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate time options for select
  const generateTimeOptions = () =>
    [...Array(24)].map((_, i) => {
      const time = `${String(i).padStart(2, "0")}:00`;
      return <option key={i} value={time}>{time}</option>;
    });

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    arrows: false,
  };

  // Modal content
  return (
    <div
      className="modal fade"
      id="bookingModal"
      tabIndex="-1"
      aria-labelledby="bookingModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content rounded-3 border-0 shadow">
          <div className="modal-header bg-primary ">
            <h5 className="modal-title text-white" id="bookingModalLabel">
              Book Your Vehicle
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <form id="bookingForm" onSubmit={handleSubmit} autoComplete="off">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Pick Up Location</label>
                  <div className="position-relative" ref={pickupRef}>
                    <input
                      name="pickup"
                      placeholder="Enter your pickup location"
                      value={localForm.pickup}
                      onChange={handleChange}
                      onBlur={handlePickupBlur}
                      className="form-control"
                      autoComplete="off"
                      required
                    />
                    {isLoadingSuggestions.pickup && (
                      <span className="position-absolute end-0 top-50 translate-middle-y text-secondary px-2">Loading...</span>
                    )}
                    {pickupSuggestions.length > 0 && (
                      <ul className="list-group position-absolute w-100 z-3" style={{ maxHeight: 180, overflowY: "auto" }}>
                        {pickupSuggestions.map((item) => (
                          <li
                            key={item.id}
                            className="list-group-item list-group-item-action"
                            onMouseDown={() => {
                              setLocalForm((prev) => ({ ...prev, pickup: item.city }));
                              setForm && setForm((prev) => ({ ...prev, pickup: item.city }));
                              setSuggestionSelected((prev) => ({ ...prev, pickup: true }));
                              fetchPlaceDetails(item.id, "pickup");
                              setPickupSuggestions([]);
                            }}
                          >
                            <span className="fw-bold">{item.city}</span>
                            {item.district && <span className="text-secondary ms-1">{item.district}</span>}
                            {item.state && <span className="text-muted ms-1">{item.state}</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Drop Off Location</label>
                  <div className="position-relative" ref={dropoffRef}>
                    <input
                      name="dropoff"
                      placeholder="Enter your dropoff location"
                      value={localForm.dropoff}
                      onChange={handleChange}
                      onBlur={handleDropoffBlur}
                      className="form-control"
                      autoComplete="off"
                      required
                    />
                    {isLoadingSuggestions.dropoff && (
                      <span className="position-absolute end-0 top-50 translate-middle-y text-secondary px-2">Loading...</span>
                    )}
                    {dropoffSuggestions.length > 0 && (
                      <ul className="list-group position-absolute w-100 z-3" style={{ maxHeight: 180, overflowY: "auto" }}>
                        {dropoffSuggestions.map((item) => (
                          <li
                            key={item.id}
                            className="list-group-item list-group-item-action"
                            onMouseDown={() => {
                              setLocalForm((prev) => ({ ...prev, dropoff: item.city }));
                              setForm && setForm((prev) => ({ ...prev, dropoff: item.city }));
                              setSuggestionSelected((prev) => ({ ...prev, dropoff: true }));
                              fetchPlaceDetails(item.id, "dropoff");
                              setDropoffSuggestions([]);
                            }}
                          >
                            <span className="fw-bold">{item.city}</span>
                            {item.district && <span className="text-secondary ms-1">{item.district}</span>}
                            {item.state && <span className="text-muted ms-1">{item.state}</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Pick Up Date &amp; Time</label>
                  <div className="d-flex gap-2">
                    <input
                      type="date"
                      name="pickupDate"
                      min={today}
                      className="form-control"
                      value={localForm.pickupDate}
                      onChange={handleChange}
                      required
                    />
                    <select
                      name="pickupTime"
                      className="form-select"
                      value={localForm.pickupTime}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Time</option>
                      {generateTimeOptions()}
                    </select>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Return Date &amp; Time</label>
                  <div className="d-flex gap-2">
                    <input
                      type="date"
                      name="returnDate"
                      min={localForm.pickupDate}
                      className="form-control"
                      value={localForm.returnDate}
                      onChange={handleChange}
                      required
                    />
                    <select
                      name="returnTime"
                      className="form-select"
                      value={localForm.returnTime}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Time</option>
                      {generateTimeOptions()}
                    </select>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Vehicle Type</label>
                  <select
                    name="vehicleType"
                    className="form-select"
                    value={localForm.vehicleType}
                    onChange={handleChange}
                    disabled={loadingTypes || !!typesError}
                    required
                  >
                    <option value="">
                      {loadingTypes
                        ? "Loading vehicle types..."
                        : typesError
                        ? "Failed to load types"
                        : "Select vehicle type"}
                    </option>
                    {vehicleTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.type_name} {type.seat_capacity ? `(${type.seat_capacity} seats)` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3 d-flex align-items-end">
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    style={{ letterSpacing: ".5px" }}
                  >
                    Search Vehicle
                  </button>
                </div>
              </div>
            </form>
            {/* Optionally, show search results or distance info here */}
          </div>
        </div>
      </div>
    </div>
  );
}
