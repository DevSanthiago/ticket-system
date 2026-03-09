import { Routes, Route } from "react-router-dom";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { SetupForm } from "./pages/SetupForm";
import { AutomationForm } from "./pages/AutomationForm";
import { TestForm } from "./pages/TestForm";
import { SoftwareForm } from "./pages/SoftwareForm";
import { SetupTicketsList } from "./pages/SetupTicketsList";
import { AutomationTicketsList } from "./pages/AutomationTicketsList";
import { TestTicketsList } from "./pages/TestTicketsList";
import { SoftwareTicketsList } from "./pages/SoftwareTicketsList";

import { ChecklistPage } from "./pages/ChecklistPage";
import { PrivateRoute } from "./components/PrivateRoute";
import { Layout } from "./components/Layout";
import { ForgotPassword } from "./pages/ForgotPassword";
import { RequestAccess } from "./pages/RequestAccess";
import { CockpitAdminDashboard } from "./pages/CockpitAdminDashboard";
import { ProductionLinesPage } from "./pages/ProductionLinesPage";
import { PrefixesPage } from "./pages/PrefixesPage";

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/request-access" element={<RequestAccess />} />

            <Route element={<PrivateRoute />}>
                <Route element={<Layout />}>
                    <Route path="/" element={<Dashboard />} />

                    <Route path="opentickets">
                        <Route path="setup" element={<SetupForm />} />
                        <Route path="automation" element={<AutomationForm />} />
                        <Route path="test" element={<TestForm />} />
                        <Route path="software" element={<SoftwareForm />} />
                    </Route>

                    <Route path="tickets">
                        <Route path="setup-list" element={<SetupTicketsList />} />
                        <Route path="automation-list" element={<AutomationTicketsList />} />
                        <Route path="test-list" element={<TestTicketsList />} />
                        <Route path="software-list" element={<SoftwareTicketsList />} />
                    </Route>

                    <Route path="/checklists" element={<ChecklistPage />} />

                    <Route path="cockpit-admin">
                        <Route index element={<CockpitAdminDashboard />} />
                        <Route path="production-lines" element={<ProductionLinesPage />} />
                        <Route path="prefixes" element={<PrefixesPage />} />
                    </Route>
                </Route>
            </Route>
        </Routes>
    );
}

export default App;