import React from 'react';


export default function Navbar() {
  return (
    <div className="main-header">

      {/* <!-- Header --> */}
      <header>
        <div className="container">
          {/* <!-- Mobile menu--> */}
          
          <div className="offcanvas-info">
            <div className="offcanvas-wrap">
              <div className="offcanvas-detail">
                <div className="offcanvas-head">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <a href="index-2.html" className="black-logo-responsive">
                      <img src="assets/img/logo.png" alt="logo-img" />
                    </a>
                    <a href="index-2.html" className="white-logo-responsive">
                      <img src="assets/img/logo.png" alt="logo-img" />
                    </a>
                    <div className="offcanvas-close">
                      <i className="ti ti-x"></i>
                    </div>
                  </div>
                  <div className="wishlist-info d-flex justify-content-between align-items-center">
                    <h6 className="fs-16 fw-medium">Wishlist</h6>
                    <div className="d-flex align-items-center">
                      <div className="fav-dropdown">
                        <a href="wishlist.html" className="position-relative">
                          <i className="isax isax-heart"></i>
                          <span className="count-icon bg-secondary text-gray-9">0</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mobile-menu fix mb-3"></div>
                <div className="offcanvas__contact">
                  <div className="mt-4">
                    <div className="header-dropdown d-flex flex-fill">
                      <div className="w-100">
                        <div className="dropdown flag-dropdown mb-2">
                          <a
                            href="javascript:void(0);"
                            className="dropdown-toggle bg-white border d-flex align-items-center"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            <img src="assets/img/flags/us-flag.svg" className="me-2" alt="flag" />
                            ENG
                          </a>
                          <ul className="dropdown-menu p-2">
                            <li>
                              <a className="dropdown-item rounded d-flex align-items-center" href="javascript:void(0);">
                                <img src="assets/img/flags/us-flag.svg" className="me-2" alt="flag" />
                                ENG
                              </a>
                            </li>
                            <li>
                              <a className="dropdown-item rounded d-flex align-items-center" href="javascript:void(0);">
                                <img src="assets/img/flags/arab-flag.svg" className="me-2" alt="flag" />
                                ARA
                              </a>
                            </li>
                            <li>
                              <a className="dropdown-item rounded d-flex align-items-center" href="javascript:void(0);">
                                <img src="assets/img/flags/france-flag.svg" className="me-2" alt="flag" />
                                FRE
                              </a>
                            </li>
                          </ul>
                        </div>
                        <div className="dropdown">
                          <a
                            href="javascript:void(0);"
                            className="dropdown-toggle bg-white border d-block"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            USD
                          </a>
                          <ul className="dropdown-menu p-2">
                            <li>
                              <a className="dropdown-item rounded" href="javascript:void(0);">
                                USD
                              </a>
                            </li>
                            <li>
                              <a className="dropdown-item rounded" href="javascript:void(0);">
                                YEN
                              </a>
                            </li>
                            <li>
                              <a className="dropdown-item rounded" href="javascript:void(0);">
                                EURO
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div>
                      <a
                        href="javascript:void(0);"
                        className="text-white btn btn-dark w-100 mb-3"
                        data-bs-toggle="modal"
                        data-bs-target="#login-modal"
                      >
                        Sign In
                      </a>
                    </div>
                 
                  </div>
                </div>
              </div>
            </div>
          </div>
         
          {/* <!-- Mobile menu--> */}

          <div className="offcanvas-overlay"></div>
          <div className="header-nav">
            <div className="main-menu-wrapper">
              <div className="navbar-logo">
                <a className="logo-white header-logo" href="index-2.html">
                  <img src="assets/img/logo.png" className="logo" alt="Logo" />
                </a>
                <a className="logo-dark header-logo" href="index-2.html">
                  <img src="assets/img/logo.png" className="logo" alt="Logo" />
                </a>
              </div>
              <nav id="mobile-menu">
                <ul className="main-nav">
                  <li className="active">
                    <a href="javascript:void(0);">
                      Home<i className="fa-solid "></i>
                    </a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">
                      Packages<i className="fa-solid "></i>
                    </a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">
                      Contact Us<i className="fa-solid "></i>
                    </a>
                  </li>
                </ul>
              </nav>
              <div className="header-btn d-flex align-items-center">
                <div>
                  <a
                    href="javascript:void(0);"
                    className="btn btn-white me-3"
                    data-bs-toggle="modal"
                    data-bs-target="#login-modal"
                  >
                    Sign In
                  </a>
                </div>
                <div className="header__hamburger d-xl-none my-auto">
                  <div className="sidebar-menu">
                    <i className="isax isax-menu5"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* <!-- /Header --> */}
    </div>
  );
}
