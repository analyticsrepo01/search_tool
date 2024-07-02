import React, { useState, useEffect } from "react";
import { BsChatDots } from 'react-icons/bs';
import { DataGrid } from '@mui/x-data-grid';
import { MdOutlineRefresh } from "react-icons/md";
import ConfirmationPopup from "../data/ConfirmationPopup";
import Toast from "../components/Toast";
import config from "../config";

const ConversationHistory = ({
    engine,
    onConversationClick,
}) => {
    const [conversationList, setConversationList] = useState([])
    const [conversationChecklist, setConversationChecklist] = useState([]);
    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);

    const [isRefresh, setIsRefresh] = useState(false)
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const openDeletePopup = () => {
        setIsDeletePopupOpen(true);
    };

    const closeDeletePopup = () => {
        setIsDeletePopupOpen(false);
    };

    const handleRefresh = () => {
        setIsRefresh(true);
      };

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${config.LOCALHOST}/list_convo`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ engine_id: engine }),
                });
                const data = await response.json();

                // Generate unique IDs based on the last part of the "name" field
                const conversationsWithIds = data.map((conversation) => ({
                    ...conversation,
                    id: conversation.name.split('/').pop(),
                }));

                setConversationList(conversationsWithIds);
                setIsLoading(false);
            } catch (error) {
                setErrorMessage("Error fetching conversations:", error);
                console.log("Error fetching conversations:", error);
                setIsLoading(false);
            }
        };
        if (engine !== ""){
            fetchConversations();
        }
        if (isRefresh) setIsRefresh(false);
    }, [isRefresh, engine]);

    const handleDelete = async () => {
        try {
            closeDeletePopup();
            setIsLoading(true);
            setSuccessMessage("");

            const response = await fetch(`${config.LOCALHOST}/delete_convos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ conversations: conversationChecklist })
            });
            if (response.status === 200) {
                setSuccessMessage("Deleted Successfully!");
                setIsLoading(false);
                setIsRefresh(true);
            }
        } catch (error) {
            setIsLoading(false);
            setErrorMessage("Error deleting conversations:", error);
            console.log("Error deleting conversations:", error);
        }
    }

    const handleConversationClick = (conversation) => {
        onConversationClick(conversation);
    };

    const onRowsSelectionHandler = (selectedIds) => {
        const selectedNames = selectedIds.map((id) => conversationList.find((row) => row.id === id).name);
        setConversationChecklist(selectedNames);
    };

    const columns = [
        // { field: "id", headerName: "ID", width: 100 },
        // { field: "name", headerName: "Name", width: 400 },
        // { field: "state", headerName: "State", width: 200 },
        // { field: "start_time", headerName: "Start Time", width: 200 },
        {
            field: "messages", // This field represents the messages
            headerName: "Conversations",
            width: 400,
            renderCell: (params) => (
                <div>{params.value[0].input}</div>
                // <ul>
                //     {params.value.map((message, index) => (
                //         <li key={index}>{message.input}</li>
                //     ))}
                // </ul>
            ),
        },
        {
            field: "uri",
            headerName: "Link",
            width: "",
            renderCell: (params) => (
                <a
                    className="product-link clickable-header"
                    onClick={() => handleConversationClick(params.row)}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <BsChatDots className="fs-4 urilink" />
                </a>
            ),
        },
    ];

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="input-group-text px-4 search-icon" id="basic-addon2" 
                    onClick={handleRefresh}
                    disabled={isLoading}
                    style={{ backgroundColor: conversationList.length === 0 || isLoading ? "grey" : "" }}
                >
                    <MdOutlineRefresh className="fs-5" />
                </div>
                <div className="align-items-center">
                    <button
                        className="button-delete"
                        onClick={openDeletePopup}
                        disabled={conversationList.length === 0 || conversationChecklist.length === 0 || isLoading}
                        style={{ backgroundColor: conversationList.length === 0 || conversationChecklist.length === 0 || isLoading ? "grey" : "" }}
                    >
                        Delete Selected
                    </button>
                </div>
            </div>

            {isDeletePopupOpen && (
                <ConfirmationPopup
                    message="Are you sure you want to delete the selected conversations?"
                    onCancel={closeDeletePopup}
                    onConfirm={handleDelete}
                />
            )}

            <div className="products-list pb-5">
                <div style={{ height: "", width: "" }}>
                    <DataGrid
                        className="datagrid shadow"
                        rows={conversationList}
                        columns={columns}
                        checkboxSelection
                        loading={isLoading}
                        onRowSelectionModelChange={(item) => onRowsSelectionHandler(item)}
                    />
                </div>
            </div >

            {/* Toast */}
            {successMessage &&
                <Toast type="success" message={successMessage} />
            }
            {errorMessage &&
                <Toast type="error" message={errorMessage} />
            }
        </>
    );
};

export default ConversationHistory;