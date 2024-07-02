import React, { useState } from "react";
import { BsInfoCircle } from "react-icons/bs";
import { BiChevronDownCircle, BiChevronUpCircle } from "react-icons/bi";


const Prompt = ({ query, defaultUserInput, userInput, onUserInputChange, isLoadingRegenerate, isLoading }) => {
    const [openPrompt, setOpenPrompt] = useState(true);

    const setExampleText = () => {
        onUserInputChange(defaultUserInput);
    };

    const handleChange = (event) => {
        let value = event.target.value;
        // if (!value) value = defaultUserInput;
        onUserInputChange(value);
    };

    const generateTooltipContent = () => {
        const snippetContent = '{{snippet_1}}';
        const answerContent = '{{answer_1-2}}';
        const segmentContent = '{{segment_1-2}}';
        const docNameContent = '{{docName_1}}';
        const queryContent = '{{query}}';
        const summaryContent = '{{summary}}';
        const checked_snippets = '{{checked_snippets}}';
        const checked_answers = '{{checked_answers}}';
        const checked_segments = '{{checked_segments}}';
        return (
            <>
                {/* <u>Format</u> */}
                {/* <br /> */}
                <b>{`${queryContent}`}</b> : Original Query
                <br />
                <b>{`${summaryContent}`}</b> : Default Summary
                <br />
                <b>{`${docNameContent}`}</b> : Name of 1st Document
                <br />
                <b>{`${snippetContent}`}</b> : Snippet of 1st Document
                <br />
                <b>{`${answerContent}`}</b> : 2nd Answer of 1st Document
                <br />
                <b>{`${segmentContent}`}</b> : 2nd Segment of 1st Document
                <br />
                <b>{`${checked_snippets}`}</b> : All Snippets of Checked Documents
                <br />
                <b>{`${checked_answers}`}</b> : All Answers of Checked Documents
                <br />
                <b>{`${checked_segments}`}</b> : All Segments of Checked Documents
            </>
        );
    };

    const togglePrompt = () => {
        setOpenPrompt(!openPrompt);
    };

    return (
        <div className="prompt">
            <div className="d-flex justify-content-between align-items-center">
                <div className="prompt-button-box">
                    <h5 className="editor-title">Prompt Editor</h5>
                    <button
                        onClick={setExampleText}
                        className="prompt-button"
                        disabled={isLoadingRegenerate || isLoading}
                        style={{ backgroundColor: isLoadingRegenerate || isLoading ? "grey" : "" }}>
                        Set Default
                    </button>
                    <div className="info-icon-box">
                        <BsInfoCircle className="info-icon" />
                        <div className="tooltip">{generateTooltipContent()}</div>
                    </div>
                </div>
                <div className="prompt-button-box">
                {openPrompt ?
                    <BiChevronUpCircle size={26} className="mr-3" onClick={togglePrompt}/>
                    : <BiChevronDownCircle size={26} className="mr-3" onClick={togglePrompt}/>
                }
                </div>
            </div>
            {openPrompt &&
            <textarea
                value={userInput}
                onChange={handleChange}
                className="prompt-body my-2"
                rows={7}
                wrap="soft"
                disabled={isLoadingRegenerate || isLoading}
            />
            }
        </div>
    );
};

export default Prompt;

