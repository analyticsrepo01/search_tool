from __future__ import annotations
from google.cloud import discoveryengine_v1beta as discoveryengine

""" Import into ES
    https://cloud.google.com/generative-ai-app-builder/docs/samples/genappbuilder-import-documents
"""
def import_documents_sample(
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

    # Once the operation is complete, get information from operation metadata
    metadata = discoveryengine.ImportDocumentsMetadata(operation.metadata)

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
