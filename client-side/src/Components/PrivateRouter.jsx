import { useContext } from "react";
import { Navigate } from "react-router";
import { AdminContext } from "../context/AdminContext";

const PrivateRoute = ({ children }) => {

  const { isAdmin } = useContext(AdminContext);

  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default PrivateRoute;