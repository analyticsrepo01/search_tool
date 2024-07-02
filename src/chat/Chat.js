import React, { useEffect, useState, useRef } from "react";
import Toast from "../components/Toast";
import Container from "../components/Container";
import ChatResults from "./ChatResults";
import AIMessage from "./AIMessage";
import UserMessage from "./UserMessage";
import ChatSearch from "./ChatSearch";
import LoadingMessage from "./LoadingMessage";
import ConversationHistory from "./ConversationHistory";
import config from "../config";

const Chat = ({ engine, initialQuery, isFollowup }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [results, setResults] = useState([]);
  const [conversationName, setConversationName] = useState("");
  const [conversationMessages, setConversationMessages] = useState([]);
  // const [conversationReply, setConversationReply] = useState("");
  // const [conversationState, setConversationState] = useState(0);
  // const [conversationStartTime, setConversationStartTime] = useState("");
  // const [conversationEndTime, setConversationEndTime] = useState("");

  const chatbotSectionRef = useRef(null);

  // Function to scroll to the bottom of the container
  const scrollToBottom = () => {
    if (chatbotSectionRef.current) {
      chatbotSectionRef.current.scrollTop =
        chatbotSectionRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    startConvo(initialQuery);
    // eslint-disable-next-line no-use-before-define
  }, [engine, initialQuery]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const startConvo = async (query) => {
    try {
      if (!query) return;
      if (isLoading) return;

      const request = {
        engine_id: engine,
        user_input: query,
      };

      const response = await start_convo(request);

      const data = await response.json();
      console.log("start conv", data);

      setConversationName(data[0].conversation.name);
      setConversationMessages(data[0].conversation.messages);
      // setConversationReply("");
      // setConversationState(data[0].conversation.state);
      // setConversationStartTime(data[0].conversation.start_time);
      // setConversationEndTime(data[0].conversation.end_time);
      setResults(data.slice(1));
      setIsLoading(false);
    } catch (error) {
      setErrorMessage("" + error);
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const continueConvo = async (query) => {
    try {
      if (!query) return;
      if (isLoading) return;

      const request = {
        conversation_name: conversationName,
        user_input: query,
        engine_id: engine,
      };

      const response = await continue_convo(request);
      const data = await response.json();
      console.log("continue conv", data);
      setConversationName(data[0].conversation.name);
      setConversationMessages(data[0].conversation.messages);
      // setConversationReply(data[0].reply);
      // setConversationState(data[0].conversation.state);
      // setConversationStartTime(data[0].conversation.start_time);
      // setConversationEndTime(data[0].conversation.end_time);

      setResults(data.slice(1));
      setIsLoading(false);
    } catch (error) {
      setErrorMessage("" + error);
      setIsLoading(false);
    }
  };

  const getConvo = async (conversation) => {
    try {
      if (isLoading) return;

      setConversationName(conversation.name);
      setConversationMessages(conversation.messages);
      // setConversationReply();
      // setConversationState(conversation.state);
      // setConversationStartTime(conversation.start_time);
      // setConversationEndTime(conversation.end_time);

      setResults([]);
      setIsLoading(false);
      window.scrollTo(0, 0);
    } catch (error) {
      setErrorMessage("" + error);
      setIsLoading(false);
    }
  };

  const start_convo = async (request) => {
    setIsLoading(true);
    const response = fetch(`${config.LOCALHOST}/start_convo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    return response;
  };

  const continue_convo = async (request) => {
    setIsLoading(true);
    const response = fetch(`${config.LOCALHOST}/continue_convo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    return response;
  };

  useEffect(() => {
    scrollToBottom();
  }, [continueConvo, startConvo]);

  const resetOnClick = () => {
    setConversationName("");
    setConversationMessages([]);
    setResults([]);
  };

  const onConversationClick = (conversation) => {
    console.log(conversation);
    getConvo(conversation);
  };

  return (
    <Container class1="store-wrapper home-wrapper-2">
      <div className="row pt-2">
        <div className="col-6 chatbot-title">Multi-turn Search</div>
        <div className="col-6 chatbot-title">Reference Results</div>
      </div>
      <div className="row">
        <div className="col-6">
          <div className="row">
            <div className="chatbot-section shadow" ref={chatbotSectionRef}>
              {console.log(conversationMessages)}
              {conversationMessages.map((message, index) => (
                <div key={index}>
                  <div className="pb-2">
                    <UserMessage index={index} message={message.input} />
                  </div>
                  <div className="pb-2">
                    <AIMessage index={index} message={message.reply} />
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="pb-2">
                  <LoadingMessage />
                </div>
              )}
            </div>
          </div>
          <div className="chatbot-search-section py-3">
            <ChatSearch
              onSearch={continueConvo}
              isLoading={isLoading}
              resetOnClick={resetOnClick}
            />
          </div>

          {/* ConversationHistory */}
          {!isFollowup && (
            <ConversationHistory
              engine={engine}
              isLoading={isLoading}
              onConversationClick={onConversationClick}
            />
          )}
        </div>
        {/* Search Results */}
        <div className="col-6">
          <div className="d-flex gap-10 flex-wrap">
            <ChatResults searchResults={results} isLoading={isLoading} />
          </div>
        </div>
      </div>
      {errorMessage && <Toast type="error" message={errorMessage} />}
    </Container>
  );
};

export default Chat;
