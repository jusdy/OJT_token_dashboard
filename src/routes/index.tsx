import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import AppLayout from "components/Layout";

const Dashboard = lazy(() => import("pages/dashboard"));

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />}></Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
