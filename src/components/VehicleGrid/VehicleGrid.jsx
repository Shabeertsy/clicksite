import Banner from "../Banner";
import VehicleCard from "./VehicleCard";
import { useEffect, useState } from "react";
import { baseUrl } from "../../Constants";
import { useBookingStore } from "../../store/bookingStore";

export function VehicleGrid() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pickupCoords = useBookingStore((state) => state.pickupCoords);


  const fetchVehicles = async (coords) => {
    setLoading(true);
    setError(null);
    try {
      let url = `${baseUrl}list-owner-vehicles/`;
      if (coords && coords.lat && coords.lng) {
        const params = new URLSearchParams({
          lat: coords.lat,
          lng: coords.lng,
        });
        url += `?${params.toString()}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setVehicles(data.vehicles || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchVehicles(pickupCoords);
  }, [pickupCoords?.lat, pickupCoords?.lng]);


  const dynamicData = vehicles.map(vehicle => {
    let images = [];
    if (Array.isArray(vehicle.images) && vehicle.images.length > 0) {
      images = vehicle.images
        .map(imgObj => imgObj && imgObj.image)
        .filter(Boolean);
    }
    if (!images.length) {
      images = [
        "assets/img/New folder/1.jpg",
        "assets/img/New folder/3.jpg",
        "assets/img/New folder/3.jpg"
      ];
    }

    return {
      images,
      title: vehicle.registration_number || vehicle.name || "Untitled",
      id: vehicle.id || null,
      location: vehicle.location || "Unknown Location",
      price: vehicle.price ? `₹${vehicle.price} / Night` : "Price Unavailable",
      facilitiesIcons: vehicle.facilitiesIcons || [],
      moreCount: vehicle.moreCount || 0,
      vehicle:vehicle || null
    };
  });

  const places = dynamicData;

  let cardsWithBanners = [];
  if (places && Array.isArray(places) && places.length > 0) {
    for (let i = 0; i < places.length; i++) {
      cardsWithBanners.push(
        <VehicleCard key={places[i].title + i} {...places[i]} />
      );
      if ((i + 1) % 6 === 0) {
        cardsWithBanners.push(<Banner key={`banner-${i}`} />);
      }
    }
  }

  return (
    <section className="section place-section bg-white">
      <div className="container">
        <div className="row justify-content-center">
          <div
            className="col-xl-6 col-lg-10 text-center wow fadeInUp"
            data-wow-delay="0.2s"
          >
            <div className="section-header mb-4 text-center">
              <h2 className="mb-2">
                Our{" "}
                <span className="text-primary text-decoration-underline">
                  Trending
                </span>{" "}
                Places
              </h2>
              <p className="sub-title">
                Here are some famous tourist places around the world that are
                known for their historical significance, natural beauty, or
                cultural impact.
              </p>
            </div>
          </div>
        </div>

        {/* Loading & Error States */}
        {loading && <p className="text-center">Loading vehicles...</p>}
        {error && <p className="text-center text-danger">Error: {error}</p>}

        <div className="row justify-content-between">
          {cardsWithBanners}
        </div>

        <div className="text-center view-all wow fadeInUp">
          <a
            href="/hotel-grid"
            className="btn btn-dark d-inline-flex align-items-center"
          >
            View All Places{" "}
            <i className="isax isax-arrow-right-3 ms-2" aria-hidden="true"></i>
          </a>
        </div>
      </div>
    </section>
  );
}
