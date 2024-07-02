import React, { useState, useEffect } from "react";
// import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import parse from 'html-react-parser';
import Prompt from "./Prompt";
import Popup from "../components/Popup";
import config from "../config";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Summary = ({
  summary, llmSummary, onRegenerate, isLoadingRegenerate, isLoading, query, defaultUserInput, handleUserInputChange, userInput, llmModel, setLlmModel, searchResults,
  temperature, topK, topP,
  setTemperature, setTopK, setTopP 
}) => {

  // const [userInputFromPrompt, setUserInputFromPrompt] = useState("");
  // const [exampleText, setExampleText] = useState("");
  const uriLinks = searchResults.map((result) => result.uri_link);
  const [markdownEnabled, setMarkdownEnabled] = useState(false);
  const [models, setModels] = useState([])

  // Load list of models
  useEffect(() => {
    const listModels = async () => {
      try {
        const response = await fetch(`${config.LOCALHOST}/listModels`, {
          method: "GET",
        });
        const data = await response.json();
        setModels(data);
      } catch (error) {
        console.log("Error fetching models:", error);
      }
    };
    listModels();
  }, []);

  const handleTemperatureChange = (e) => {
    setTemperature(parseFloat(e.target.value));
  };

  const handleTopKChange = (e) => {
    setTopK(parseFloat(e.target.value));
  };

  const handleTopPChange = (e) => {
    setTopP(parseFloat(e.target.value));
  };

  // Replace [x] and [x, y] with links
  const replaceLinksInSummary = (summaryText) => {
    // Match [x] or [x, y]
    const linkRegex = /\[(\d+(?:,\s*\d+)*)\]/g;
    const parsedSummary = summaryText.replace(linkRegex, (match, indices) => {
      // Split the indices by commas and map them to links
      const linkIndices = indices.split(",").map((index) => parseInt(index.trim()) - 1);
      // Check if all indices are valid and within the range of uriLinks
      if (linkIndices.every((index) => !isNaN(index) && index >= 0 && index < uriLinks.length)) {
        const links = linkIndices.map((linkIndex) => {
          return `<a href="#" data-index="${linkIndex}" className="summary-link">${linkIndex + 1}</a>`;
        });
        // Join the links with commas and return the result with square brackets
        return `[${links.join(", ")}]`;
      }
      return match; // Keep the original text if any index is out of range
    });
    return parsedSummary;
  };

  // Handle clicks on summary links
  const handleSummaryLinkClick = (linkIndex) => (event) => {
    event.preventDefault();
    if (!isNaN(linkIndex) && linkIndex >= 0 && linkIndex < uriLinks.length) {
      const titles = searchResults.map((result) => result.filter_name);
      // const summaries = searchResults.map((result) => result.filter_summary);

      const uriLink = uriLinks[linkIndex];
      const title = titles[linkIndex];
      // const description = summaries[linkIndex];
      const description = "";
      handlePopupOpen(title, description, uriLink);
    }
  };

  const handleLlmModelChange = (event) => {
    setLlmModel(event.target.value);
  };

  const handleRegenerate = () => {
    onRegenerate(llmModel);
  };

  const onUserInputChange = (value) => {
    // setUserInputFromPrompt(value);
    handleUserInputChange(value);
  };

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupProps, setPopupProps] = useState({
    title: "",
    description: "",
    uriLink: "",
  });

  const handlePopupOpen = (title, description, uriLink) => {
    setPopupProps({
      title,
      description,
      uriLink,
    });
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
  };

  const renderOptions = {
    replace: (node) => {
      if (node.attribs && node.attribs["data-index"]) {
        const linkIndex = parseInt(node.attribs["data-index"]);
        return (
          <span
            className="summary-link"
            onClick={handleSummaryLinkClick(linkIndex)}
          >
            {node.children[0].data}
          </span>
        );
      }
      return node;
    },
  };

  const toggleMarkdown = () => {
    setMarkdownEnabled(!markdownEnabled);
  };

  return (
    <div>

      <div className="filter-sort-grid mb-3 p-4 shadow">

        {/* LLM Model */}
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <span className="llm-title">
              LLM Model
            </span>
            <select
              name=""
              value={llmModel}
              className="form-control form-select"
              onChange={handleLlmModelChange}
            >
              <option value="es">Vertex AI Search (default)</option>
              {models.map((engineOption) => (
                <option key={engineOption} value={engineOption}>
                  {engineOption}
                </option>
              ))}
            </select>
          </div>

          {/* LLM config */}
          {llmModel !== "es" &&
          <>
            <div className="d-flex align-items-center">
              <label className="llm-config">Temp.</label>
              <input
                type="number"
                name="temperature"
                min="0.0"
                max="1.0"
                step="0.1"
                value={temperature}
                onChange={handleTemperatureChange}
                className="form-control"
              />
            </div>

            <div className="d-flex align-items-center">
              <label className="llm-config">TopK</label>
              <input
                type="number"
                name="topK"
                min="1"
                max="40"
                step="1"
                value={topK}
                onChange={handleTopKChange}
                className="form-control"
              />
            </div>

            <div className="d-flex align-items-center">
              <label className="llm-config">TopP</label>
              <input
                type="number"
                name="topP"
                min="0.0"
                max="1.0"
                step="0.01"
                value={topP}
                onChange={handleTopPChange}
                className="form-control"
              />
            </div>
          </>
          }
        </div>

        {/* Prompt */}
        {llmModel !== "es" &&
        <>
          <br /><hr className="pdf-preview-divider" />
          <Prompt
            query={query}
            userInput={userInput}
            defaultUserInput={defaultUserInput}
            onUserInputChange={onUserInputChange}
            isLoadingRegenerate={isLoadingRegenerate}
            isLoading={isLoading}
            // exampleText={exampleText}
          />
        </>
        }

        {/* AI Answer */}
        {searchResults.length>0 && (
        <>
        <br/><hr className="pdf-preview-divider" />
        <div className="summary-details">
          <div className="d-flex justify-content-between align-items-center">
            <div className="title-content">
              <img className="star-title" src="https://www.gstatic.com/lamda/images/sparkle_resting_v2_darkmode_2bdb7df2724e450073ede.gif" alt="Star Icon" />
              <h5 className="summary-title">
                AI Answer
              </h5>
            </div>
            {/* Markdown Toggle */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                value="markdown"
                className="sr-only peer"
                checked={markdownEnabled}
                onChange={toggleMarkdown} />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ml-3 markdown-text">Markdown</span>
            </label>
          </div>

          {/* Loading Pulse */}
          {(isLoading || isLoadingRegenerate) && (
            <div className="animate-pulse">
              <div className="flex-1 space-y-6 py-1">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-400 rounded"></div>
                  <div className="h-4 bg-slate-400 rounded"></div>
                  <div className="h-4 bg-slate-400 rounded"></div>
                  <div className="h-4 bg-slate-400 rounded"></div>
                </div>
              </div>
            </div>
          )}

          {/* Summary Text */}
          {!isLoadingRegenerate && !isLoading && (
            <div className="fadeIn markdown-content">
              <div className="summary-description">
                {!markdownEnabled &&
                  (llmModel === "es"
                    ? summary ? parse(replaceLinksInSummary(summary.trimStart()), renderOptions) : "No Summary Generated."
                    : llmSummary ? parse(llmSummary.trimStart()) : "No Summary Generated."
                  )}
              </div>
              <div className="markdown-table-container">
                {markdownEnabled &&
                  (llmModel === "es" ?
                    summary ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {replaceLinksInSummary(summary.trimStart())}
                      </ReactMarkdown>
                    ) : "No Summary Generated."
                    : llmSummary ?
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        children={llmSummary.trimStart()}>
                      </ReactMarkdown>
                      : "No Summary Generated."
                  )}
              </div>
            </div>
          )}
        </div>

        <div className="d-flex justify-content-between align-items-center mt-2">
          <div className=""></div>
          {(isLoading || isLoadingRegenerate) && (
          <div className="loading-icon-regenerate">
            <img alt="" className="star" src="https://www.gstatic.com/lamda/images/sparkle_thinking_v2_darkmode_4c6a95bde842a7825eb83.gif"></img>
          </div>
          )}
          <div className="">
            <button
              className="button-regenerate"
              onClick={handleRegenerate}
              disabled={isLoadingRegenerate || isLoading}
              style={{ backgroundColor: isLoadingRegenerate || isLoading ? "grey" : "" }}
            >
              Regenerate
            </button>
          </div>
        </div>
        </>
        )}

        {/* <div className="thumbs">
          <button className="thumbs-up">
            <FaThumbsUp className="thumbs-icon" />
          </button>
          <button className="thumbs-down">
            <FaThumbsDown className="thumbs-icon" />
          </button>
        </div> */}

      </div>

      {isPopupOpen && (
        <Popup
          onClose={handlePopupClose}
          title={popupProps.title}
          description={popupProps.description}
          uriLink={popupProps.uriLink}
        />
      )}

    </div>
  );
};

export default Summary;
