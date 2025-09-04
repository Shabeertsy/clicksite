import React from "react";
import Navbar from "../../components/Navbar";
import Hero from "../../components/Hero";
import { Footer } from "../../components/Footer";
import DestinationSlider from "../../components/Destinations/DestinationSlider";
import VehicleGrid from "../../components/VehicleGrid/VehicleGrid";


export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <DestinationSlider />
      <VehicleGrid />
      <Footer />
    </div>
  );
}
