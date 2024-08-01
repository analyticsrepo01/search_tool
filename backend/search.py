from google.cloud import discoveryengine_v1beta as discoveryengine
from google.cloud import resourcemanager_v3
# from google.cloud import discoveryengine_v1alpha as discoveryengine
from google.protobuf.json_format import MessageToDict
from typing import List, Dict, Optional
import os
from google.auth import default
import requests
import google.auth
import google.auth.transport.requests
  


def search_unstructured(PROJECT_ID, data):
    engine_id = data.get('engine_id')
    page_token = data.get('page_token')
    query = data.get('search_query')
    page_size = data.get('page_size')
    summary_result_count = data.get('summary_result_count')
    max_snippet_count = data.get('max_snippet_count')
    max_extractive_answer_count = data.get('max_extractive_answer_count')
    max_extractive_segment_count = data.get('max_extractive_segment_count')
    filter_id = data.get('filter_id')
    # filter_facets = data.get('filter_facets')
    filter_tenant = data.get('filter_tenant')

    return search(
        PROJECT_ID,
        engine_id,
        page_token,
        query,
        page_size,
        summary_result_count,
        max_snippet_count,
        max_extractive_answer_count,
        max_extractive_segment_count,
        filter_id,
        # filter_facets,
        filter_tenant)

def get_project_number(project_id) -> Optional[str]:
    """Given a project id, return the project number"""
    # Create a client
    client = resourcemanager_v3.ProjectsClient()
    # Initialize request argument(s)
    request = resourcemanager_v3.SearchProjectsRequest(query=f"id:{project_id}")
    # Make the request
    page_result = client.search_projects(request=request)
    # Handle the response
    for response in page_result:
        if response.project_id == project_id:
            project = response.name
            return project.replace('projects/', '')


def search(
    project_id,
    search_engine_id,
    page_token: str,
    search_query: str,
    page_size: int,
    summary_result_count: int,
    max_snippet_count: int,
    max_extractive_answer_count: int,
    max_extractive_segment_count: int,
    filter_id=List[str],
    # filter_facets=Dict[str, List[str]],
    filter_tenant=str,

    # facets=["category", "tenant"]
):

    # Create a client
    # Modify the directory/path where you have the service account json file is stored
    # os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = "../key.json"
    client = discoveryengine.SearchServiceClient()

    # Argolis Parameters
    project_id = project_id
    search_engine_id = search_engine_id
    location = "global"
    serving_config_id = "default_config"
    search_query = search_query

    # Config Path
    serving_config = client.serving_config_path(
        project=project_id,
        location=location,
        data_store=search_engine_id,
        serving_config=serving_config_id,
    )

    # Content Search Spec
    # https://cloud.google.com/generative-ai-app-builder/docs/snippets#segment-options
    content_search_spec = {
        'snippet_spec': {'return_snippet': True if max_snippet_count == 1 else False},
        'extractive_content_spec': {
            'max_extractive_answer_count': max_extractive_answer_count,
            'max_extractive_segment_count': max_extractive_segment_count,
            'return_extractive_segment_score': True,
            # 'num_previous_segments': 3, # integer
            # 'num_next_segments': 3 # integer
        },
        'summary_spec': {
            'summary_result_count': summary_result_count,
            'include_citations': True,
            # 'ignore_adversarial_query': False,
            # 'ignore_non_summary_seeking_query': False,
            # 'language_code': 'id-ID' # 'th-TH' Use language tags defined by [BCP47][https://www.rfc-editor.org/rfc/bcp/bcp47.txt].
            # 'model_prompt_spec': {
            #     'preamble': 'translate to chinese'
            # }
        },
    }

    # Facets
    # facets=[]
    # facet_specs = []  # if empty, no facets are returned (max=100)
    # for facet in facets:
    #     facet_spec = {
    #         "facet_key": {
    #             "key": facet,
    #             # "intervals": [], ## list of discoveryengine.types.Interval
    #             # "restricted_values": [""], ## only get facet for these values
    #             # "prefixes": [""],
    #             # "contains": [""],
    #             # "case_insensitive": True,
    #             # "order_by": "count desc" ## order by SearchResponse.Facet.values.count descending
    #             # "order_by": "values desc" ## order by SearchResponse.Facet.values.value descending
    #         },
    #         # Default=20, max facet values to be returned for this facet (max=300)
    #         "limit": 20,
    #         # "excluded_filter_keys": ["Anatomy"], ## MutableStr, list of keys to exclude when faceting (max 100 values)
    #         # "enable_dynamic_position": True, ## Position of this facets among other facets is automatically determined
    #         # enable_dynamic_position=False ## Position of this facet in the response will be the same as in the request, and it will be ranked before the facets with dynamic position enable
    #     }
    #     facet_specs.append(facet_spec)

    # filter_parts = []
    # if filter_facets:
    #     category_filters = filter_facets.get('category', [])
    #     if category_filters:
    #         category_filter_string = "category: ANY(\"" + \
    #             "\", \"".join(category_filters) + "\")"
    #         filter_parts.append(category_filter_string)
    #     tenant_filters = filter_facets.get('tenant', [])
    #     if tenant_filters:
    #         tenant_filter_string = "tenant: ANY(\"" + \
    #             "\", \"".join(tenant_filters) + "\")"
    #         filter_parts.append(tenant_filter_string)
    # if filter_tenant:
    #     filter_tenant_string = "tenant: ANY(\"" + filter_tenant + "\")"
    #     filter_parts.append(filter_tenant_string)
    # filter_string = " AND ".join(filter_parts)

    # print("~ Filter ID: ", filter_id)
    # print("~ Filter Facets: ", filter_facets)
    # filter_parts = []
    # if filter_id:
    #     filter_id_string = "id: ANY(\"" + "\", \"".join(filter_id) + "\")"
    #     filter_parts.append(filter_id_string)
    # if filter_facets:
    #     category_filters = filter_facets.get('category', [])
    #     if category_filters:
    #         category_filter_string = "category: ANY(\"" + \
    #             "\", \"".join(category_filters) + "\")"
    #         filter_parts.append(category_filter_string)
    #     tenant_filters = filter_facets.get('tenant', [])
    #     if tenant_filters:
    #         tenant_filter_string = "tenant: ANY(\"" + \
    #             "\", \"".join(tenant_filters) + "\")"
    #         filter_parts.append(tenant_filter_string)
    # if filter_tenant:
    #     filter_tenant_string = "tenant: ANY(\"" + filter_tenant + "\")"
    #     filter_parts.append(filter_tenant_string)
    # filter_string = " AND ".join(filter_parts)
    # print("~ Filter String: ",filter_string)

    # Request
    request = discoveryengine.SearchRequest(
        serving_config=serving_config,
        page_token=page_token,
        query=search_query,
        page_size=page_size,
        content_search_spec=content_search_spec,
        # facet_specs=facet_specs,
        # filter=filter_string,  # Use the corrected filter string here
    )

    print("\nProject ID:", project_id)
    
    project_number = get_project_number(project_id)
    
    print("\nProject Number:", project_number)
    
    # Define the API endpoint URL with placeholders
    search_url = f"https://discoveryengine.googleapis.com/v1alpha/projects/{project_number}/locations/global/collections/default_collection/engines/{search_engine_id}/servingConfigs/default_search:search"
    answer_url = f"https://discoveryengine.googleapis.com/v1alpha/projects/{project_number}/locations/global/collections/default_collection/engines/{search_engine_id}/servingConfigs/default_search:answer"

    query =  search_query
    search_payload = {
        "query": query,
        "pageSize": 10,
        "queryExpansionSpec": {"condition": "AUTO"},
        "spellCorrectionSpec": {"mode": "AUTO"},
        "contentSearchSpec": {
            "summarySpec": {
                "ignoreAdversarialQuery": True,
                "includeCitations": True,
                "summaryResultCount": 5,
                "modelSpec": {"version": "gemini-1.0-pro-002/answer_gen/v1"}
            },
            "snippetSpec": {"returnSnippet": True},
            "extractiveContentSpec": {"maxExtractiveAnswerCount": 1}
        }
    }


    creds, project = google.auth.default()

    auth_req = google.auth.transport.requests.Request()
    creds.refresh(auth_req)

    auth_token = creds.token
    print("Auth Token:", creds.token)

    # Set headers with authorization and content type
    headers = {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }

    # Send the POST request
    search_response = requests.post(search_url, headers=headers, json=search_payload)
    
    search_response_data = search_response.json()
    

    formatted_results = []
    print(search_response_data)
    results = search_response_data["results"]
    numOfResults = len(results)
    totalSize = search_response_data["totalSize"]
    attributionToken = search_response_data["attributionToken"]
    nextPageToken = search_response_data["nextPageToken"]
    summary = search_response_data["summary"]["summaryText"]

    # summary_skipped = response.summary.summary_skipped_reasons
    # summary_skipped_reasons = []
    # if summary_skipped:
    #     # https://cloud.google.com/python/docs/reference/discoveryengine/latest/google.cloud.discoveryengine_v1beta.types.SearchResponse.Summary.SummarySkippedReason
    #     SummarySkippedReason = {
    #         0: "SUMMARY_SKIPPED_REASON_UNSPECIFIED",
    #         1: "ADVERSARIAL_QUERY_IGNORED",
    #         2: "NON_SUMMARY_SEEKING_QUERY_IGNORED",
    #         3: "OUT_OF_DOMAIN_QUERY_IGNORED",
    #         4: "POTENTIAL_POLICY_VIOLATION",
    #         5: "LLM_ADDON_NOT_ENABLED"
    #     }
    #     for reason in summary_skipped:
    #         summary_skipped_reasons.append(SummarySkippedReason[reason])
    # safety_attributes = response.summary.safety_attributes
    # safety_attributes_categories = [
    #     cat for cat in safety_attributes.categories]
    # safety_attributes_scores = [score for score in safety_attributes.scores]

    # corrected_query = response.corrected_query
    # facets = response.facets
    # facetDict = {}
    # for facet in facets:
    #     key = facet.key
    #     values_dict = {value.value: value.count for value in facet.values}
    #     facetDict[key] = values_dict

    some_results = {
        "numOfResults": numOfResults,
        "totalSize": totalSize,
        "token": attributionToken,
        "nextPageToken": nextPageToken,
        "summary": summary
        # "summary_skipped_reasons": summary_skipped_reasons,
        # "safety_attributes_categories": safety_attributes_categories,
        # "safety_attributes_scores": safety_attributes_scores,
        # "corrected_query": corrected_query,
        # "facets": facetDict
    }

    formatted_results.append(some_results)

    for result in results:
        # data = MessageToDict(result.document._pb)

        data = result

        formatted_result = {}
        formatted_result['id'] = data.get('document',{}).get('id', {})
        formatted_result['name'] = data.get('document',{}).get('name', {})
        formatted_result['filter_category'] = data.get('document',{}).get(
            'structData', {}).get('category', {})
        formatted_result['filter_id'] = data.get('document',{}).get(
            'structData', {}).get('id', {})
        formatted_result['filter_name'] = data.get('document',{}).get(
            'structData', {}).get('name', {})
        formatted_result['filter_tenant'] = data.get('document',{}).get(
            'structData', {}).get('tenant', {})
        # formatted_result['filter_summary_brief'] = data.get('document',{}).get(
        #     'structData', {}).get('summary_brief', {})
        # formatted_result['filter_summary_comprehensive'] = data.get(
        #     'structData', {}).get('summary_comprehensive', {})
        # formatted_result['filter_num_pages'] = data.get(
        #     'structData', {}).get('num_pages', {})
        # formatted_result['filter_created_time'] = data.get(
        #     'structData', {}).get('created_time', {})

        formatted_result['snippets'] = [d.get('snippet') for d in data.get('document',{}).get(
            'derivedStructData', {}).get('snippets', []) if d.get('snippet') is not None]
        formatted_result['uri_link'] = data.get('document',{}).get(
            'derivedStructData', {}).get('link', {})
        formatted_result['extractive_answers_content'] = [d.get('content') for d in data.get('document',{}).get(
            'derivedStructData', {}).get('extractive_answers', []) if d.get('content') is not None]
        formatted_result['extractive_answers_pageNumber'] = [d.get('pageNumber') for d in data.get('document',{}).get(
            'derivedStructData', {}).get('extractive_answers', []) if d.get('pageNumber') is not None]
        formatted_result['extractive_segments'] = [d.get('content') for d in data.get('document',{}).get(
            'derivedStructData', {}).get('extractive_segments', []) if d.get('content') is not None]
        formatted_result['extractive_segments_pageNumber'] = [d.get('pageNumber') for d in data.get(
            'derivedStructData', {}).get('extractive_segments', []) if d.get('pageNumber') is not None]
        
        formatted_results.append(formatted_result)

    # print("~ Formatted Results:\n",formatted_results)
    return formatted_results
