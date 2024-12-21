import { useEffect } from "react";

import { BrowserRouter as Router } from "react-router-dom";

import "./App.css";

import Navbar from "./components/NavBar";
import { SecondNav } from "./components/SecondNav";

function App() {
  // useEffect(() => {
  //   const unsub = window.electron.subscribeStatistics((stats) =>
  //     console.log("===>", stats)
  //   );
  //   return unsub;
  // }, []);
  return (
    <Router>
      <Navbar />
      <SecondNav />
    </Router>
  );
}

export default App;
