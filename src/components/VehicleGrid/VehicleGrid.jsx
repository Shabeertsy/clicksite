import Banner from "../Banner";
import VehicleCard from "./VehicleCard";
import { useEffect, useState, useRef, useCallback } from "react";
import { baseUrl } from "../../Constants";
import { useBookingStore } from "../../store/bookingStore";
import axios from "axios"; // <-- Make sure axios is imported

const PAGE_SIZE = 6;

export default function VehicleGrid() {
  const [vehicles, setVehicles] = useState([]);
  const [popularVehicles, setPopularVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [geoCoords, setGeoCoords] = useState(null);

  const pickupCoords = useBookingStore((state) => state.pickupCoords);

  const fetchingRef = useRef(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setVehicles([]);
    setPopularVehicles([]);
    setPage(1);
    setHasMore(true);
    setInitialLoad(true);
  }, [pickupCoords?.lat, pickupCoords?.lng]);


  useEffect(() => {
    if (
      (!pickupCoords?.lat || !pickupCoords?.lng) &&
      initialLoad &&
      typeof window !== "undefined" &&
      "geolocation" in navigator
    ) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeoCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          setGeoCoords(null);
        }
      );
    }
  }, [pickupCoords?.lat, pickupCoords?.lng, initialLoad]);


  const fetchVehicles = useCallback(
    async (coords, pageToFetch = 1) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        let url = `${baseUrl}list-owner-vehicles/`;
        const params = new URLSearchParams();
        if (coords?.lat && coords?.lng) {
          params.append("lat", coords.lat);
          params.append("lng", coords.lng);
        }
        params.append("page", pageToFetch);
        params.append("page_size", PAGE_SIZE);
        url += `?${params.toString()}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch vehicles");
        const data = await res.json();

        setVehicles((prev) =>
          pageToFetch === 1 ? data.vehicles || [] : [...prev, ...(data.vehicles || [])]
        );

        if (pageToFetch === 1 && data.popular_vehicles) {
          setPopularVehicles(data.popular_vehicles || []);
        }

        setHasMore(data.has_more);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        fetchingRef.current = false;
        setInitialLoad(false);
      }
    },
    []
  );

  useEffect(() => {
    if (pickupCoords?.lat && pickupCoords?.lng) {
      fetchVehicles(pickupCoords, 1);
    }
    else if (geoCoords?.lat && geoCoords?.lng) {
      fetchVehicles(geoCoords, 1);
    }
    else if (!pickupCoords?.lat && !pickupCoords?.lng && !geoCoords) {
      fetchVehicles({}, 1);
    }
  }, [pickupCoords?.lat, pickupCoords?.lng, geoCoords, fetchVehicles]);

  
  // Infinite scroll
  const handleScroll = () => {
    if (
      !loading &&
      hasMore &&
      containerRef.current &&
      window.innerHeight + window.scrollY >=
        containerRef.current.offsetTop + containerRef.current.offsetHeight - 300
    ) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  useEffect(() => {
    if (page > 1) {
      // Use pickupCoords if available, else geoCoords, else fallback
      if (pickupCoords?.lat && pickupCoords?.lng) {
        fetchVehicles(pickupCoords, page);
      } else if (geoCoords?.lat && geoCoords?.lng) {
        fetchVehicles(geoCoords, page);
      } else {
        fetchVehicles({}, page);
      }
    }
    // eslint-disable-next-line
  }, [page, fetchVehicles, pickupCoords, geoCoords]);

  const mapVehicles = (list) =>
    list.map((vehicle) => {
      let images = [];
      if (Array.isArray(vehicle.images) && vehicle.images.length > 0) {
        images = vehicle.images.map((imgObj) => imgObj?.image).filter(Boolean);
      }
      if (!images.length) {
        images = [
          "assets/img/New folder/1.jpg",
          "assets/img/New folder/3.jpg",
          "assets/img/New folder/3.jpg",
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
        vehicle: vehicle || null,
      };
    });




  const [banners, setBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await axios.get(`${baseUrl}list-banner-images/`);
        let data = res.data;
        if (data && !Array.isArray(data)) {
          data = [data];
        }
        setBanners(Array.isArray(data) ? data : []);
      } catch (err) {
        setBanners([]);
      } finally {
        setBannersLoading(false);
      }
    }
    fetchBanners();
  }, []);

  const cardsWithBanners = [];
  const places = mapVehicles(vehicles);

  const interval = 6;
  let bannerIndex = 0;
  for (let i = 0; i < places.length; i++) {
    cardsWithBanners.push(<VehicleCard key={places[i].title + i} {...places[i]} />);
    if ((i + 1) % interval === 0 && banners.length > 0) {
      const bannerObj = banners[bannerIndex % banners.length];
      cardsWithBanners.push(
        <Banner
          key={`banner-${i}`}
          image={bannerObj.image}
          link={bannerObj.link}
          alt={bannerObj.alt || ""}
        />
      );
      bannerIndex++;
    }
  }

  return (
    <section className="section place-section bg-white" ref={containerRef}>
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
        {initialLoad && loading && <p className="text-center">Loading vehicles...</p>}
        {error && <p className="text-center text-danger">Error: {error}</p>}

        {/* Popular vehicles - only first page */}
        {popularVehicles.length > 0 && (
          <>
            <h3 className="text-center mb-3">Popular Vehicles</h3>
            <div className="row justify-content-between mb-5">
              {mapVehicles(popularVehicles).map((place, i) => (
                <VehicleCard key={`popular-${place.id}-${i}`} {...place} />
              ))}
            </div>
          </>
        )}

        {/* Normal vehicles */}
        <div className="row justify-content-between">{cardsWithBanners}</div>

        {/* Lazy loading spinner */}
        {!initialLoad && loading && (
          <div className="text-center my-3">
            <span className="spinner-border" role="status" aria-hidden="true"></span>
            <span className="ms-2"></span>
          </div>
        )}

        {!hasMore && !loading && vehicles.length > 0 && (
          <div className="text-center my-3 text-muted">
            <small>No more vehicles to load.</small>
          </div>
        )}

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