// src/components/DestinationSlider.jsx
import React, { useEffect, useRef, useState } from "react";
import DestinationHeader from "./DestinationHeader";
import DestinationItem from "./DestinationItem";
import axios from "axios";
import { baseUrl } from "../../Constants";



function normalizeDestination(item) {
  return {
    img: item.img || item.image || 'img/destination/destination-05.jpg',
    title: item.title || item.head || 'test',
    flights: item.flights || null,
    hotels: item.hotels ||null,
    cruises: item.cruises || null
  };
}

export default function DestinationSlider() {
  const sliderRef = useRef(null);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchDestinations() {
      try {
        const res = await axios.get(`${baseUrl}list-package-head/`);
        let data = res.data;
        if (data && !Array.isArray(data)) {
          data = [data];
        }
        const mapped = (Array.isArray(data) && data.length > 0
          ? data
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
            cruises:null
          }]);
          setLoading(false);
        }
      }
    }
    fetchDestinations();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.$ &&
      typeof window.$.fn.owlCarousel === "function" &&
      destinations.length > 0 &&
      !loading
    ) {
      const $slider = window.$(sliderRef.current);
      if ($slider.data("owl.carousel")) {
        $slider.trigger("destroy.owl.carousel");
        $slider.find(".owl-stage-outer").children().unwrap();
        $slider.removeClass("owl-center owl-loaded owl-text-select-on");
      }
      setTimeout(() => {
        if ($slider.length > 0) {
          $slider.owlCarousel({
            loop: true,
            margin: 24,
            nav: true,
            dots: false,
            autoplay: false,
            smartSpeed: 2000,
            rtl: true,
            navText: [
              "<i class='isax isax-arrow-left-2'></i>",
              "<i class='isax isax-arrow-right-3'></i>",
            ],
            responsive: {
              0: { items: 1 },
              576: { items: 2 },
              992: { items: 3 },
              1200: { items: 4 },
            },
          });
        }
      }, 0);
      return () => {
        if ($slider && $slider.data("owl.carousel")) {
          $slider.trigger("destroy.owl.carousel");
          $slider.find(".owl-stage-outer").children().unwrap();
          $slider.removeClass("owl-center owl-loaded owl-text-select-on");
        }
      };
    }
  }, [destinations, loading]);

  return (
    <section className="section destination-section">
      <div className="container">
        <DestinationHeader />

        <div
          className="owl-carousel destination-slider nav-center"
          ref={sliderRef}
        >
          {!loading && destinations && destinations.map((dest, idx) => (
            <DestinationItem key={dest.title + idx} dest={dest} />
          ))}
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