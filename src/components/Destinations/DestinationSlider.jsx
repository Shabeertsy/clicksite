// src/components/DestinationSlider.jsx
import React, { useEffect, useState } from "react";
import DestinationHeader from "./DestinationHeader";
import DestinationItem from "./DestinationItem";
import axios from "axios";
import { baseUrl } from "../../Constants";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";


function normalizeDestination(item) {
  return {
    img: item.img || item.image || 'img/destination/destination-05.jpg',
    title: item.title || item.head_text || item.head.head || item.name || 'test',
    flights: item.flights || null,
    hotels: item.hotels || null,
    cruises: item.cruises || null,
  };
}

function SwiperNavButton({ direction, className }) {
  return (
    <button
      className={`swiper-nav-btn ${className}`}
      tabIndex={0}
      aria-label={direction === "prev" ? "Previous" : "Next"}
      style={{
        background: "#fff",
        border: "none",
        boxShadow: "0 4px 16px rgba(0,0,0,0.18), 0 1.5px 4px rgba(0,0,0,0.22)",
        position: "absolute",
        top: "50%",
        [direction === "prev" ? "left" : "right"]: "-40px",
        zIndex: 9999,  
        transform: "translateY(-50%)",
        fontSize: "2rem",
        color: "#222",
        borderRadius: "50%",
        width: "48px",
        height: "48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer"
      }}
    >
      {direction === "prev" ? (
        <i className="isax isax-arrow-left-2"></i>
      ) : (
        <i className="isax isax-arrow-right-3"></i>
      )}
    </button>
  );
}

export default function DestinationSlider() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchDestinations() {
      try {
        const res = await axios.get(`${baseUrl}list-packages/`);
        let data = res.data;
        console.log('datassss', data);

        let packages = [];
        if (data && Array.isArray(data.packages)) {
          packages = data.packages;
        } else if (data && data.packages) {
          // fallback if packages is not an array but exists
          packages = [data.packages];
        }

        const mapped = (Array.isArray(packages) && packages.length > 0
          ? packages
          : []
        )
          .filter(Boolean)
          .map(normalizeDestination);

        if (isMounted) {
          setDestinations(mapped);
          setLoading(false);
        }
      } catch (err) {
        console.log(err, 'error');
        if (isMounted) {
          setDestinations([{
            img: 'img/destination/destination-05.jpg',
            title: 'test',
            flights: null,
            hotels: null,
            cruises: null
          }]);
          setLoading(false);
        }
      }
    }
    fetchDestinations();
    return () => { isMounted = false; };
  }, []);

  return (
    <section className="section destination-section">
      <div className="container">
        <DestinationHeader />

        <div className="destination-slider nav-center" style={{ position: "relative" }}>
          {!loading && destinations && (
            <Swiper
              modules={[Navigation]}
              navigation={{
                prevEl: ".swiper-button-prev-custom",
                nextEl: ".swiper-button-next-custom"
              }}
              loop={true}
              speed={2000}
              slidesPerView={4}
              spaceBetween={24}
              rtl={true}
              breakpoints={{
                0: { slidesPerView: 1 },
                576: { slidesPerView: 2 },
                992: { slidesPerView: 3 },
                1200: { slidesPerView: 4 }
              }}
              style={{ padding: "0 20px" }}
            >
              {destinations.map((dest, idx) => (
                <SwiperSlide key={dest.title + idx}>
                  <DestinationItem dest={dest} />
                </SwiperSlide>
              ))}
              {/* Custom navigation buttons */}
              <div className="swiper-button-prev-custom">
                <SwiperNavButton direction="prev" className="swiper-button-prev" />
              </div>
              <div className="swiper-button-next-custom">
                <SwiperNavButton direction="next" className="swiper-button-next" />
              </div>
            </Swiper>
          )}
        </div>

        <div className="text-center view-all wow fadeInUp">
          <a
            href="destination.html"
            className="btn btn-dark d-inline-flex align-items-center"
          >
            View All Locations
            <i className="isax isax-arrow-right-3 ms-2"></i>
          </a>
        </div>
      </div>
    </section>
  );
}