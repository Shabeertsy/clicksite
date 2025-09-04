import React from "react";

export default function Banner({ image, link, alt }) {
  return (
    <div className="">
      <a href={link || "https://qspurtsolutions.com/"} target="_blank" rel="noopener noreferrer">
        <img
          src={image || "assets/img/banner/banner-01.jpg"}
          className="img-fluid custom-ads"
          alt={alt || ""}
        />
      </a>
    </div>
  );
}
