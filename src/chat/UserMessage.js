import React from "react";
import {BsFillPersonFill} from "react-icons/bs";
// import parse from 'html-react-parser';

const UserMessage = ({
    message,
}) => {

    return (
        <div className="row">
            <div className="user-section col-11 fadeIn">
                <div className="user-bubble">
                    <h6 className="user-content">{message}</h6>
                </div>
            </div>
            <div className="user-icon col-1">
                <BsFillPersonFill size={30}/>
            </div>
        </div>
    );
};

export default UserMessage;

