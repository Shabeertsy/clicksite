// src/components/DestinationItem.jsx
import { Link } from "react-router-dom";

export default function DestinationItem({ dest }) {

  const packageId = dest.id || dest.title || "unknown";
  const linkTo = `/packages/${encodeURIComponent(packageId)}`;

  return (
    <div
      className="destination-item mb-4 wow fadeInUp"
      data-wow-delay="0.2s"
    >
      <img src={dest.img} alt={dest.title || "Destination"} />
      <div className="destination-info text-center">
        <div className="destination-content">
          <h5 className="mb-1 text-white">{dest.title}</h5>
        </div>
        <div className="destination-overlay bg-white mt-2">
          <div className="d-flex">
            <div
              className={`col${
                dest.title ? " border-end" : ""
              }`}
            >
            </div>
            {dest.hotels && (
              <div className={`col${dest.cruises ? " border-end" : ""}`}>
                <div className="count-info text-center">
                  <span className="d-block mb-1 text-cyan">
                    <i className="isax isax-buildings"></i>
                  </span>
                  <h6 className="fs-13 fw-medium">{dest.hotels}</h6>
                </div>
              </div>
            )}
            {dest.cruises && (
              <div className="col">
                <div className="count-info text-center">
                  <span className="d-block mb-1 text-success">
                    <i className="isax isax-ship"></i>
                  </span>
                  <h6 className="fs-13 fw-medium">{dest.cruises}</h6>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Link to={linkTo} className="overlay-circle-link">
        <i className="isax isax-arrow-right-1"></i>
      </Link>
    </div>
  );
}
