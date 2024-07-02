from google.cloud import discoveryengine_v1beta as discoveryengine
from google.protobuf.json_format import MessageToDict

# from google.protobuf.field_mask_pb2 import FieldMask
# field_mask = FieldMask(paths=['user_pseudo_id'])


def create_conversation(parent_value, conversation):
    """Creates a new conversation

    Args:
        parent_value (required): projects/{project_number}/locations/{location_id}/collections/{collection}/dataStores/{data_store_id}
        conversation (required): {'user_pseudo_id': user_id}

    Returns:
        google.cloud.discoveryengine_v1beta.types.Conversation

    Raises:

    """
    client = discoveryengine.ConversationalSearchServiceClient()
    request = discoveryengine.CreateConversationRequest(
        parent=parent_value,  # required
        conversation=conversation,  # required
        # retry=, # google.api_core.retry.Retry
        # timeout=, # float
        # metadata=, #(Sequence[Tuple[str, str]])
    )
    response = client.create_conversation(request=request)
    return response


def delete_conversation(name):
    """Delete a conversation

    Args:
        name (required): projects/{project_number}/locations/{location_id}/collections/{collection}/dataStores/{data_store_id}/conversations/{conversation_id}

    Returns:
        NULL

    Raises:

    """
    client = discoveryengine.ConversationalSearchServiceClient()
    request = discoveryengine.DeleteConversationRequest(
        name=name,
    )
    client.delete_conversation(request=request)


def get_conversation(name):
    """Get a conversation

    Args:
        name (required): projects/{project_number}/locations/{location_id}/collections/{collection}/dataStores/{data_store_id}/conversations/{conversation_id}

    Returns:
        Conversation

    Raises:

    """
    client = discoveryengine.ConversationalSearchServiceClient()
    request = discoveryengine.GetConversationRequest(
        name=name,
    )
    response = client.get_conversation(request=request)
    return response

# 'list_conversations': ('parent', 'page_size', 'page_token', 'filter', 'order_by', )


def list_conversations(parent_value):
    """List all conversations

    Args:
        parent (required): projects/{project_number}/locations/{location_id}/collections/{collection}/dataStores/{data_store_id}
        page_size: Default 50, Max 1000.
        page_token: Page token from previous page response
        filter: user_pseudo_id, state. Example: "user_pseudo_id = some_id".
        order_by:  update_time, create_time, conversation_name. Example: "update_time desc" "create_time".

    Returns:
        ListConversationsResponse{conversations, next_page_token}

    Raises:

    """
    client = discoveryengine.ConversationalSearchServiceClient()
    request = discoveryengine.ListConversationsRequest(
        parent=parent_value,
        # page_size=50,
        # page_token="",
        # filter="",
        # order_by="create_time asc", # update_time desc, create_time, conversation_name
    )
    page_result = client.list_conversations(request=request)

    response = []
    for result in page_result:
        response.append(result)
    print("list response:", result)
    return response


def format_conversation_list(conversation):
    """Format conversation list

    Args:
        conversation_list_response (required): response from list_conversation

    Returns:

    Raises:

    """
    message_dict = []
    current_message = {}
    for message in conversation.messages:
        if message.user_input:
            current_message['input'] = message.user_input.input
        elif message.reply:
            current_message['reply'] = message.reply.reply
        if 'input' in current_message and 'reply' in current_message:
            message_dict.append(current_message.copy())
            current_message.clear()

    print("message_dict----------------\n", message_dict)
#   conversation_dict = {
#     'name': conversation.name,
#     'state': conversation.state.value,
#     'user_pseudo_id': conversation.user_pseudo_id,
#     'messages': message_dict,
#     'start_time': conversation.start_time.rfc3339() if conversation.start_time else None, # RFC3339 string,
#     'end_time': conversation.end_time.rfc3339() if conversation.end_time else None # RFC3339 string,
#   }
#   print("conversation_dict", conversation_dict)
    return message_dict


def update_conversation(conversation, new_state=None, new_user_pseudo_id=None):
    """Update a conversation

    Args:
        conversation (required): Conversation
        update_mask: update user_pseudo_id or state. If unset, updates all fields of the convo.

    Returns:
        Conversation with updated fields.

    Raises:

    """
    client = discoveryengine.ConversationalSearchServiceClient()

    if new_state:
        conversation.state = new_state  # IN_PROGRESS, COMPLETED
    if new_user_pseudo_id:
        conversation.user_pseudo_id = new_user_pseudo_id  # IN_PROGRESS, COMPLETED

    request = discoveryengine.UpdateConversationRequest(
        conversation=conversation,
        # update_mask=update_mask # google.protobuf.field_mask_pb2.FieldMask:
    )

    response = client.update_conversation(request=request)
    return response


def converse_conversation(name, user_input):
    """Converse in a conversation

    Args:
        name (required): projects/{project_number}/locations/{location_id}/collections/{collection}/dataStores/{data_store_id}/conversations/{conversation_id}, set conversation_id = "-" for auto-session
        query (required): 
        {
            'input' (required): user_input,
            'context' : {
                'context_documents' : [""],
                'active_document' : "",
            }
        }
        serving_config: If not set, default serving_config will be used
        conversation: Used by auto session only (auto session creates new conversation)
        safe_search: Whether to turn on safe search

    Returns:
        ConverseConversationResponse = {reply, conversation, search_results}

    Raises:

    """
    client = discoveryengine.ConversationalSearchServiceClient()
    request = discoveryengine.ConverseConversationRequest(
        name=name,
        query={
            'input': user_input,
            # 'context' : {
            #     'context_documents' : [""],
            #     'active_document' : "",
            # }
        },
        # serving_config="projects/{project_number}/locations/{location_id}/collections/{collection}/dataStores/{data_store_id}/servingConfigs/{serving_config_id}",
        # conversation=conversation, # google.cloud.discoveryengine_v1beta.types.Conversation
        # safe_search=False, # bool
        # summary_spec={
        #     'summary_result_count' : 5,
        #     'include_citations': True,
        # }
    )
    response = client.converse_conversation(request=request)
    return format_conversation_response(response)


def format_conversation_response(response):
    """Format conversation response

    Args:
        conversation_response (required): response from a converse conversation

    Returns:
        List with first result as a dict with reply, conversation, numOfResults, results.
        Subsequent elements in the list, list[1:], each represents 1 result.

    Raises:

    """
    formatted_results = []
    reply = response.reply.reply
#   references = response.reply.references
    conversation = response.conversation
    results = [result for result in response.search_results]
    numOfResults = len(results)

    message_dict = []
    current_message = {}
    for message in conversation.messages:
        if message.user_input:
            current_message['input'] = message.user_input.input
        elif message.reply:
            current_message['reply'] = message.reply.reply
        if 'input' in current_message and 'reply' in current_message:
            message_dict.append(current_message.copy())
            current_message.clear()

    conversation_dict = {
        'name': conversation.name,
        'state': conversation.state.value,
        'user_pseudo_id': conversation.user_pseudo_id,
        'messages': message_dict,
        # RFC3339 string,
        'start_time': conversation.start_time.rfc3339() if conversation.start_time else None,
        # RFC3339 string,
        'end_time': conversation.end_time.rfc3339() if conversation.end_time else None
    }

    some_results = {
        "reply": reply,
        # "references": references,
        "numOfResults": numOfResults,
        "conversation": conversation_dict,
    }
    formatted_results.append(some_results)

    for result in results:
        data = MessageToDict(result.document._pb)
        formatted_result = {}
        formatted_result['id'] = data.get('id', {})
        formatted_result['name'] = data.get('name', {})
        formatted_result['filter_category'] = data.get(
            'structData', {}).get('category', {})
        formatted_result['filter_id'] = data.get(
            'structData', {}).get('id', {})
        formatted_result['filter_name'] = data.get(
            'structData', {}).get('name', {})
        formatted_result['filter_tenant'] = data.get(
            'structData', {}).get('tenant', {})
        formatted_result['filter_summary_brief'] = data.get(
            'structData', {}).get('summary_brief', {})
        formatted_result['filter_summary_comprehensive'] = data.get(
            'structData', {}).get('summary_comprehensive', {})
        formatted_result['filter_num_pages'] = data.get(
            'structData', {}).get('num_pages', {})
        formatted_result['filter_created_time'] = data.get(
            'structData', {}).get('created_time', {})

        formatted_result['snippets'] = [d.get('snippet') for d in data.get(
            'derivedStructData', {}).get('snippets', []) if d.get('snippet') is not None]
        formatted_result['uri_link'] = data.get(
            'derivedStructData', {}).get('link', {})
        formatted_result['extractive_answers_content'] = [d.get('content') for d in data.get(
            'derivedStructData', {}).get('extractive_answers', []) if d.get('content') is not None]
        formatted_result['extractive_answers_pageNumber'] = [d.get('pageNumber') for d in data.get(
            'derivedStructData', {}).get('extractive_answers', []) if d.get('pageNumber') is not None]
        formatted_result['extractive_segments'] = [d.get('content') for d in data.get(
            'derivedStructData', {}).get('extractive_segments', []) if d.get('content') is not None]

        formatted_results.append(formatted_result)

    return formatted_results


def format_conversation_list(conversation):
    """Format conversation list

    Args:
        conversation_list_response (required): response from list_conversation

    Returns:

    Raises:

    """
    message_dict = []
    current_message = {}
    for message in conversation.messages:
        if message.user_input:
            current_message['input'] = message.user_input.input
        elif message.reply:
            current_message['reply'] = message.reply.reply
        if 'input' in current_message and 'reply' in current_message:
            message_dict.append(current_message.copy())
            current_message.clear()

    print("message_dict", message_dict)
    conversation_dict = {
        'name': conversation.name,
        'state': conversation.state.value,
        'user_pseudo_id': conversation.user_pseudo_id,
        'messages': message_dict,
        # RFC3339 string,
        'start_time': conversation.start_time.rfc3339() if conversation.start_time else None,
        # RFC3339 string,
        'end_time': conversation.end_time.rfc3339() if conversation.end_time else None
    }
    print("conversation_dict", conversation_dict)
    return conversation_dict
