import React from "react";
import Navbar from "../../components/Navbar";
import Hero from "../../components/Hero";
import { VehicleGrid } from "../../components/VehicleGrid/VehicleGrid";
import { Footer } from "../../components/Footer";
import DestinationSlider from "../../components/Destinations/DestinationSlider";


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
