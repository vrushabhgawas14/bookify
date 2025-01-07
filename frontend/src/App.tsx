import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import NotFoundPage from "./components/NotFoundPage";
import Summaries from "./pages/Summaries";
import Audio from "./pages/Audio";
import Library from "./pages/Library";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/summaries" element={<Summaries />} />
          <Route path="/audio" element={<Audio />} />
          <Route path="/library" element={<Library />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
