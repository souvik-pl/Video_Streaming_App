import Navbar from "./components/common/Navbar";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Studio from "./pages/Studio";
import { useEffect } from "react";
import { FE_ROUTES } from "./common/common";
import { Toaster } from "./components/ui/toaster";

function App() {
  useEffect(() => {
    document.body.classList.add("dark");
  }, []);

  return (
    <BrowserRouter>
      <div className="w-full h-lvh bg-[#171312] flex flex-col px-64">
        <div className="w-full h-16">
          <Navbar />
        </div>
        <div className="w-full flex-1 py-6">
          <Routes>
            <Route path={FE_ROUTES.home} element={<Home />} />
            <Route path={FE_ROUTES.studio} element={<Studio />} />
          </Routes>
        </div>
      </div>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
