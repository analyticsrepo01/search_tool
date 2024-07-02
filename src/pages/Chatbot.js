import React, { useEffect } from "react";
import Chat from "../chat/Chat"; // Import the Chat component
import config from "../config";

const Chatbot = ({ engine, setEngine, setEngines, initialQuery }) => {

  // Load engines
  useEffect(() => {
    const listEngines = async () => {
      try {
        const response = await fetch(`${config.LOCALHOST}/listEngines`, {
          method: "GET",
        });
        const data = await response.json();
        setEngines(data);
        if (engine === "") {
          setEngine(data[0]);
        }
      } catch (error) {
        console.log("Error fetching engines:", error);
      }
    };
    if (engine === "") listEngines();
  }, []);

  return (
    <Chat engine={engine} initialQuery={initialQuery} isFollowup={false} />
  );
};

export default Chatbot;
