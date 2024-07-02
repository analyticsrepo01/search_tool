# gcloud auth login
# gcloud auth application-default set-quota-project <project_id>
from langchain_google_vertexai import VertexAI
import re
import os


def vertex_qa(
    llmModel,
    query,
    summary,
    checkedItems,
    searchResults,
    userInput,
    temperature,
    topK,
    topP
):

    print("llmModel: ", llmModel)
    print("query: ", query)
    print("summary: ", summary)
    print("checkedItems: ", checkedItems)
    # print("resultDetails: ", resultDetails)
    print("searchResults: ", searchResults)
    print("userInput: ", userInput)

    ######################################################################################################
    """ Snippet / Answer / Segment """
    snippet_pattern = r"\{\{snippet_(\d+)\}\}"
    answer_pattern = r"\{\{answer_(\d+)-(\d+)\}\}"
    segment_pattern = r"\{\{segment_(\d+)-(\d+)\}\}"
    doc_pattern = r"\{\{docName_(\d+)\}\}"

    # Find all occurrences of each item in the userInput
    snippets = re.findall(snippet_pattern, userInput)
    answers = re.findall(answer_pattern, userInput)
    segments = re.findall(segment_pattern, userInput)
    docs = re.findall(doc_pattern, userInput)

    # Create a dictionary to store the key-value pairs
    result_dict = {}

    # Process snippet items and store in the result_dict
    for snippet_index in snippets:
        snippet_index = int(snippet_index)
        if snippet_index <= len(searchResults):
            # print("Snippet:",snippet_index)
            value = searchResults[snippet_index - 1]["snippets"][0]
        else:
            value = ""
        key = f"{{snippet_{snippet_index}}}"
        result_dict[key] = value

    # Process answer items and store in the result_dict
    for answer_index_1, answer_index_2 in answers:
        answer_index_1, answer_index_2 = int(
            answer_index_1), int(answer_index_2)
        if answer_index_1 <= len(searchResults) and answer_index_2 <= len(searchResults[answer_index_1 - 1]["extractive_answers_content"]):
            # print("Answer:", answer_index_1, answer_index_2)
            value = searchResults[answer_index_1 -
                                  1]["extractive_answers_content"][answer_index_2 - 1]
        else:
            value = ""
        key = f"{{answer_{answer_index_1}-{answer_index_2}}}"
        result_dict[key] = value

    # Process answer items and store in the result_dict
    for segment_index_1, segment_index_2 in segments:
        segment_index_1, segment_index_2 = int(
            segment_index_1), int(segment_index_2)
        if segment_index_1 <= len(searchResults) and segment_index_2 <= len(searchResults[segment_index_1 - 1]["extractive_segments"]):
            # print("Segment:", segment_index_1, segment_index_2)
            value = searchResults[segment_index_1 -
                                  1]["extractive_segments"][segment_index_2 - 1]
        else:
            value = ""
        key = f"{{segment_{segment_index_1}-{segment_index_2}}}"
        result_dict[key] = value

    # Process doc items and store in the result_dict
    for doc_index in docs:
        doc_index = int(doc_index)
        if doc_index <= len(searchResults):
            # print("Doc:", doc_index)
            value = searchResults[doc_index - 1]["filter_name"]
        else:
            value = ""
        key = f"{{docName_{doc_index}}}"
        result_dict[key] = value

    # Process other {{}} and store in the result_dict
    result_dict["{{query}}"] = query
    result_dict["{{summary}}"] = summary
    result_dict["{{checked_snippets}}"] = ','.join(
        str(item['snippets']) for item in checkedItems)
    result_dict["{{checked_answers}}"] = ','.join(
        str(item['extractive_answers_content']) for item in checkedItems)
    result_dict["{{checked_segments}}"] = ','.join(
        str(item['extractive_segments']) for item in checkedItems)

    ######################################################################################################

    """ Vertex AI """

    # https://cloud.google.com/vertex-ai/docs/generative-ai/learn/models#foundation_models
    max_output_tokens = 1024  # text-bison
    if llmModel == "gemini-pro":
        max_output_tokens = 8192  # max output for text-bison-32k

    temperature = 0.0 if temperature < 0.0 else temperature
    temperature = 1.0 if temperature > 1.0 else temperature
    topK = 1 if topK < 1 else topK
    topK = 40 if topK > 40 else topK
    topP = 0.0 if topP < 0.0 else topP
    topP = 1.0 if topP > 1.0 else topP

    llm = VertexAI(
        model_name="gemini-1.0-pro-002",
        max_output_tokens=max_output_tokens,
        temperature=temperature,
        top_k=topK,
        top_p=topP,
        verbose=True,
    )

    # Replace each {x} with its actual value
    for i in result_dict:
        userInput = userInput.replace(i, result_dict[i])

    # prompt = PromptTemplate(
    #   input_variables=["knowledgeList"],
    #   template=userInput,
    # )

    result = llm(userInput)

    # print("Final Prompt:\n", userInput)
    # print("-----------")
    print("LLM Output:\n", result)

    return result
