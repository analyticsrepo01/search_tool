import csv
from io import TextIOWrapper
import re
import json
import uuid
import os
from datetime import datetime, timedelta
import base64
import concurrent.futures
from google.oauth2 import service_account
from google.cloud import secretmanager
from google.cloud import storage
from datastore import import_documents
from dataengine import import_documents_sample
from docai import batch_process_documents, process_document

PROJECT_ID = os.environ.get('PROJECT_ID')
BUCKET_FOR_UPLOAD = os.environ.get('BUCKET_FOR_UPLOAD')
LOCATION = "global"

PROCESSOR_ID = os.environ.get('PROCESSOR_ID')
PROCESSOR_VERSION_BRIEF = os.environ.get('PROCESSOR_VERSION_BRIEF')
PROCESSOR_VERSION_COMPREHENSIVE = os.environ.get(
    'PROCESSOR_VERSION_COMPREHENSIVE')
GCS_OUTPUT_URI = os.environ.get('BUCKET_FOR_OUTPUT')


def getpdf(gcslink):
    """/read: Gets byte content from Storage Client """

    print("~ gcslink: ", gcslink)

    link_without_prefix = gcslink[5:]
    split_index = link_without_prefix.index("/")
    bucket_name = link_without_prefix[:split_index]
    blob_name = link_without_prefix[split_index+1:]

    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)

    blob_url = blob.public_url
    print("~ blob_url: ", blob_url)

    contents = blob.download_as_string()

    # Encode the binary content as base64
    base64_pdf = base64.b64encode(contents).decode()

    return base64_pdf


def uploadpdf(PROJECT_ID, BUCKET_NAME, file, formData):
    """ /upload: Write a PDF file to GCS bucket """
    print("~ Uploading file to GCS...")
    mimeType = formData.get("mimeType")
    print("~ MimeType = ", mimeType)
    numPages = formData.get("docPages")
    numPages = int(numPages)
    originalFileName = formData.get("originalFileName")
    fileName = clean_filename(originalFileName)
    ext = mimeType.split('/')[-1] if mimeType != "text/plain" else "txt"
    blob_name = f"docs/{fileName}.{ext}"
    print("~ blob_name:", blob_name)
    storage_client = storage.Client()
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(blob_name)
    blob.upload_from_file(file, content_type=mimeType, timeout=3600)
    gcsDocUrl = f"gs://{BUCKET_NAME}/{blob_name}"
    print(f"File uploaded to GCS: {gcsDocUrl}")

    print("~ Creating JSON...")
    metadata, errors = create_metadata_json(
        PROJECT_ID, formData, mimeType, gcsDocUrl, fileName, numPages)
    print("~ Metadata Created: ", metadata)
    print("~ Errors ", errors)

    print("~ Uploading JSON to GCS...")
    gcs_json_url = create_upload_json(BUCKET_NAME, metadata, fileName)
    print(f"~ JSON file uploaded to GCS: {gcs_json_url}")

    print("~ Upload to Search Engine Datastore...")
    import_documents(
        project_id=PROJECT_ID,
        location="global",
        search_engine_id=formData.get("engine_id"),
        gcs_uri=gcs_json_url,
    )
    print("~ Uploaded to ES!!!")
    return metadata, errors


def process_summary(project_id, processor_id, gcs_output_uri, processor_version_id, gcs_input_uri, input_mime_type, field_mask):
    try:
        # summary = batch_process_documents(
        #     project_id=project_id,
        #     location="us",
        #     processor_id=processor_id,
        #     gcs_output_uri=gcs_output_uri,
        #     processor_version_id=processor_version_id,
        #     gcs_input_uri=gcs_input_uri,
        #     input_mime_type=input_mime_type,
        #     field_mask=field_mask,
        # )
        # Normal Processor
        summary = process_document(
            project_id=project_id,
            location="us",
            file_path=gcs_input_uri,
            processor_id=processor_id
        )
        return summary
    except Exception as e:
        print(f"SUMMARY ({processor_version_id}) ERROR:", e)
        return ""


def create_metadata_json(PROJECT_ID, formData, mimeType, gcsDocUrl, fileName, numPages):
    """ Create Metadata for the doc """
    docTitle = formData.get("fileName")
    category = formData.get("category")
    tenant = formData.get("tenant")
    created_time = datetime.now().isoformat()  # ISO 8601

    # Create summary if numPages <= 250
    errors = ""
    summary_brief = ""
    summary_comprehensive = ""
    field_mask = "entities"
    if (formData["isSummarize"] == "true"):
        print("~ Generating Summaries...")
        # if numPages <= 250:
        #     with concurrent.futures.ThreadPoolExecutor() as executor:
        #         future_brief = executor.submit(
        #             process_summary, PROJECT_ID, PROCESSOR_ID, f"gs://{GCS_OUTPUT_URI}", PROCESSOR_VERSION_BRIEF, gcsDocUrl, mimeType, "entities"
        #         )
        #         future_comprehensive = executor.submit(
        #             process_summary, PROJECT_ID, PROCESSOR_ID, f"gs://{GCS_OUTPUT_URI}", PROCESSOR_VERSION_COMPREHENSIVE, gcsDocUrl, mimeType, "entities"
        #         )

        #         summary_brief = future_brief.result()
        #         summary_comprehensive = future_comprehensive.result()

        #         # Collect any errors from the futures
        #         if future_brief.exception():
        #             errors += str(future_brief.exception()) + " "
        #         if future_comprehensive.exception():
        #             errors += str(future_comprehensive.exception()) + " "

        try:
            # # Normal Processor
            # summary_brief = process_document(
            #     project_id=PROJECT_ID,
            #     location="us",
            #     file_path=f"gs://{GCS_OUTPUT_URI}",
            #     processor_id=PROCESSOR_ID
            # )

            summary_brief = batch_process_documents(
                project_id=PROJECT_ID,
                location="us",
                processor_id=PROCESSOR_ID,
                gcs_output_uri=f"gs://{GCS_OUTPUT_URI}",
                processor_version_id=PROCESSOR_VERSION_BRIEF,
                gcs_input_uri=gcsDocUrl,
                input_mime_type=mimeType,
                # gcs_input_prefix = gcs_input_prefix,
                field_mask=field_mask,
                timeout=120,
            )
            print(f"summary_brief: {summary_brief}")
        except Exception as e:
            print(f"Error (brief): {e}")

        if summary_brief != "":
            try:
                summary_comprehensive = batch_process_documents(
                    project_id=PROJECT_ID,
                    location="us",
                    processor_id=PROCESSOR_ID,
                    gcs_output_uri=f"gs://{GCS_OUTPUT_URI}",
                    processor_version_id=PROCESSOR_VERSION_COMPREHENSIVE,
                    gcs_input_uri=gcsDocUrl,
                    input_mime_type=mimeType,
                    # gcs_input_prefix = gcs_input_prefix,
                    field_mask=field_mask,
                    timeout=120,
                )
                print(f"summary_comprehensive: {summary_comprehensive}")
            except Exception as e:
                print(f"Error (comprehensive): {e}")

    metadata = {
        "id": str(uuid.uuid4()),
        "structData": {
            "id": fileName,
            "title": docTitle,
            "category": category,
            "tenant": tenant,
            "summary_brief": summary_brief,
            "summary_comprehensive": summary_comprehensive,
            "num_pages": numPages,
            "created_time": created_time
        },
        "content": {
            "mimeType": mimeType,
            "uri": gcsDocUrl
        }
    }
    return metadata, errors

# def create_metadata_json(PROJECT_ID, formData, mimeType, gcsDocUrl, fileName, numPages):
#     """ Create Metadata for the doc """
#     docTitle = formData.get("fileName")
#     category = formData.get("category")
#     tenant = formData.get("tenant")
#     created_time = datetime.now().isoformat() # ISO 8601

#     # Create summary if numPages <= 250
#     errors = ""
#     if numPages <= 250:
#         try:
#             summary_brief = batch_process_documents(
#                 project_id = PROJECT_ID,
#                 location = "us",
#                 processor_id = PROCESSOR_ID,
#                 gcs_output_uri = f"gs://{GCS_OUTPUT_URI}",
#                 processor_version_id = PROCESSOR_VERSION_BRIEF,
#                 gcs_input_uri = gcsDocUrl,
#                 input_mime_type = mimeType,
#                 # gcs_input_prefix = gcs_input_prefix,
#                 field_mask = "entities",
#                 timeout = 120,
#             )
#         except Exception as e:
#             errors = errors + " " + str(e)
#         try:
#             summary_comprehensive = batch_process_documents(
#                 project_id = PROJECT_ID,
#                 location = "us",
#                 processor_id = PROCESSOR_ID,
#                 gcs_output_uri = f"gs://{GCS_OUTPUT_URI}",
#                 processor_version_id = PROCESSOR_VERSION_COMPREHENSIVE,
#                 gcs_input_uri = gcsDocUrl,
#                 input_mime_type = mimeType,
#                 # gcs_input_prefix = gcs_input_prefix,
#                 field_mask = "entities",
#                 timeout = 120,
#             )
#         except Exception as e:
#             errors = errors + " " + str(e)

#     else:
#         summary_brief = ""
#         summary_comprehensive = ""

#     metadata = {
#         "id": str(uuid.uuid4()),
#         "structData": {
#             "id": fileName,
#             "name": docTitle,
#             "category": category,
#             "tenant": tenant,
#             "summary_brief": summary_brief,
#             "summary_comprehensive": summary_comprehensive,
#             "num_pages": numPages,
#             "created_time": created_time
#         },
#         "content": {
#             "mimeType": mimeType,
#             "uri": gcsDocUrl
#         }
#     }
#     return metadata, errors


def create_upload_json(bucket_name, metadata, fileName):
    """Write a PDF file to GCS bucket"""
    blob_name = f"metadata/{fileName}.json"

    # Upload the JSON file to GCS
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    json_data = json.dumps(metadata, ensure_ascii=False)
    blob.upload_from_string(json_data, content_type="application/json")
    gcs_json_url = f"gs://{bucket_name}/{blob_name}"

    return gcs_json_url

# https://cloud.google.com/storage/docs/uploading-objects#uploading-an-object


def write_to_gcs(bucket_name, file, mimeType):
    """Write a PDF file to GCS bucket"""
    filename = str(uuid.uuid4())
    ext = mimeType.split('/')[-1] if mimeType != "text/plain" else "txt"
    blob_name = f"converted/{filename}.{ext}"

    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    # blob.upload_from_filename(file, content_type="application/pdf")
    # blob.upload_from_file(file, content_type="application/pdf")
    blob.upload_from_string(file, content_type=mimeType)
    gcsDocUrl = f"gs://{bucket_name}/{blob_name}"
    return gcsDocUrl


def create_json_converted(formData):
    gcsDocUrl = formData.get("url")
    docTitle = formData.get("fileName")
    category = formData.get("category")
    tenant = formData.get("tenant")
    created_time = datetime.now().isoformat()  # ISO 8601

    fileNameUUID = str(uuid.uuid4())

    metadata = {
        "id": fileNameUUID,
        "structData": {
            "id": fileNameUUID,
            "title": docTitle,
            "category": category,
            "tenant": tenant,
            "created_time": created_time
        },
        "content": {
            "mimeType": "application/pdf",
            "uri": gcsDocUrl
        }
    }
    return metadata, fileNameUUID


def clean_filename(original_filename):
    # Replace invalid characters with '_'
    cleaned_filename = re.sub(r'[^\w\d-]', '_', original_filename)
    # Remove leading and trailing underscores
    cleaned_filename = cleaned_filename.strip('_')
    # Replace multiple underscores with a single underscore
    cleaned_filename = re.sub(r'_+', '_', cleaned_filename)
    # Limit the size to 45 characters
    cleaned_filename = cleaned_filename[:45]
    # Lowercase all alphabets
    cleaned_filename = cleaned_filename.lower()

    # Ensure the filename starts with an alphanumeric character
    while cleaned_filename and not cleaned_filename[0].isalnum():
        cleaned_filename = cleaned_filename[1:]

    # If the filename is empty after the above processing, use a default name
    if not cleaned_filename:
        cleaned_filename = "untitled"

    # Append timestamp
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    cleaned_filename = f"{cleaned_filename}_{timestamp}"
    return cleaned_filename


def bulk_upload_json(engineId, metadataList):
    """ Create JSONL using list of metadata, then upload to engineID Datastore """
    obj_list = []
    for metadata in metadataList:
        uniqueId = str(uuid.uuid4())
        uri = metadata["uri"]
        ext = uri.split('.')[-1]
        if ext == "pdf":
            mimeType = "application/pdf"
        elif ext == "html":
            mimeType = "text/html"
        elif ext == "txt":
            mimeType = "text/plain"
        else:
            return "Error: Invalid file name or file type!"
        obj = {
            "id": uniqueId,
            "structData": {
                "id": uniqueId,
                "title": metadata["documentTitle"],
                "category": metadata["category"],
                "tenant": metadata["tenant"],
                "created_time": datetime.now().isoformat()  # ISO 8601
                # "summary_brief": "",
                # "summary_comprehensive": "",
                # "num_pages": numPages,
            },
            "content": {
                "mimeType": mimeType,
                "uri": uri
            }
        }
        obj_list.append(obj)

    # Create a JSONL file from the obj_list
    jsonl_data = "\n".join(
        [json.dumps(entry, ensure_ascii=False) for entry in obj_list])

    # Upload the JSONL file to Google Cloud Storage
    blob_name = f"metadata/{uniqueId}.jsonl"
    storage_client = storage.Client()
    bucket = storage_client.bucket(BUCKET_FOR_UPLOAD)
    blob = bucket.blob(blob_name)
    blob.upload_from_string(jsonl_data, content_type="application/jsonl")
    gcs_jsonl_url = f"gs://{BUCKET_FOR_UPLOAD}/{blob_name}"
    print("gcs_jsonl_url:", gcs_jsonl_url)

    print("~ Upload to Search Engine Datastore...")
    try:
        import_documents_sample(
            project_id=PROJECT_ID,
            location="global",
            search_engine_id=engineId,
            gcs_uri=gcs_jsonl_url,
        )
    except Exception as e:
        return str(e)
    return 'ok'


def bulk_upload_csv(engineId, file):
    # print(f"FILE TYPE: {type(file)}")
    metadataList = []
    try:
        # Read the CSV file using the csv.reader
        csv_file = TextIOWrapper(file, encoding='utf-8')
        csv_reader = csv.DictReader(csv_file)

        # Iterate through each row in the CSV file
        for row in csv_reader:
            uri = row["uri"]
            name = row["name"]
            category = row["category"]
            tenant = row["tenant"]

            # Create a metadata dictionary for each row
            metadata = {
                "uri": uri,
                "documentTitle": name,
                "category": category,
                "tenant": tenant
            }
            metadataList.append(metadata)

        # Call bulk_upload_json with the engineId and metadataList
        result = bulk_upload_json(engineId, metadataList)
        return result

    except Exception as e:
        return str(e)
