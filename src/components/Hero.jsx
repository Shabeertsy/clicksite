import React, { useRef, useEffect, useState, useCallback } from "react";
import "./Hero.css";
import CustomDropdown from "./CustomDropdown";
import LocationAutocomplete from "./LocationAutocomplete/LocationAutocomplete";
import { useVehicleStore } from "../store/vehicleStore";
import { useBookingStore } from "../store/bookingStore";
import DatePicker from "./Datepicker/DatePicker";



const Hero = () => {
  const [pickupCoords, setPickupCoords] = useState({ lat: null, lng: null });
  const [dropoffCoords, setDropoffCoords] = useState({ lat: null, lng: null });
  const [isLoading, setIsLoading] = useState(false);

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const selected = useVehicleStore((state) => state.selected);
  const pickupLocation = useBookingStore((state) => state.pickupLocation);
  const dropoffLocation = useBookingStore((state) => state.dropoffLocation);
  const pickupCoordsStore = useBookingStore((state) => state.pickupCoords);
  const dropoffCoordsStore = useBookingStore((state) => state.dropoffCoords);

  const setDistance = useVehicleStore((state) => state.setDistance);

  console.log(
    "log check adfafdafadf",
    selected,
    pickupLocation,
    pickupCoordsStore,
    dropoffLocation,
    dropoffCoordsStore
  );

  // Fetch distance only after dropoff location is completed
  const fetchDistance = useCallback(() => {
    if (
      !pickupCoords.lat ||
      !pickupCoords.lng ||
      !dropoffCoords.lat ||
      !dropoffCoords.lng
    ) {
      setDistance({ text: "", value: null });
      return;
    }

    if (!window.google?.maps?.DistanceMatrixService) {
      setDistance({ text: "Google Maps not loaded", value: null });
      return;
    }

    setIsLoading(true);
    const service = new window.google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [
          new window.google.maps.LatLng(pickupCoords.lat, pickupCoords.lng),
        ],
        destinations: [
          new window.google.maps.LatLng(dropoffCoords.lat, dropoffCoords.lng),
        ],
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        setIsLoading(false);
        if (
          status === "OK" &&
          response?.rows?.[0]?.elements?.[0]?.status === "OK"
        ) {
          const element = response.rows[0].elements[0];
          setDistance({
            text: element.distance.text,
            value: element.distance.value,
          });
        } else {
          setDistance({ text: "Error fetching distance", value: null });
        }
      }
    );
  }, [pickupCoords, dropoffCoords, setDistance]);

  useEffect(() => {
    if (
      dropoffCoords.lat &&
      dropoffCoords.lng &&
      pickupCoords.lat &&
      pickupCoords.lng
    ) {
      fetchDistance();
    }
  }, [dropoffCoords, pickupCoords, fetchDistance]);

  useEffect(() => {
    if (
      pickupCoords.lat &&
      pickupCoords.lng &&
      dropoffCoords.lat &&
      dropoffCoords.lng
    ) {
      fetchDistance();
    }
  }, [pickupCoords, dropoffCoords, fetchDistance]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchDistance();
  };

  return (
    <section className="hero-section">
      <div className="banner-slider banner-sec owl-carousel">
        {[
          "banner-01.jpg",
          "banner-02.jpg",
          "banner-03.jpg",
          "banner-04.jpg",
        ].map((img, index) => (
          <div key={index} className="slider-img">
            <img
              src={`assets/img/banner/${img}`}
              alt={`Banner ${index + 1}`}
            />
          </div>
        ))}
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
                  Get Closer to the Dream: <span>Your Tour</span> Essentials
                  Await
                </h1>
                <h6 className="text-light mx-auto">
                  Your ultimate destination for all things to help you celebrate
                  & remember your tour experience.
                </h6>
              </div>
              <div className="banner-form card mb-0">
                <div className="card-body">
                  <div className="tab-content">
                    <div
                      className="tab-pane fade active show"
                      id="flight"
                    >
                      <form onSubmit={handleSubmit}>
                        <div className="normal-trip">
                          <div className="d-lg-flex">
                            <div className="d-flex form-info">
                              <LocationAutocomplete
                                label="Pickup Location"
                                placeholder="Search Location"
                                dropoff={false}
                                setCoords={setPickupCoords}
                              />
                              <LocationAutocomplete
                                label="Drop Off Location"
                                placeholder="Search Location"
                                dropoff={true}
                                setCoords={setDropoffCoords}
                              />

                              <div className="form-item ">
                                <label className="form-label fs-14 text-default mb-1">
                                  From Date
                                </label>
                                <DatePicker
                                  value={fromDate}
                                  onChange={([date]) => setFromDate(date)}
                                />
                              </div>
                              <div className="form-item">
                                <label className="form-label fs-14 text-default mb-1">
                                  To Date
                                </label>
                                <DatePicker
                                  value={toDate}
                                  onChange={([date]) => setToDate(date)}
                                />
                              </div>
                              <CustomDropdown />
                            </div>
                            <button
                              type="submit"
                              className="btn btn-primary search-btn rounded"
                              disabled={isLoading}
                            >
                              {isLoading ? "Loading..." : "Search"}
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
    </section>
  );
};

export default Hero;