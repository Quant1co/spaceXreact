import { createRoot } from "react-dom/client";
import { LaunchDashboard } from "./components/app";

function mountLaunchDashboard() {
    const dashboardRoot = createRoot(document.getElementById("root"));
    dashboardRoot.render(<LaunchDashboard />);
}

document.addEventListener("DOMContentLoaded", mountLaunchDashboard);