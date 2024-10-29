import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Contact from "./pages/Contact";
import Search from "./pages/Search";
import Datastore from "./pages/Datastore";
import Chatbot from "./pages/Chatbot";

function App() {
  const [engine, setEngine] = useState("");
  const [engines, setEngines] = useState([])

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <Layout 
              engine={engine} 
              setEngine={setEngine} 
              engines={engines}
              /> }>
            <Route index element={
              <Search 
                engine={engine} 
                setEngine={setEngine}
                setEngines={setEngines}
                />} />
            <Route path="datastore" element={<Datastore
                                              engine={engine} 
                                              setEngine={setEngine}
                                              setEngines={setEngines} 
                                              />} />
            <Route path="chatbot" element={<Chatbot 
                                              engine={engine} 
                                              setEngine={setEngine}
                                              setEngines={setEngines} 
                                              initialQuery={""} 
                                              />} />
            <Route path="contact" element={<Contact />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
