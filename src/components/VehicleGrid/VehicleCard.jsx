import React, { useEffect, useState } from "react";
import CustomDropdown from "../CustomDropdown";
import BookingModal from "../BookingModal";
import { useVehicleStore } from "../../store/vehicleStore";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css/pagination";
import "swiper/css/navigation";
import './grid.css'

function calculateTotalAmount(vehicle, distanceValue) {
  if (!distanceValue || !vehicle) return null;
  const distanceKm = distanceValue / 1000;
  const minFare =
    Number(vehicle.minimum_fare) >= 0 ? Number(vehicle.minimum_fare) : 0;
  const perKmRate = Number(vehicle.per_kilometer_rate) || 0;
  const fixedKm = Number(vehicle.fixed_km) || 100;

  if (minFare > 0) {
    if (distanceKm <= fixedKm) {
      return minFare;
    } else {
      return minFare + Math.round((distanceKm - fixedKm) * perKmRate);
    }
  } else {
    return Math.round(distanceKm * perKmRate);
  }
}

const VehicleCard = ({
  images,
  title,
  location,
  price,
  facilitiesIcons,
  moreCount,
  vehicle,
}) => {
  const vehicleData =
    vehicle ||
    {
      images,
      title,
      location,
      price,
      facilitiesIcons,
      moreCount,
    };

  const distance = useVehicleStore((state) => state.distance);

  const [calculatedAmount, setCalculatedAmount] = useState(null);

  useEffect(() => {
    if (distance && distance.value && vehicleData) {
      setCalculatedAmount(calculateTotalAmount(vehicleData, distance.value));
    } else {
      setCalculatedAmount(null);
    }
  }, [distance.value, vehicleData]);

  const openBookingModal = (e) => {
    e.preventDefault();
    if (window.bootstrap) {
      const modalEl = document.getElementById("bookingModal");
      if (modalEl) {
        const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
      }
    } else if (window.$ && window.$.fn && window.$.fn.modal) {
      window.$("#bookingModal").modal("show");
    }
  };

  // Helper to handle image error fallback
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "/default-vehicle.jpg";
  };

  return (
    <>
      <div className="col-lg-4">
        <div className="place-item mb-4">
          <div className="place-img">
            <div className="img-slider image-slide">
              <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                loop={true}
                className="vehicle-carousel"
              >
                {Array.isArray(images) && images.length > 0 ? (
                  images.map((img, i) => (
                    <SwiperSlide key={i}>
                      <div className="slide-images">
                        <a href="hotel-details.html">
                          <img
                            src={img?.image ? img.image : img}
                            className="img-fluid"
                            alt={`vehicle-img-${i}`}
                            onError={handleImageError}
                          />
                        </a>
                      </div>
                    </SwiperSlide>
                  ))
                ) : (
                  <SwiperSlide>
                    <div className="slide-images">
                      <a href="hotel-details.html">
                        <img
                          src="/default-vehicle.jpg"
                          className="img-fluid"
                          alt="default vehicle"
                        />
                      </a>
                    </div>
                  </SwiperSlide>
                )}
              </Swiper>
            </div>
            <div className="fav-item">
              <a href="" className="fav-icon selected">
                <i className="isax isax-heart5"></i>
              </a>
            </div>
          </div>
          <div className="place-content">
            <h5 className="mb-1">
              <a href="hotel-details.html">{title}</a>
            </h5>
            <p className="d-flex align-items-center mb-2">
              <i className="isax isax-location5 me-2"></i> {location}
            </p>
            <div className="border-top pt-2 mb-2">
              <h6 className="d-flex align-items-center">
                Facilities:
                {facilitiesIcons.map((icon, i) => (
                  <i key={i} className={`isax ${icon} ms-2 me-2 text-primary`}></i>
                ))}
                <a href="javascript:void(0);" className="fs-14 fw-normal text-default d-inline-block">
                  +{moreCount}
                </a>
              </h6>
            </div>
            <div className="d-flex align-items-center justify-content-between border-top pt-3">
              <h5 className="text-primary">
                {calculatedAmount !== null && calculatedAmount !== undefined ? (
                  <>
                    ₹{calculatedAmount}
                    <span className="fs-14 fw-normal text-default ms-2">
                      (est. for {distance.text})
                    </span>
                  </>
                ) : (
                  <>
                    {price} <span className="fs-14 fw-normal text-default"></span>
                  </>
                )}
              </h5>
              <button
                className="btn btn-primary"
                type="button"
                onClick={openBookingModal}
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
      <BookingModal vehicle={vehicleData} />
    </>
  );
};

export default VehicleCard;