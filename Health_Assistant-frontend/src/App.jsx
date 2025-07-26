import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./AppRoute"; // Component defined below

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;