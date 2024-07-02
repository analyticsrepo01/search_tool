import React from "react";
import { FaRobot } from "react-icons/fa";
import parse from 'html-react-parser';

const AIMessage = ({
    index,
    message,
}) => {

    // Replace < with &lt; and > with &gt to prevent <> being recognised as a dom element
    function cleanExpression(expression) {
        const cleanedExpression = expression.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return cleanedExpression;
    }

    return (
        <div className="row ml-1">
            <div className="ai-icon col-1">
                <FaRobot size={30} />
            </div>
            <div className="ai-section col-11 fadeIn">
                <div className="ai-bubble">
                    <h6 className="ai-content">{parse(cleanExpression(message))}</h6>
                </div>

            </div>
        </div>
    );
};

export default AIMessage;
