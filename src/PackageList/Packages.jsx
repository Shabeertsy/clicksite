import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../Constants";

// Helper to normalize a package object
function normalizePackage(pkg) {
  return {
    id: pkg.id,
    title: pkg.title || pkg.name || "Untitled Package",
    description: pkg.description || "",
    image: pkg.image || pkg.img || "img/destination/destination-05.jpg",
    price: pkg.price || "Contact for price",
    duration: pkg.duration || "",
    location: pkg.location || "",
    head: pkg.head || pkg.header || "",
    // Add more fields as needed
  };
}

// Helper to normalize a header object
function normalizeHeader(header) {
  console.log(header,'asdfadfafafafffaddfads');
  
  return {
    id: header.id,
    title: header.title || header.head || "Untitled Header",
  };
}

export default function PackageListPage() {
  const [packages, setPackages] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [headerLoading, setHeaderLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedHeader, setSelectedHeader] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Fetch headers for filter
  useEffect(() => {
    async function fetchHeaders() {
      setHeaderLoading(true);
      try {
        const res = await axios.get(`${baseUrl}list-package-head/`);
        let data = res.data;
        if (data && !Array.isArray(data)) {
          data = [data];
        }
        setHeaders(Array.isArray(data) ? data.map(normalizeHeader) : []);
      } catch (err) {
        setHeaders([]);
      } finally {
        setHeaderLoading(false);
      }
    }
    fetchHeaders();
  }, []);

  // Fetch packages, optionally filtered by header id
  useEffect(() => {
    async function fetchPackages() {
      setLoading(true);
      setError("");
      try {
        let url = `${baseUrl}list-packages/`;
        const headerId = searchParams.get("header");
        if (headerId) {
          url += `?head=${encodeURIComponent(headerId)}`;
          setSelectedHeader(headerId);
        } else {
          setSelectedHeader("");
        }
        const res = await axios.get(url);
        let data = res.data;
        if (data && !Array.isArray(data)) {
          data = [data];
        }
        setPackages(Array.isArray(data) ? data.map(normalizePackage) : []);
      } catch (err) {
        setError("Failed to load packages.");
        setPackages([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPackages();
    // eslint-disable-next-line
  }, [searchParams]);

  // Handle filter change
  const handleHeaderChange = (e) => {
    const value = e.target.value;
    if (value) {
      setSearchParams({ header: value });
    } else {
      setSearchParams({});
    }
  };

  return (
    <section className="section package-list-section py-5">
      <div className="container">
        <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
          <h2 className="mb-0">Packages</h2>
          <div>
            <label htmlFor="headerFilter" className="me-2 fw-bold">
              Filter by Header:
            </label>
            <select
              id="headerFilter"
              className="form-select d-inline-block w-auto"
              value={selectedHeader}
              onChange={handleHeaderChange}
              disabled={headerLoading}
            >
              <option value="">All</option>
              {headers.map((header) => (
                <option key={header.id} value={header.id}>
                  {header.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <span className="spinner-border" role="status" aria-hidden="true"></span>
            <span className="ms-2">Loading packages...</span>
          </div>
        ) : error ? (
          <div className="text-center text-danger py-5">
            <p>{error}</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-5">
            <p>No packages found.</p>
          </div>
        ) : (
          <div className="row">
            {packages.map((pkg) => (
              <div className="col-md-4 mb-4" key={pkg.id}>
                <div className="card h-100 shadow-sm">
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="card-img-top"
                    style={{ height: 220, objectFit: "cover" }}
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{pkg.title}</h5>
                    <p className="card-text text-muted mb-1">
                      {pkg.location && (
                        <span>
                          <i className="isax isax-location"></i> {pkg.location}
                        </span>
                      )}
                      {pkg.duration && (
                        <span className="ms-3">
                          <i className="isax isax-timer"></i> {pkg.duration}
                        </span>
                      )}
                    </p>
                    <p className="card-text mb-2" style={{ minHeight: 48 }}>
                      {pkg.description.length > 70
                        ? pkg.description.slice(0, 70) + "..."
                        : pkg.description}
                    </p>
                    <div className="mt-auto d-flex justify-content-between align-items-center">
                      <span className="fw-bold text-primary">
                        {typeof pkg.price === "number"
                          ? `₹${pkg.price}`
                          : pkg.price}
                      </span>
                      <Link
                        to={`/packages/${pkg.id}`}
                        className="btn btn-dark btn-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
