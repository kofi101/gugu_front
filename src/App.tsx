import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { appRoutes } from "./routes/Router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MainLayout from "./views/main/MainLayout";

function App() {

  return (
    <div className="text-black-primary-400 app">
      
      <Router>
        <ToastContainer />
        <MainLayout>
          <Routes>
            {appRoutes.map(({ path, element }, key) => (
              <Route key={key} path={path} element={element} />
            ))}
          </Routes>
        </MainLayout>
      </Router>
    </div>
  );
}

export default App;
