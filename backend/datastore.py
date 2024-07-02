from __future__ import annotations
import time
from typing import List, Optional
from google.cloud import discoveryengine
from google.api_core import operations_v1, grpc_helpers
from google.longrunning import operations_pb2
from google.protobuf.json_format import MessageToDict
import json
""" Import into ES
    https://cloud.google.com/generative-ai-app-builder/docs/samples/genappbuilder-import-documents
"""


def import_documents(
    project_id: str,
    location: str,
    search_engine_id: str,
    gcs_uri: str | None = None,
    bigquery_dataset: str | None = None,
    bigquery_table: str | None = None,
) -> str:

    client = discoveryengine.DocumentServiceClient()

    # The full resource name of the search engine branch.
    # e.g. projects/{project}/locations/{location}/dataStores/{data_store}/branches/{branch}
    parent = client.branch_path(
        project=project_id,
        location=location,
        data_store=search_engine_id,
        branch="default_branch",
    )

    if gcs_uri:
        request = discoveryengine.ImportDocumentsRequest(
            parent=parent,
            gcs_source=discoveryengine.GcsSource(
                input_uris=[gcs_uri],
                # data_schema="custom"
            ),
            # auto_generate_ids = True,
            # Options: `FULL`, `INCREMENTAL`
            reconciliation_mode=discoveryengine.ImportDocumentsRequest.ReconciliationMode.INCREMENTAL,
        )
    else:
        request = discoveryengine.ImportDocumentsRequest(
            parent=parent,
            bigquery_source=discoveryengine.BigQuerySource(
                project_id=project_id,
                dataset_id=bigquery_dataset,
                table_id=bigquery_table,
                data_schema="custom",
            ),
            # Options: `FULL`, `INCREMENTAL`
            reconciliation_mode=discoveryengine.ImportDocumentsRequest.ReconciliationMode.INCREMENTAL,
        )

    # Make the request
    operation = client.import_documents(request=request)

    print(f"Waiting for operation to complete: {operation.operation.name}")
    response = operation.result()

    # Once the operation is complete, get info`1    zre23qwsaZrmation from operation metadata
    metadata = discoveryengine.ImportDocumentsMetadata(
        operation.metadata)

    # Handle the response
    print("response: ", response)
    print("metadata: ", metadata)

    # Check failure count
    if metadata.failure_count > 0:
        # Handle failure
        error_samples = response.error_samples
        error_message = error_samples[0].message if error_samples else "Unknown error"
        print(f"Import failed. Error message: {error_message}")
        return 500

    # Check success count
    if metadata.success_count > 0:
        # Handle success
        print("Import succeeded")
        return 200

    # No failures or successes detected
    print("Import result unknown")

    return "If you are seeing this, something is very wrong. Check dataengine.py"


def list_documents(PROJECT_ID: str, location: str, engine_id: str, rate_limit: int = 1):
    """Gets a list of docs in a datastore."""
    client = discoveryengine.DocumentServiceClient()

    request = discoveryengine.ListDocumentsRequest(
        parent=f'''projects/{PROJECT_ID}/locations/{
            location}/collections/default_collection/dataStores/{engine_id}/branches/0''',
        page_size=1000
    )

    res = client.list_documents(request=request)
    # setup the list with the first batch of docs
    docs = res.documents
    # loop through the rest of the pages
    while res.next_page_token:
        # implement a rate_limit to prevent quota exhaustion
        time.sleep(rate_limit)

        request = discoveryengine.ListDocumentsRequest(
            parent=f'''projects/{PROJECT_ID}/locations/{
                location}/collections/default_collection/dataStores/{engine_id}/branches/0''',
            page_size=1000,
            page_token=res.next_page_token
        )

        res = client.list_documents(request=request)
        docs.extend(res.documents)
    return docs


def list_details(docs):
    results = []
    for doc in docs:
        data = MessageToDict(doc._pb)
        # get title inside the jsonData
        result = {
            "id": doc.id,
            "uri": doc.content.uri,
            "filter_name": data.get('structData', {}).get('title', {}),
            "filter_category": data.get('structData', {}).get('category', {}),
            "filter_tenant": data.get('structData', {}).get('tenant', {}),
            "filter_summary_brief": data.get('structData', {}).get('summary', {}),
            "filter_summary_comprehensive": data.get('structData', {}).get('summary_comprehensive', {}),
            "filter_num_pages": data.get('structData', {}).get('num_pages', {}),
            "filter_created_time": data.get('structData', {}).get('created_time', {}),
        }
        results.append(result)
    return results


def list_indexed_urls(
        PROJECT_ID: str,
        location: str,
        engine_id: str,
        docs: Optional[List[discoveryengine.Document]] = None):
    """Get the list of docs in datastore, then parse to only urls."""
    if not docs:
        docs = list_documents(PROJECT_ID, location, engine_id)
    # get the list of urls
    urls = [doc.content.uri for doc in docs]

    return urls


def search_doc_id(
    PROJECT_ID: str,
    LOCATION: str,
    doc_id: str,
    engine_id: str,
    docs: Optional[List[discoveryengine.Document]] = None
):
    """Searches a doc_id in a list of docs."""
    if not docs:
        docs = list_documents(PROJECT_ID, LOCATION, engine_id)

    doc_found = False
    for doc in docs:
        if doc.parent_document_id == doc_id:
            doc_found = True
            print(doc)

    if not doc_found:
        print(f"Document not found for provided Doc ID: `{doc_id}`")


def get_operations_status(operation_id: str):
    """Get the status of an import operation for Discovery Engine."""
    host = "discoveryengine.googleapis.com"
    channel = grpc_helpers.create_channel(host)
    client = operations_v1.OperationsClient(channel)

    response = client.get_operation(operation_id)

    return response


def sample_purge_documents(parent_value, filter_value):
    """PURGE DATASTORE"""
    client = discoveryengine.DocumentServiceClient()

    request = discoveryengine.PurgeDocumentsRequest(
        parent=parent_value,
        filter=filter_value,
        force=True
    )
    # Make the request
    operation = client.purge_documents(request=request)

    print("Waiting for operation to complete...")

    response = operation.result()

    print(response)
    return


def sample_get_document(name_value):
    """Get single Document"""
    client = discoveryengine.DocumentServiceClient()
    try:
        request = discoveryengine.GetDocumentRequest(name=name_value)
        response = client.get_document(request=request)
        data = MessageToDict(response._pb)
        results = {
            "title": response.name,
            "id": response.id,
            "uri": response.content.uri,
            "filter_name": data.get('structData', {}).get('name', {}),
            "filter_category": data.get('structData', {}).get('category', {}),
            "filter_tenant": data.get('structData', {}).get('tenant', {}),
        }
        return results, 200
    except Exception as e:
        return e, 404


def sample_delete_document(name_value):
    """Delete single Document"""
    client = discoveryengine.DocumentServiceClient()
    request = discoveryengine.DeleteDocumentRequest(
        name=name_value,
    )
    operation = client.delete_document(request=request)
    # print(operation)
    return operation


def list_tenants(docs):
    """ Get tenant list """
    tenants = []
    for doc in docs:
        data = MessageToDict(doc._pb)
        tenant = data.get('structData', {}).get('tenant', {})
        tenants.append(tenant)
        tenants = list(dict.fromkeys(tenants))
    return tenants


def list_categories(docs):
    """ Get tenant list """
    categories = []
    for doc in docs:
        data = MessageToDict(doc._pb)
        category = data.get('structData', {}).get('category', {})
        categories.append(category)
        categories = list(dict.fromkeys(categories))
    return categories
