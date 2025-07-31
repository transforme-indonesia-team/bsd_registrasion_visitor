import { Routes, Route } from "react-router-dom";
import GuestRegistrationForm from "./Pages/Guest/GuestRegistrationForm";
import HomePage from "./Pages/HomePage/HomePage";
import { SonnerToaster } from "./components/ui/sonner";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/guest-form" element={<GuestRegistrationForm />} />
      </Routes>
      <SonnerToaster richColors position="top-right" />
    </>
  );
}

export default App;
