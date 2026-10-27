import { StrictMode } from "react";

// Scroll-reveal: observe .reveal and .reveal-stagger elements
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        revealObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.05, rootMargin: "50px 0px 50px 0px" }
);

const observeReveal = () => {
  document.querySelectorAll(".reveal, .reveal-stagger").forEach((el) => {
    revealObserver.observe(el);
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", observeReveal);
} else {
  observeReveal();
}

// Re-observe when DOM subtree changes (e.g., client navigation)
new MutationObserver(observeReveal).observe(document.body, { childList: true, subtree: true });
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router/dom";

import "./index.css";

import Root from "./Components/Root";
import Home from "./Components/Home";
import About from "./Components/About";
import Information from "./Components/Information";
import DonarForm from "./Components/DonarForm";
import Admin from "./Components/Admin";
import AvailableDonar from "./Components/AvailableDonar";
import SearchDonar from "./Components/SearchDonar";
import DonorPortal from "./Components/DonorPortal";
import EmergencyRequests from "./Components/EmergencyRequests";
import AdminControl from "./Components/AdminControl";
import PrivateRoute from "./Components/PrivateRouter";

import { AdminProvider } from "./context/AdminContext";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "/about",
        Component: About,
      },
      {
        path: "/information",
        Component: Information,
      },
      {
        path: "/donarForm",
        Component: DonarForm,
      },
      {
        path: "/available",
        element: <Navigate to="/searchDonar" replace />,
      },
      {
        path: "/searchDonar",
        Component: SearchDonar,
      },
      {
        path: "/donorPortal",
        Component: DonorPortal,
      },
      {
        path: "/emergency",
        Component: EmergencyRequests,
      },
      {
        path: "/admin",
        Component: Admin,
      },
      {
        path: "/adminControl",
        element: (
          <PrivateRoute>
            <AdminControl />
          </PrivateRoute>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AdminProvider>
      <RouterProvider router={router} />
    </AdminProvider>
  </StrictMode>
);
