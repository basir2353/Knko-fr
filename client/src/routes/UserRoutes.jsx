import Appointment from "../pages/dashboard/appointment/page";
import Dashboard from "../pages/dashboard/page";
import Services from "../pages/dashboard/services/page";
import ServiceDetail from "../pages/dashboard/services/[id]/page";
import Wellness from "../pages/dashboard/wellness/page";
import Membership from "../pages/dashboard/membership/page";
import SessionSummary from "../pages/dashboard/session-summary/page";
import Resources from "../pages/dashboard/resources/page";
import DashboardLayout from "../components/layout/DashboardLayout";
import { Route } from "react-router-dom";

const userRoutes = () => {
  return (
    <>
      {/* Dashboard Layout with Header & Footer */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        {/* Nested Dashboard Routes */}
        <Route index element={<Dashboard />} />
        <Route path="appointment" element={<Appointment />} />
        <Route path="services" element={<Services />} />
        <Route path="services/:id" element={<ServiceDetail />} />
        <Route path="wellness" element={<Wellness />} />
        <Route path="membership" element={<Membership />} />
        <Route path="session-summary" element={<SessionSummary />} />
        <Route path="resources" element={<Resources />} />
      </Route>
    </>
  );
};

export default userRoutes;
