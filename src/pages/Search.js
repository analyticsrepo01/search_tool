import React, { useState, useEffect } from "react";
import { GrNext, GrPrevious } from "react-icons/gr";
import { BsChatDots } from "react-icons/bs";
import Meta from "../components/Meta";
import Container from "../components/Container";
import Toast from "../components/Toast";
import ToggleSidebar from "../components/ToggleSidebar";
import Logo from "../components/Logo";
import SearchHeader from "../search/SearchHeader";
import Sidebar from "../search/Sidebar";
import Summary from "../search/Summary";
import SearchResults from "../search/SearchResults";
import Followup from "../chat/Followup";
import config from "../config";

const Search = ({ engine, setEngine, setEngines }) => {
  // Status Messages
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRegenerate, setIsLoadingRegenerate] = useState(false);
  // Configurations
  const [originalQuery, setOriginalQuery] = useState("");
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [numSnippets, setNumSnippets] = useState(1);
  const [numAnswers, setNumAnswers] = useState(3);
  const [numSegments, setNumSegments] = useState(3);
  const [summaryCount, setSummaryCount] = useState(5);
  const [tenant, setTenant] = useState("");
  const [nextPageToken, setNextPageToken] = useState("");
  const [tenantList, setTenantList] = useState([]);
  const [pageToken, setPageToken] = useState("");
  // Summary
  const [summary, setSummary] = useState("");
  const [llmSummary, setLlmSummary] = useState("");
  const [llmModel, setLlmModel] = useState("es");
  const defaultUserInput = `You are an internal knowledge base with a search function. 
Your knowledge strictly comes from the Knowledge List provided.
Based on the Knowledge List, provide a coherent summary to answer the Question below.

Knowledge List: {{answer_1-1}}, {{answer_1-2}}, {{answer_2-1}}, {{answer_2-2}}
Question: {{query}}
Answer: `;
  const [userInput, setUserInput] = useState(defaultUserInput);
  // Facets
  const [facetsData, setFacetsData] = useState({});
  const [facetChecklist, setFacetChecklist] = useState({});
  const [isFacetClicked, setIsFacetClicked] = useState(false);
  const [isSearchReset, setIsSearchReset] = useState(false);
  // Results
  const [searchResults, setSearchResults] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  // Pagination
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [fetchedPages, setFetchedPages] = useState([]);
  const [prevRequest, setPrevRequest] = useState(null);
  const [indexOffset, setIndexOffset] = useState(0);
  // Regenerate
  const [temperature, setTemperature] = useState(0.0);
  const [topK, setTopK] = useState(40);
  const [topP, setTopP] = useState(0.95);

  // Get userInput from Summary and Prompt
  const handleUserInputChange = (value) => {
    setUserInput(value);
  };

  // Fetch List of Tenants
  // useEffect(() => {
  //   const listMetadata = async () => {
  //     try {
  //       const response = await fetch(`${config.LOCALHOST}/listMetadata`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ engine_id: engine }),
  //       });
  //       const data = await response.json();
  //       setTenantList(data[0]);
  //     } catch (error) {
  //       setErrorMessage("" + error);
  //       console.log("Error fetching documents:", error);
  //     }
  //   };
  //   if (engine !== ""){
  //     listMetadata();
  //   }
  // }, [engine]);

  // Load Engines and Check Query Parameters in URL
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

      setSuccessMessage("");
      setErrorMessage("");

      // Access the query string from the URL
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);

      // Skip the code if there are no query parameters
      if (!Array.from(urlParams.values()).some((paramValue) => paramValue)) {
        return;
      }

      // Parse and set query parameters
      const engine_id = urlParams.get("engine_id");
      const page_token = urlParams.get("page_token");
      const llmModel = urlParams.get("llmModel");
      const search_query = urlParams.get("search_query");
      const page_size = parseInt(urlParams.get("page_size"));
      const summary_result_count = parseInt(
        urlParams.get("summary_result_count")
      );
      const max_snippet_count = parseInt(urlParams.get("max_snippet_count"));
      const max_extractive_answer_count = parseInt(
        urlParams.get("max_extractive_answer_count")
      );
      const max_extractive_segment_count = parseInt(
        urlParams.get("max_extractive_segment_count")
      );
      const filter_tenant = urlParams.get("filter_tenant");
      const userInput = urlParams.get("userInput");
      const temperature = parseFloat(urlParams.get("temperature"));
      const topK = parseInt(urlParams.get("topK"));
      const topP = parseFloat(urlParams.get("topP"));

      // Apply the parsed parameters to your state

      setEngine(engine_id);
      setPageToken(page_token);
      setLlmModel(llmModel);
      setQuery(search_query);
      setPageSize(page_size);
      setSummaryCount(summary_result_count);
      setNumSnippets(max_snippet_count);
      setNumAnswers(max_extractive_answer_count);
      setNumSegments(max_extractive_segment_count);
      setTenant(filter_tenant);
      setUserInput(userInput);
      setTemperature(temperature);
      setTopK(topK);
      setTopP(topP);
    };
    listEngines();
    // eslint-disable-next-line
  }, []);

  // Handle Results Checkbox Change
  const handleCheckboxChange = (item, isChecked) => {
    // console.log(`Item ${item.id} is ${isChecked ? "checked" : "unchecked"}`);
    // Ensure the checkedItems array has at most 5 items
    if (isChecked && checkedItems.length >= 5) {
      return;
    }
    if (isChecked) {
      setCheckedItems((prevCheckedItems) => [...prevCheckedItems, item]);
    } else {
      setCheckedItems((prevCheckedItems) =>
        prevCheckedItems.filter((x) => x !== item)
      );
    }
  };

  // Handle Facets Checkbox Change
  const handleFacetsChange = (facet, isChecked, category) => {
    // console.log(`Facet ${facet} is ${isChecked ? "checked" : "unchecked"}`);
    if (isChecked) {
      setFacetChecklist((prevFacetChecklist) => {
        const updatedFacetChecklist = { ...prevFacetChecklist };
        updatedFacetChecklist[category] = [
          ...prevFacetChecklist[category],
          facet,
        ];
        return updatedFacetChecklist;
      });
    } else {
      setFacetChecklist((prevFacetChecklist) => {
        const updatedFacetChecklist = { ...prevFacetChecklist };
        updatedFacetChecklist[category] = prevFacetChecklist[category].filter(
          (item) => item !== facet
        );
        return updatedFacetChecklist;
      });
    }
    setIsFacetClicked(true);
  };

  // Call /search API when facets checkbox change
  useEffect(() => {
    if (isFacetClicked) {
      handleSearch(query, 2);
      setIsFacetClicked(false);
    }
    // eslint-disable-next-line
  }, [isFacetClicked]);

  /* 
    searchState
    0: New Query - setResults, setSummary, reset facets checklist
    1: Regenerate - idList as filter
    2: Facet Change - setResults, setSummary, facetList as filter
  */
  const handleSearch = async (query, searchState) => {
    try {
      setErrorMessage("");
      if (!query) return;
      if (isLoading || isLoadingRegenerate) return;

      // If userInput for prompt is empty, return error.
      console.log(userInput);
      if (llmModel !== "es" && userInput === "") {
        setErrorMessage("Prompt cannot be empty!");
        return;
      }

      if (searchState !== 1) setIsLoading(true);
      const idList =
        searchState === 1 ? checkedItems.map((item) => item.id) : []; // use checkedItems only for Regenerate

      // Fresh Search, reset facets, facets checked, LLMmodel
      const facetList = searchState === 0 ? [] : facetChecklist;
      if (searchState === 0) {
        setFacetChecklist({ category: [], tenant: [] });
        setIsSearchReset(true);
      }

      const request = {
        engine_id: engine,
        llmModel: llmModel,
        page_token: pageToken,
        search_query: query,
        page_size: pageSize,
        summary_result_count: summaryCount,
        max_snippet_count: numSnippets,
        max_extractive_answer_count: numAnswers,
        max_extractive_segment_count: numSegments,
        filter_id: idList,
        filter_facets: facetList,
        filter_tenant: tenant,

        // searchState: searchState,
        // checkedItems: checkedItems,
        userInput: userInput,
        temperature: temperature,
        topK: topK,
        topP: topP,
      };

      // Construct the query parameters
      const queryParams = new URLSearchParams();
      for (const key in request) {
        queryParams.set(key, request[key]);
      }

      // Update the URL with the query parameters
      const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
      window.history.pushState({}, "", newUrl);

      console.log("request:", request);
      const requestJson = JSON.stringify(request);
      // setReusableString(requestJson);

      const response = await fetch(`${config.LOCALHOST}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestJson,
      });

      const data = await response.json();
      console.log("response:", data);

      // Set Summary, Query
      setSummary(
        data[0].summary === "" ? "No Summary Generated." : data[0].summary
      );
      setOriginalQuery(query);
      setQuery(
        data[0].corrected_query !== "" ? data[0].corrected_query : query
      );

      // Set Results and Checked Results if New Search and Facets Search
      if (searchState !== 1) {
        setSearchResults(data);
        setCheckedItems(data.slice(1, summaryCount + 1).map((item) => item));

        // Handle Pagination
        setCurrentPageIndex(1);
        setIndexOffset(pageSize);
        setPrevRequest(request);
        setFetchedPages([]);
        setFetchedPages((prevPages) => [...prevPages, data]);
        setNextPageToken(data[0].nextPageToken);
        // console.log("nextPageToken:", data[0].nextPageToken);
      }

      // Set Facets only if New Search
      if (searchState === 0) {
        setFacetsData(data[0].facets);
        setIsSearchReset(false);
        // Get LLM Summary if llm not "es"
        if (llmModel !== "es") {
          await regenerateNewModel(llmModel, query, data);
        }
      }
      setIsLoading(false);
      setIsLoadingRegenerate(false);
    } catch (error) {
      setErrorMessage("" + error);
      setIsLoading(false);
      setIsSearchReset(false);
      setIsLoadingRegenerate(false);
    }
  };

  // Regenerate (searchState: 1)
  const handleRegenerate = async (llmModel) => {
    try {
      setIsLoadingRegenerate(true);
      console.log("model:", llmModel);

      if (llmModel === "es") {
        // call search api using filter on the checked documents only
        await handleSearch(query, 1);
      } else {
        // call other llm models
        await regenerateNewModel(llmModel, query, searchResults);
      }
    } catch (error) {
      // Handle the error
      setErrorMessage("" + error);
    }
  };

  // Vertex AI API
  const regenerateNewModel = async (llmModel, query, searchResults) => {
    try {
      const request = {
        llmModel: llmModel,
        query: query,
        summary: searchResults[0].summary,
        checkedItems: checkedItems,
        // resultDetails: searchResults[0],
        searchResults: searchResults.slice(1),
        userInput: userInput,
        temperature: temperature,
        topK: topK,
        topP: topP,
      };
      const response = await fetch(`${config.LOCALHOST}/regenerate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const regeneratedData = await response.json();
      console.log("regeneratedData: ", regeneratedData);
      setLlmSummary(regeneratedData);

      setIsLoadingRegenerate(false);
    } catch (error) {
      setIsLoadingRegenerate(false);
      // Handle the error
      setErrorMessage("" + error);
    }
  };

  // Handle Next Page
  const handleNextPage = async () => {
    if (isLoading || isLoadingRegenerate) return;
    if (currentPageIndex < fetchedPages.length)
      setSearchResults(fetchedPages[currentPageIndex]);
    else await fetchNextPage(prevRequest, nextPageToken);
    setCurrentPageIndex(currentPageIndex + 1);
  };
  const fetchNextPage = async (prevRequest, nextPageToken) => {
    try {
      setIsLoading(true);
      prevRequest.page_token = nextPageToken;
      const response = await fetch(`${config.LOCALHOST}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(prevRequest),
      });
      const data = await response.json();
      console.log("Next Page Request:", prevRequest);
      console.log("Next Page Response:", data);
      setSearchResults(data);
      setNextPageToken(data[0].nextPageToken);
      setFetchedPages((prevPages) => [...prevPages, data]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage("" + error);
      setIsLoading(false);
    }
  };

  // Handle Previous Page
  const handlePrevPage = () => {
    if (isLoading || isLoadingRegenerate) return;
    setSearchResults(fetchedPages[currentPageIndex - 2]);
    setCurrentPageIndex(currentPageIndex - 1);
  };

  // Handle Click Page Number
  const handlePageNumberClick = (pageNumber) => {
    if (isLoading || isLoadingRegenerate) return;
    setSearchResults(fetchedPages[pageNumber - 1]);
    setCurrentPageIndex(pageNumber);
  };

  // Handle Sidebar
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const closeChatbot = () => {
    setIsChatbotOpen(false);
  };
  const openChatbot = () => {
    setIsChatbotOpen(true);
  };
  return (
    <>
      <Meta title={"Search"} />

      <Container class1="store-wrapper home-wrapper-2 py-3">
        <div className="row">
          <div className="col-3 sidebar-wrapper">
            <Logo />
          </div>
          <div className="col-9">
            <SearchHeader
              query={query}
              setQuery={setQuery}
              onSearch={handleSearch}
              correctedQuery={
                searchResults.length > 0 ? searchResults[0].corrected_query : ""
              }
              isLoading={isLoading}
              isLoadingRegenerate={isLoadingRegenerate}
            />
          </div>
        </div>
        <div className="row">
          {isSidebarExpanded && (
            <div className="col-3 sidebar-wrapper">
              <Sidebar
                facetsData={facetsData}
                setFacetsData={setFacetsData}
                onFacetsChange={handleFacetsChange}
                isSearchReset={isSearchReset}
                numSnippets={numSnippets}
                setNumSnippets={setNumSnippets}
                numAnswers={numAnswers}
                setNumAnswers={setNumAnswers}
                numSegments={numSegments}
                setNumSegments={setNumSegments}
                pageSize={pageSize}
                setPageSize={setPageSize}
                tenant={tenant}
                setTenant={setTenant}
                summaryCount={summaryCount}
                setSummaryCount={setSummaryCount}
                tenantList={tenantList}
              />
            </div>
          )}
          <div className={isSidebarExpanded ? "col-9" : "col-12"}>
            {/* Summary */}
            {/* {searchResults.length > 0 ? ( */}
            <Summary
              summary={summary}
              llmSummary={llmSummary}
              onRegenerate={handleRegenerate}
              llmModel={llmModel}
              setLlmModel={setLlmModel}
              isLoadingRegenerate={isLoadingRegenerate}
              isLoading={isLoading}
              query={query}
              handleUserInputChange={handleUserInputChange}
              userInput={userInput}
              defaultUserInput={defaultUserInput}
              searchResults={searchResults.slice(1)}
              temperature={temperature}
              topK={topK}
              topP={topP}
              setTemperature={setTemperature}
              setTopK={setTopK}
              setTopP={setTopP}
            />
            {/* ) : ( */}
            <>
              {/* <div className="filter-sort-grid mb-3 p-4 border-blue-300 shadow rounded-md">
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="space-y-3">
                      <div className="grid grid-cols-7 h-10 mb-4">
                        <div className="rounded bg-slate-400 col-span-3"></div>
                        <div className="col-span-3"></div>
                        <div className="rounded-full bg-slate-400 col-span-1"></div>
                      </div>
                      <hr className="pdf-preview-divider my-4" />
                      <div className="grid grid-cols-6 h-8">
                        <div className="rounded bg-slate-400 col-span-1"></div>
                      </div>
                      <div className="h-4 bg-slate-400 rounded"></div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="h-4 bg-slate-400 rounded col-span-2"></div>
                          <div className="h-4 bg-slate-400 rounded col-span-1"></div>
                        </div>
                        <div className="h-4 bg-slate-400 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}
            </>
            {/* )} */}

            {/* SearchResults */}
            {searchResults.length > 0 && !isLoading ? (
              <>
                <div className="d-flex gap-10 flex-wrap">
                  <SearchResults
                    searchResults={searchResults.slice(1)}
                    checkedItems={checkedItems}
                    summaryCount={summaryCount}
                    onCheckboxChange={handleCheckboxChange}
                    indexOffset={indexOffset}
                    currentPageIndex={currentPageIndex}
                  />
                </div>

                <div className="breadcrumb py-2">
                  <div className="container-xxl">
                    <div className="d-flex justify-content-center align-items-center">
                      <div className="d-flex align-items-center">
                        <GrPrevious
                          className="fs-5 arrow-button"
                          onClick={handlePrevPage}
                          hidden={currentPageIndex === 1}
                          disabled={isLoadingRegenerate || isLoading}
                          style={{
                            cursor:
                              !isLoadingRegenerate && !isLoading
                                ? "pointer"
                                : "",
                          }}
                        />
                        {fetchedPages.map((pageData, index) => (
                          <span
                            key={index}
                            className={`shadow page-number ${
                              currentPageIndex === index + 1 ? "active" : ""
                            }`}
                            onClick={() => handlePageNumberClick(index + 1)}
                          >
                            {index + 1}
                          </span>
                        ))}
                        {(currentPageIndex < fetchedPages.length ||
                          nextPageToken) && (
                          <GrNext
                            className="fs-5 arrow-button"
                            onClick={handleNextPage}
                            disabled={isLoadingRegenerate || isLoading}
                            style={{
                              cursor:
                                !isLoadingRegenerate && !isLoading
                                  ? "pointer"
                                  : "",
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* <div className="product-card mb-3 p-4 border-blue-300 shadow rounded-md">
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="space-y-3">

                      <div className="grid grid-cols-7 h-8">
                        <div className="rounded bg-slate-400 col-span-3"></div>
                      </div>
                      <div className="grid grid-cols-4 h-4">
                        <div className="rounded bg-slate-400 col-span-1"></div>
                      </div>

                      <div className="grid grid-cols-10 h-4 mt-4">
                        <div className="rounded bg-slate-400 col-span-1"></div>
                      </div>
                      <div className="h-4 bg-slate-400 rounded"></div>

                      <div className="grid grid-cols-10 h-4 mt-4">
                        <div className="rounded bg-slate-400 col-span-1"></div>
                      </div>
                      <div className="h-4 bg-slate-400 rounded"></div>

                      <div className="grid grid-cols-10 h-4 mt-4">
                        <div className="rounded bg-slate-400 col-span-1"></div>
                      </div>
                      <div className="h-4 bg-slate-400 rounded"></div>

                    </div>
                  </div>
                </div>
              </div> */}
              </>
            )}
          </div>
        </div>

        {/* Toast */}
        {successMessage && <Toast type="success" message={successMessage} />}
        {errorMessage && <Toast type="error" message={errorMessage} />}

        {/* ToggleSidebar */}
        <div>
          <ToggleSidebar
            toggleIcon={toggleSidebar}
            isSidebarExpanded={isSidebarExpanded}
          />
        </div>

        {/* ToggleChatbot */}
        {originalQuery && (
          <div className="toggle-chatbot-button" onClick={openChatbot}>
            {<BsChatDots size={26} />}
          </div>
        )}
        {isChatbotOpen && (
          <Followup
            onClose={closeChatbot}
            engine={engine}
            initialQuery={originalQuery}
          ></Followup>
        )}
      </Container>
    </>
  );
};

export default Search;
