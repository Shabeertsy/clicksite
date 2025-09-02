import React from "react";

export function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-top">
          <div className="row row-cols-lg-5 row-cols-md-3 row-cols-sm-2 row-cols-1">
            <div className="col col-xl-4">
              <div className="footer-widget">
                <h5>About us</h5>
                <img srcSet="assets/img/logo.png" className="img-fluid" alt="" />
                <p>
                  Click 4 Trip is India’s No.1 private travel booking website for all types of bus and traveler packages. We offer
                  affordable, secure, and hassle-free bookings with a wide range of options for family holidays, group tours, and
                  business trips. With trusted operators and 24/7 support, we make every journey safe, comfortable, and memorable.
                </p>
              </div>
              <div className="d-flex align-items-center">
                <ul className="social-icon">
                  {["fa-facebook", "fa-x-twitter", "fa-instagram", "fa-linkedin", "fa-pinterest"].map((icon, idx) => (
                    <li key={idx}>
                      <a href="javascript:void(0);">
                        <i className={`fa-brands ${icon}`}></i>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col">
              <div className="footer-widget">
                <h5>Location</h5>
                <ul className="footer-menu">
                  {["Kerala", "Tamil Nadu", "Karnataka", "Mumbai", "Hyderabad", "Delhi NCR", "Bengaluru"].map((loc, idx) => (
                    <li key={idx}>
                      <a href="javascript:void(0);">{loc}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col">
              <div className="footer-widget">
                <h5>Packages</h5>
                <ul className="footer-menu">
                  {["Goa", "Kerala Backwaters", "Varanasi", "Mysore & Coorg"].map((pkg, idx) => (
                    <li key={idx}>
                      <a href="javascript:void(0);">{pkg}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Additional footer widget columns can be added here */}
          </div>

          <div className="footer-img">
            <img src="assets/img/bg/footer.svg" className="img-fluid" alt="img" />
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                  <p className="fs-14">
                    Copyright &copy; 2025. All Rights Reserved,{" "}
                    <a href="javascript:void(0);" className="text-primary fw-medium">
                      DreamsTour
                    </a>
                  </p>
                  <div className="d-flex align-items-center">
                    <ul className="social-icon">
                      {["fa-facebook", "fa-x-twitter", "fa-instagram", "fa-linkedin", "fa-pinterest"].map((icon, idx) => (
                        <li key={idx}>
                          <a href="javascript:void(0);">
                            <i className={`fa-brands ${icon}`}></i>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <ul className="card-links">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <li key={idx}>
                        <a href="javascript:void(0);">
                          <img src={`assets/img/icons/card-0${idx + 1}.svg`} alt="img" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
