import Navbar from "./components/Navbar";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Studio from "./pages/Studio";
import { useEffect } from "react";
import { ROUTES } from "./common/common";

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
            <Route path={ROUTES.home} element={<Home />} />
            <Route path={ROUTES.studio} element={<Studio />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
