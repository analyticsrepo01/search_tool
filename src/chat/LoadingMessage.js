import React from "react";
import { BsFillPersonFill } from "react-icons/bs";
import { FaRobot } from "react-icons/fa";

const LoadingMessage = () => {

    return (
        <>
            <div className="row">
                <div className="animate-pulse user-section col-11">
                    <div className="user-loading-bubble">
                        <h6 className="user-content h-4"></h6>
                    </div>
                </div>
                <div className="user-icon col-1">
                    <BsFillPersonFill size={30} />
                </div>
            </div>
            <div className="row ml-1 my-2">
                <div className="ai-icon col-1">
                    <FaRobot size={30} />
                </div>
                <div className="animate-pulse ai-section col-11">
                    <div className="ai-loading-bubble">
                        <h6 className="ai-content h-10"></h6>
                    </div>

                </div>
            </div>

        </>
    );
};

export default LoadingMessage;
