import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import RequestManagement from "./pages/RequestManagement";
import ProjectDetails from "./pages/ProjectDetails";
import RespondentDetails from "./pages/RespondentDetails";
import Analytics from "./pages/Analytics";
import Activity from "./pages/Activity";
import Archive from "./pages/Archive";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/requests" element={<RequestManagement />} />
        <Route path="/projects/:projectId" element={<ProjectDetails />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
