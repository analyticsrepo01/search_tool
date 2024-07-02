from google.cloud import discoveryengine_v1beta as discoveryengine
from google.api_core.exceptions import GoogleAPICallError
from google.protobuf.json_format import MessageToDict

class ConversationalSearchClient:
    def __init__(self, parent_value):
        self.client = discoveryengine.ConversationalSearchServiceClient()
        self.parent_value = parent_value
        self.conversations = None

    def create_conversation(self, conversation):
        """
        Creates a new conversation
        Args:
            parent_value (required): projects/{project_number}/locations/{location_id}/collections/{collection}/dataStores/{data_store_id}
            conversation (required): {'user_pseudo_id': user_id}
        Returns:
            google.cloud.discoveryengine_v1beta.types.Conversation
        """
        try:
            request = discoveryengine.CreateConversationRequest(
            parent = self.parent_value, # required
            conversation=conversation, # required
            # retry=, # google.api_core.retry.Retry
            # timeout=, # float
            # metadata=, #(Sequence[Tuple[str, str]])
            )
            response = self.client.create_conversation(request=request)
            return response
        except GoogleAPICallError as e:
            print(f"Google API Call Error: {e}")
    
    def list_conversations(self):
        """
        List all conversations
        Args:
            parent (required): projects/{project_number}/locations/{location_id}/collections/{collection}/dataStores/{data_store_id}
            page_size: Default 50, Max 1000.
            page_token: Page token from previous page response
            filter: user_pseudo_id, state. Example: "user_pseudo_id = some_id".
            order_by:  update_time, create_time, conversation_name. Example: "update_time desc" "create_time".
        Returns:
            ListConversationsResponse{conversations, next_page_token}
        """
        request = discoveryengine.ListConversationsRequest(
            parent=self.parent_value,
            page_size=1000,
            # page_token="",
            # filter="", 
            # order_by="create_time asc", # update_time desc, create_time, conversation_name
        )
        page_result = self.client.list_conversations(request=request)

        response = []
        for result in page_result:
            response.append(result)
        
        # Set fomatted output
        self.conversations = self.__format_conversations(response)

        return response
    
    def __format_conversations(self, conversations):
        convos = []
        for conversation in conversations:
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
                'start_time': conversation.start_time.rfc3339() if conversation.start_time else None, # RFC3339 string,
                'end_time': conversation.end_time.rfc3339() if conversation.end_time else None # RFC3339 string,
            }
            convos.append(conversation_dict)
        return convos

class ConversationService:
    """
    Get, Update, Delete, Converse
    """
    def __init__(self, client, conversation_id=None, conversation_name=None):
        if conversation_id is None and conversation_name is None:
            raise ValueError("Please specify either conversation_id or conversation_name")
        self.client = client
        self.name = f'{client.parent_value}/conversations/{conversation_id}' if conversation_id is not None else conversation_name 
        self.conversation = None
    
    def __format_conversation(self, conversation):
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
            'start_time': conversation.start_time.rfc3339() if conversation.start_time else None, # RFC3339 string,
            'end_time': conversation.end_time.rfc3339() if conversation.end_time else None # RFC3339 string,
        }
        return conversation_dict
    
    def get_conversation(self):
        """
        Get a conversation
        Args:
            name (required): projects/{project_number}/locations/{location_id}/collections/{collection}/dataStores/{data_store_id}/conversations/{conversation_id}
        Returns:
            Conversation
        """
        request = discoveryengine.GetConversationRequest(
            name=self.name,
        )
        response = self.client.get_conversation(request=request)
        self.conversation = self.__format_conversation(response)
        return response
    
    def update_conversation(self, new_state=None, new_user_pseudo_id=None):
        """
        Update a conversation
        Args:
            conversation (required): Conversation
            update_mask: update user_pseudo_id or state. If unset, updates all fields of the convo.
        Returns:
            Conversation with updated fields.
        """
        conversation = self.get_conversation()
        if new_state:
            conversation.state = new_state # IN_PROGRESS, COMPLETED
        if new_user_pseudo_id:
            conversation.user_pseudo_id = new_user_pseudo_id # IN_PROGRESS, COMPLETED
        request = discoveryengine.UpdateConversationRequest(
            conversation=conversation,
            # update_mask=update_mask # google.protobuf.field_mask_pb2.FieldMask: 
        )
        response = self.client.update_conversation(request=request)
        return response
    
    def delete_conversation(self):
        """
        Delete a conversation
        Args:
            name (required): projects/{project_number}/locations/{location_id}/collections/{collection}/dataStores/{data_store_id}/conversations/{conversation_id}
        Returns:
            NULL
        """
        request = discoveryengine.DeleteConversationRequest(
            name=self.name,
        )
        self.client.delete_conversation(request=request)
        return
    
    def converse_conversation(self, user_input):
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
            ConverseConversationResponse = {reply, conversation, related_questions, search_results}
        """
        request = discoveryengine.ConverseConversationRequest(
            name=self.name,
            query={
                'input' : user_input,
                # 'context' : {
                #     'context_documents' : [""],
                #     'active_document' : "",
                # }
            },
            # serving_config="projects/{project_number}/locations/{location_id}/collections/{collection}/dataStores/{data_store_id}/servingConfigs/{serving_config_id}", 
            # conversation=conversation, # google.cloud.discoveryengine_v1beta.types.Conversation
            # safe_search=False # bool
        )
        response = self.client.converse_conversation(request=request)
        return self.__format_converse_conversation_response(response)

    def __format_converse_conversation_response(response):
        """
        Format conversation response (private method)
        Args:
            conversation_response (required): response from a converse conversation
        Returns:
            List with first result as a dict with reply, conversation, numOfResults, results.
            Subsequent elements in the list, list[1:], each represents 1 result.
            
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
            'start_time': conversation.start_time.rfc3339() if conversation.start_time else None, # RFC3339 string,
            'end_time': conversation.end_time.rfc3339() if conversation.end_time else None # RFC3339 string,
        }

        some_results = {
            "reply": reply,
            # "references": references,
            "numOfResults" : numOfResults,
            "conversation" : conversation_dict,
        }
        formatted_results.append(some_results)

        for result in results:
            data = MessageToDict(result.document._pb)
            formatted_result = {}
            formatted_result['id'] = data.get('id', {})
            formatted_result['name'] = data.get('name', {})
            formatted_result['filter_category'] = data.get('structData', {}).get('category',{})
            formatted_result['filter_id'] = data.get('structData', {}).get('id',{})
            formatted_result['filter_name'] = data.get('structData', {}).get('name',{})
            formatted_result['filter_tenant'] = data.get('structData', {}).get('tenant',{})
            formatted_result['created_datetime'] = data.get('structData', {}).get('created_datetime',{})

            formatted_result['snippets'] = [d.get('snippet') for d in data.get('derivedStructData', {}).get('snippets', []) if d.get('snippet') is not None]
            formatted_result['uri_link'] = data.get('derivedStructData', {}).get('link',{})
            formatted_result['extractive_answers_content'] = [d.get('content') for d in data.get('derivedStructData', {}).get('extractive_answers', []) if d.get('content') is not None]
            formatted_result['extractive_answers_pageNumber'] = [d.get('pageNumber') for d in data.get('derivedStructData', {}).get('extractive_answers', []) if d.get('pageNumber') is not None]
            formatted_result['extractive_segments'] = [d.get('content') for d in data.get('derivedStructData', {}).get('extractive_segments', []) if d.get('content') is not None]

            formatted_results.append(formatted_result)

        return formatted_results


# if __name__ == "__main__":
#     import os

#     PROJECT_ID = os.environ.get('PROJECT_ID')
#     BUCKET_FOR_UPLOAD = os.environ.get('BUCKET_FOR_UPLOAD')
#     LOCATION = "global"
#     datastore_id = "cymbal-demo_1689658041171"

#     parent_value = f"projects/{PROJECT_ID}/locations/{LOCATION}/collections/default_collection/dataStores/{datastore_id}"
#     client = ConversationalSearchClient(parent_value)
#     conversation_id = "-"
#     conversation_name = f"projects/{PROJECT_ID}/locations/{LOCATION}/collections/default_collection/dataStores/{datastore_id}/conversations/-"
#     conversationService = ConversationService(client, conversation_id, conversation_name)

#     client.list_conversations()
#     print(client.conversations)
    