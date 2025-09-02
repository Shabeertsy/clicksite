// src/components/DestinationSlider.jsx
import React, { useEffect, useRef } from "react";
import DestinationHeader from "./DestinationHeader";
import DestinationItem from "./DestinationItem";

const DESTINATIONS = [
  {
    img: "img/destination/destination-01.jpg",
    title: "Goa bachelor Trip",
    flights: "3 Night",
    hotels: null,
    cruises: "1500/per Head",
  },
  {
    img: "img/destination/destination-02.jpg",
    title: "Sabarimala",
    flights: "3 Night",
    hotels: null,
    cruises: "1500/Per Hed",
  },
  {
    img: "img/destination/destination-03.jpg",
    title: "Australia",
    flights: "3 Days",
    hotels: null,
    cruises: "2500/per Head",
  },
  {
    img: "img/destination/destination-04.jpg",
    title: "Brazil",
    flights: "21 Flights",
    hotels: "15 Hotels",
    cruises: "06 Cruises",
  },
  {
    img: "img/destination/destination-05.jpg",
    title: "Canada",
    flights: "21 Flights",
    hotels: "15 Hotels",
    cruises: "06 Cruises",
  },
  {
    img: "img/destination/destination-05.jpg",
    title: "test",
    flights: "21 Flights",
    hotels: "15 Hotels",
    cruises: "06 Cruises",
  },
];

export default function DestinationSlider() {
  const sliderRef = useRef(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.$ &&
      typeof window.$.fn.owlCarousel === "function"
    ) {
      const $slider = window.$(sliderRef.current);
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
            "<i class='fa-solid fa-chevron-left'></i>",
            "<i class='fa-solid fa-chevron-right'></i>",
          ],
          responsive: {
            0: { items: 1 },
            576: { items: 2 },
            992: { items: 3 },
            1200: { items: 4 },
          },
        });
      }
      return () => {
        if ($slider && $slider.data("owl.carousel")) {
          $slider.trigger("destroy.owl.carousel");
          $slider.find(".owl-stage-outer").children().unwrap();
          $slider.removeClass("owl-center owl-loaded owl-text-select-on");
        }
      };
    }
  }, []);

  return (
    <section className="section destination-section">
      <div className="container">
        <DestinationHeader />

        <div
          className="owl-carousel destination-slider nav-center"
          ref={sliderRef}
        >
          {DESTINATIONS.map((dest, idx) => (
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
