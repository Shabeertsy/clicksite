import React from "react";

// VehicleCard component: Handles rendering of a single place card
const VehicleCard = ({ images, title, location, price, facilitiesIcons, moreCount }) => {
  // Dummy images data as per the provided HTML snippet

  return (
    <div className="col-lg-4">
      <div className="place-item mb-4">
        <div className="place-img">
          <div className="img-slider image-slide owl-carousel nav-center">
          {Array.isArray(images) && images.length > 0 ? (
            images.map((img, i) => (
              <div key={i} className="slide-images">
                <a href="hotel-details.html">
                  <img
                    src={img?.image ? img.image : img}
                    className="img-fluid"
                    alt={`vehicle-img-${i}`}
                    onError={e => { e.target.onerror = null; e.target.src = "/default-vehicle.jpg"; }}
                  />
                </a>
              </div>
            ))
          ) : (
            <div className="slide-images">
              <a href="hotel-details.html">
                <img src="/default-vehicle.jpg" className="img-fluid" alt="default vehicle" />
              </a>
            </div>
          )}

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
              {price} <span className="fs-14 fw-normal text-default"></span>
            </h5>
            <a href="javascript:void(0);" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#bookingModal">
              Book Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;