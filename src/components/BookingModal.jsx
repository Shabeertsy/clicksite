import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../Constants";
import { useBookingStore } from "../store/bookingStore";
import DatePicker from "./Datepicker/DatePicker";



function formatDateToYMD(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const pad = (n) => (n < 10 ? "0" + n : n);
    return (
      d.getFullYear() +
      "-" +
      pad(d.getMonth() + 1) +
      "-" +
      pad(d.getDate())
    );
  } catch {
    return dateStr;
  }
}

const BookingModal = ({ vehicle, pkg }) => {
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [tripTypes, setTripTypes] = useState([]);
  const [form, setForm] = useState({
    client_name: "",
    phone: "",
    pickup: "",
    dropoff: "",
    pickupDate: "",
    returnDate: "",
    tripType: "",
    view_points: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const pickupLocationStore = useBookingStore((state) => state.pickupLocation);
  const dropoffLocationStore = useBookingStore((state) => state.dropoffLocation);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      pickup: pickupLocationStore || "",
      dropoff: dropoffLocationStore || "",
    }));
  }, [pickupLocationStore, dropoffLocationStore]);

  useEffect(() => {
    const fetchTripTypes = async () => {
      try {
        const response = await axios.get(`${baseUrl}list-trip-types/`, {
          headers: { "Content-Type": "application/json" },
        });
        const data = response.data;
        if (Array.isArray(data)) {
          setTripTypes(data);
          if (data.length > 0 && !form.tripType) {
            setForm((prev) => ({ ...prev, tripType: data[0].id }));
          }
        } else {
          setError("Failed to fetch trip types.");
        }
      } catch (err) {
        setError("Error fetching trip types: " + (err?.message || ""));
      }
    };
    fetchTripTypes();
  }, []);


  
  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: value,
    }));
    setFieldErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  // Helper to close modal using Bootstrap API
  const closeModal = () => {
    // Try Bootstrap 5 API
    const modalEl = document.getElementById("bookingModal");
    if (modalEl && window.bootstrap && window.bootstrap.Modal) {
      const modalInstance = window.bootstrap.Modal.getOrCreateInstance(modalEl);
      modalInstance.hide();
    } else if (window.$ && window.$.fn && window.$.fn.modal) {
      // fallback for jQuery-based Bootstrap
      window.$("#bookingModal").modal("hide");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});
    try {
      const pickupDateFormatted = formatDateToYMD(form.pickupDate);
      const returnDateFormatted = formatDateToYMD(form.returnDate);

      const tripStartDate = pickupDateFormatted || "";
      const tripEndDate = returnDateFormatted || "";

      const bookingPayload = {
        phone_number: form.phone,
        trip_type: form.tripType,
        owner_vehicle: vehicle?.id,
        trip_start_date: tripStartDate,
        trip_end_date: tripEndDate,
        from_location:
          pkg && pkg.start_location_text
            ? pkg.start_location_text
            : form.pickup,
        to_location:
          pkg && pkg.destination_text
            ? pkg.destination_text
            : form.dropoff,
        is_from_trip: !!form.returnDate,
        view_points: form.view_points,
        client_name: form.client_name,
        package: pkg && pkg.id,
      };

      const response = await fetch(`${baseUrl}book-vehicle/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        // Try to extract field errors
        if (data.errors) {
          setFieldErrors(data.errors);
          setError("Please correct the highlighted errors.");
        } else if (data.message) {
          setError(data.message);
        } else {
          setError("Booking failed");
        }
        return;
      }

      setSuccess("Booking successful!");
      setForm({
        client_name: "",
        phone: "",
        pickup: "",
        dropoff: "",
        pickupDate: "",
        returnDate: "",
        tripType: "",
        view_points: "",
      });

      // Show custom popup and auto close modal after 2 seconds
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
        closeModal();
      }, 2000);
    } catch (err) {
      setError(err.message || "Booking failed");
    }
  };

  return (
    <>
      {/* Custom Success Popup */}
      {showSuccessPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 2000,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "2rem 2.5rem",
              boxShadow: "0 2px 24px rgba(0,0,0,0.15)",
              textAlign: "center",
              minWidth: "320px",
              maxWidth: "90vw",
            }}
          >
            <div style={{ fontSize: "2.5rem", color: "#198754", marginBottom: "1rem" }}>
              <i className="isax isax-tick-circle"></i>
            </div>
            <h4 style={{ color: "#198754", marginBottom: "0.5rem" }}>Booking Successful!</h4>
            <div>Your booking has been confirmed.</div>
            <div style={{ marginTop: "1.5rem", color: "#888", fontSize: "0.95rem" }}>
              Closing in 2 seconds...
            </div>
          </div>
        </div>
      )}

      <div
        className="modal fade"
        id="bookingModal"
        tabIndex={-1}
        aria-labelledby="bookingModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content rounded-3 border-0 shadow">
            {/* Header */}
            <div className="modal-header bg-primary ">
              <h5 className="modal-title text-white" id="bookingModalLabel">
                Book Your Stay
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            {/* Body */}
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              {/* Remove default success alert, use custom popup instead */}
              <form id="bookingForm" onSubmit={handleSubmit}>
                <div className="row">
                  {/* Name */}
                  <div className="col-md-4 mb-3">
                    <label htmlFor="client_name" className="form-label">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="client_name"
                      className={`form-control${fieldErrors.client_name ? " is-invalid" : ""}`}
                      placeholder="Enter your name"
                      required
                      value={form.client_name}
                      onChange={handleChange}
                    />
                    {fieldErrors.client_name && (
                      <div className="invalid-feedback">
                        {fieldErrors.client_name.join
                          ? fieldErrors.client_name.join(" ")
                          : fieldErrors.client_name}
                      </div>
                    )}
                  </div>
                  {/* Phone */}
                  <div className="col-md-4 mb-3">
                    <label htmlFor="phone" className="form-label">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className={`form-control${fieldErrors.phone_number ? " is-invalid" : ""}`}
                      placeholder="Enter your phone"
                      required
                      value={form.phone}
                      onChange={handleChange}
                    />
                    {fieldErrors.phone_number && (
                      <div className="invalid-feedback">
                        {fieldErrors.phone_number.join
                          ? fieldErrors.phone_number.join(" ")
                          : fieldErrors.phone_number}
                      </div>
                    )}
                  </div>
                  {/* Pick Up Location */}
                  <div className="col-md-4 mb-3">
                    <label htmlFor="pickup" className="form-label">
                      Pick Up Location
                    </label>
                    <input
                      type="text"
                      id="pickup"
                      className={`form-control${fieldErrors.from_location ? " is-invalid" : ""}`}
                      placeholder="Enter pick up location"
                      required
                      value={form.pickup}
                      onChange={handleChange}
                    />
                    {pickupLocationStore && (
                      <div className="form-text text-success"></div>
                    )}
                    {fieldErrors.from_location && (
                      <div className="invalid-feedback">
                        {fieldErrors.from_location.join
                          ? fieldErrors.from_location.join(" ")
                          : fieldErrors.from_location}
                      </div>
                    )}
                  </div>
                </div>

                <div className="row">
                  {/* Drop Off Location */}
                  <div className="col-md-4 mb-3">
                    <label htmlFor="dropoff" className="form-label">
                      Drop Off Location
                    </label>
                    <input
                      type="text"
                      id="dropoff"
                      className={`form-control${fieldErrors.to_location ? " is-invalid" : ""}`}
                      placeholder="Enter drop off location"
                      required
                      value={form.dropoff}
                      onChange={handleChange}
                    />
                    {dropoffLocationStore && (
                      <div className="form-text text-success"></div>
                    )}
                    {fieldErrors.to_location && (
                      <div className="invalid-feedback">
                        {fieldErrors.to_location.join
                          ? fieldErrors.to_location.join(" ")
                          : fieldErrors.to_location}
                      </div>
                    )}
                  </div>
                  {/* Pick Up Date & Time */}
                  <div className="col-md-4 mb-3">
                    <label htmlFor="pickupDate" className="form-label">
                      Pick Up Date &amp; Time
                    </label>
                    <DatePicker
                      value={form.pickupDate}
                      onChange={([date]) =>
                        setForm((prev) => ({
                          ...prev,
                          pickupDate: date,
                        }))
                      }
                    />
                    {fieldErrors.trip_start_date && (
                      <div className="invalid-feedback d-block">
                        {fieldErrors.trip_start_date.join
                          ? fieldErrors.trip_start_date.join(" ")
                          : fieldErrors.trip_start_date}
                      </div>
                    )}
                  </div>
                  {/* Return Date & Time */}
                  <div className="col-md-4 mb-3">
                    <label htmlFor="returnDate" className="form-label">
                      Return Date &amp; Time
                    </label>
                    <DatePicker
                      value={form.returnDate}
                      onChange={([date]) =>
                        setForm((prev) => ({
                          ...prev,
                          returnDate: date,
                        }))
                      }
                    />
                    {fieldErrors.trip_end_date && (
                      <div className="invalid-feedback d-block">
                        {fieldErrors.trip_end_date.join
                          ? fieldErrors.trip_end_date.join(" ")
                          : fieldErrors.trip_end_date}
                      </div>
                    )}
                  </div>
                </div>

                <div className="row">
                  {/* Trip Type */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="tripType" className="form-label">
                      Trip Type
                    </label>
                    <select
                      id="tripType"
                      className={`form-select${fieldErrors.trip_type ? " is-invalid" : ""}`}
                      required
                      value={form.tripType}
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        Select trip type
                      </option>
                      {tripTypes.map((type) => (
                        <option
                          key={type.trip_type}
                          value={type.id}
                          style={{ color: "#000" }}
                        >
                          {type.trip_type}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.trip_type && (
                      <div className="invalid-feedback">
                        {fieldErrors.trip_type.join
                          ? fieldErrors.trip_type.join(" ")
                          : fieldErrors.trip_type}
                      </div>
                    )}
                  </div>
                  {/* View Point */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="view_points" className="form-label">
                      View Point
                    </label>
                    <input
                      type="text"
                      id="view_points"
                      className={`form-control${fieldErrors.view_points ? " is-invalid" : ""}`}
                      placeholder="Enter view point"
                      required
                      value={form.view_points}
                      onChange={handleChange}
                    />
                    {fieldErrors.view_points && (
                      <div className="invalid-feedback">
                        {fieldErrors.view_points.join
                          ? fieldErrors.view_points.join(" ")
                          : fieldErrors.view_points}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="text-center view-all ">
                  <button type="submit" className="btn btn-primary">
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingModal;
