from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import logging

from search import search_unstructured
from gsutils import *
from url_to_pdf import PdfGenerator
from conversion import convert_url_to_pdf, convert_url_to_html
from vertex import vertex_qa
from datastore import *
from conversations import converse_conversation, delete_conversation
from conversationService import ConversationalSearchClient  # , ConversationService


PROJECT_ID = os.environ.get('PROJECT_ID')
BUCKET_FOR_UPLOAD = os.environ.get('BUCKET_FOR_UPLOAD')
ENGINE_1 = os.environ.get('ENGINE_1', '')
ENGINE_2 = os.environ.get('ENGINE_2', '')
ENGINE_3 = os.environ.get('ENGINE_3', '')
ENGINE_4 = os.environ.get('ENGINE_4', '')
MODEL_1 = os.environ.get('MODEL_1', 'gemini-pro')
MODEL_2 = os.environ.get('MODEL_2', 'text-bison@002')

LOCATION = "global"


app = Flask(__name__, static_folder='build')
CORS(app, resources={r"/*": {"origins": ["*"]}})

"""Set the log level and log format"""
app.logger.setLevel(logging.INFO)
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.StreamHandler()
handler.setFormatter(formatter)
app.logger.addHandler(handler)

# app.logger.info('This is an info log.')
# app.logger.warning('This is a warning log.')
# app.logger.error('This is an error log.')

""" Serve React App """


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


@app.errorhandler(404)
def not_found(e):
    return app.send_static_file('index.html')


@app.route('/')
def index():
    return app.send_static_file('index.html')


""" List Engines """


@app.route('/listEngines', methods=['GET'])
def listEngines():
    try:
        engines = []
        if ENGINE_1 == '':
            raise ValueError(
                "ENGINE_1 is not specified in Environment Variable!")
        else:
            engines.append(ENGINE_1)
        if ENGINE_2 != '':
            engines.append(ENGINE_2)
        if ENGINE_3 != '':
            engines.append(ENGINE_3)
        return jsonify(engines)
    except Exception as e:
        app.logger.error("Error in /listEngines:  " + str(e))
        return jsonify({"error": str(e)}), 500


""" List Models """


@app.route('/listModels', methods=['GET'])
def listModels():
    try:
        models = []
        models.append(MODEL_1)
        models.append(MODEL_2)
        return jsonify(models)
    except Exception as e:
        app.logger.error("Error in /listModels:  " + str(e))
        return jsonify({"error": str(e)}), 500


""" Search """


@app.route('/search', methods=['POST'])
def search():
    data = request.get_json()
    try:
        results = search_unstructured(PROJECT_ID, data)
        return jsonify(results)
    except Exception as e:
        app.logger.error("Error in /search: " + str(e))
        print(f"An error occurred: {e}")
        return jsonify({'error': str(e)}), 500


""" Read doc from GCS """


@app.route('/read', methods=['POST'])
def read():
    data = request.get_json()
    try:
        results = getpdf(data.get('uriLink'))
        return jsonify(results)
    except Exception as e:
        app.logger.error("Error /read: " + str(e))


""" Upload Single File to GCS """


@app.route('/upload', methods=['POST'])
def upload():
    file = request.files["file"]
    formData = request.form
    try:
        metadata, errors = uploadpdf(
            PROJECT_ID,
            BUCKET_FOR_UPLOAD,
            file,
            formData,
        )
        app.logger.info(f'~ Metadata Created: {str(metadata)}')
        if errors:
            app.logger.info(f'~ Errors: {str(errors)}')
        return jsonify(status="success")
    except Exception as e:
        app.logger.error("Error in /upload: " + str(e))
        return jsonify(status="error", message="Error uploading file to GCS: " + str(e))


""" Convert URL to PDF """


@app.route('/convert', methods=['POST'])
def convert_urls_to_pdf():
    try:
        data = request.get_json()
        url = data.get('url')
        if not url:
            return jsonify(error='No URLs provided'), 400

        # Using Pdfkit
        pdf_content = convert_url_to_pdf(url)

        # Upload the PDF content to GCS
        bucket_name = BUCKET_FOR_UPLOAD
        mimeType = "application/pdf"
        gcsDocUrl = write_to_gcs(bucket_name, pdf_content, mimeType)

        return jsonify(gcs_link=gcsDocUrl), 200

    except Exception as e:
        app.logger.error("Error in /convert: " + str(e))
        return jsonify({"error": str(e)}), 500


""" Convert Using PDF Generator """


@app.route('/pdfgenerator', methods=['POST'])
def pdfgenerator():
    try:
        data = request.get_json()
        url = data.get('url')
        if not url:
            return jsonify(error='No URLs provided'), 400

        # Using PdfGenerator
        pdf_file = PdfGenerator([url]).main()
        pdf_content = pdf_file[0].getbuffer().tobytes()
        print("pdf_content", pdf_content)

        # # Using Pdfkit
        # pdf_content = convert_url_to_pdf(url)

        # Upload the PDF content to GCS
        bucket_name = BUCKET_FOR_UPLOAD
        mimeType = "application/pdf"
        gcsDocUrl = write_to_gcs(bucket_name, pdf_content, mimeType)

        return jsonify(gcs_link=gcsDocUrl), 200

    except Exception as e:
        app.logger.error("Error in /convert: " + str(e))
        return jsonify({"error": str(e)}), 500


""" Upload Converted PDF to ES """


@app.route('/uploadConverted', methods=['POST'])
def import_converted_to_ES():
    try:
        formData = request.form
        engineId = formData.get("engine_id")
        metadata, filename = create_json_converted(
            formData)  # Create JSON file
        app.logger.info('~ Metadata Created:', str(metadata))
        gcs_json_url = create_upload_json(
            BUCKET_FOR_UPLOAD, metadata, filename)  # Upload JSON to bucket

        # Upload JSON from GCS to ES
        if not gcs_json_url:
            return jsonify(error='No URLs provided'), 400
        app.logger.info("~ Upload to Search Engine Datastore...")
        import_documents(
            project_id=PROJECT_ID,
            location=LOCATION,
            search_engine_id=engineId,
            gcs_uri=gcs_json_url,
        )
        app.logger.info("~ Uploaded to ES!!!")
        return jsonify(status="success"), 200

    except Exception as e:
        app.logger.error("Error in /uploadConverted:  " + str(e))
        return jsonify({"error": str(e)}), 500


""" Convert URL to HTML """


@app.route('/convertHTML', methods=['POST'])
def convert_urls_to_html():
    try:
        data = request.get_json()
        url = data.get('url')
        if not url:
            return jsonify(error='No URLs provided'), 400

        html_content = convert_url_to_html(url)
        print(html_content)

        # Upload the HTML to GCS
        bucket_name = BUCKET_FOR_UPLOAD
        mimeType = "text/html"
        gcsDocUrl = write_to_gcs(bucket_name, html_content, mimeType)
        print("GCS URL: ", gcsDocUrl)
        return jsonify(gcs_link=gcsDocUrl), 200

    except Exception as e:
        app.logger.error("Error in /convertHTML:  " + str(e))
        return jsonify({"error": str(e)}), 500


""" Bulk Import using JSON """


@app.route('/bulk_import_json', methods=["POST"])
def bulk_import_json():
    try:
        data = request.get_json()
        engineId = data.get('engine_id')
        metadataList = data.get('metadata_list')
        res = bulk_upload_json(engineId, metadataList)
        if res == 'ok':
            return jsonify(status="success"), 200
        else:
            app.logger.error("Error:  " + res)
            return jsonify({"error": res}), 500
    except Exception as e:
        app.logger.error("Error in /bulk_import_json:  " + str(e))
        return jsonify({"error": str(e)}), 500


""" Bulk Import using CSV """


@app.route('/bulk_import_csv', methods=["POST"])
def bulk_import_csv():
    try:
        engineId = request.form.get("engine_id")
        file = request.files["file"]
        res = bulk_upload_csv(engineId, file)
        if res == 'ok':
            return jsonify(status="success"), 200
        else:
            app.logger.error("Error:  " + res)
            return jsonify({"error": res}), 500
    except Exception as e:
        app.logger.error("Error in /bulk_import_csv:  " + str(e))
        return jsonify({"error": str(e)}), 500


""" Call Vertex AI to obtain Summary """


@app.route('/regenerate', methods=['POST'])
def regenerate():
    data = request.get_json()
    llmModel = data.get('llmModel')
    query = data.get('query')
    summary = data.get('summary')
    checkedItems = data.get('checkedItems')
    searchResults = data.get('searchResults')
    userInput = data.get('userInput')
    temperature = data.get('temperature')
    topK = data.get('topK')
    topP = data.get('topP')
    try:
        results = vertex_qa(
            llmModel,
            query,
            summary,
            checkedItems,
            searchResults,
            userInput,

            temperature,
            topK,
            topP
        )
        return jsonify(results)
    except Exception as e:
        app.logger.error("Error in /regenerate:  " + str(e))
        return jsonify({"error": str(e)}), 500


""" List Indexed Documents in Datastore """


@app.route('/listDocuments', methods=['POST'])
def listDocs():
    try:
        data = request.get_json()
        docs = list_documents(PROJECT_ID, LOCATION, data.get("engine_id"))
        results = list_details(docs)
        return jsonify(results)
    except Exception as e:
        app.logger.error("Error in /listDocuments:  " + str(e))
        return jsonify({"error": str(e)}), 500


""" List Metadata in Datastore """


@app.route('/listMetadata', methods=['POST'])
def listMetadata():
    try:
        data = request.get_json()
        docs = list_documents(PROJECT_ID, LOCATION, data.get("engine_id"))
        tenants = list_tenants(docs)
        categories = list_categories(docs)
        res = []
        res.append(tenants)
        res.append(categories)

        return jsonify(res)
    except Exception as e:
        app.logger.error("Error in /listMetadata:  " + str(e))
        return jsonify({"error": str(e)}), 500


""" Get Document """


@app.route('/getDocument', methods=['GET'])
def getDoc():
    data = request.get_json()
    docName = data.get('llmModel')
    response, status = sample_get_document(docName)
    if status == 200:
        return jsonify(response), status
    else:
        app.logger.error("Error in /getDocument:  " + str(response))
        return jsonify({"error": str(response)}), 500


""" Purge Datastore """


@app.route('/purge', methods=['POST'])
def purgeDocs():
    try:
        data = request.get_json()
        datastore_id = data.get("engine_id")
        parent_value = f"""projects/{PROJECT_ID}/locations/{
            LOCATION}/collections/default_collection/dataStores/{datastore_id}/branches/0"""
        sample_purge_documents(parent_value, "*")
        return jsonify(status='success'), 200
    except Exception as e:
        app.logger.error("Error in /purge:  " + str(e))
        return jsonify(error=str(e)), 500


""" Delete List of Documents """


@app.route('/deleteDocs', methods=['POST'])
def deleteDocs():
    data = request.get_json()
    docNameList = data.get('documents')
    errors = []
    for docName in docNameList:
        try:
            sample_delete_document(docName)
        except Exception as e:
            errors.append(str(e))
            continue
    if len(errors) != 0:
        return jsonify(status='success', errors=errors), 200
    else:
        return jsonify(status='success'), 200


""" Send Email Helper Function"""

FROM_EMAIL = 'demo.for.genai@gmail.com'
SEND_EMAIL = 'elroylbj@google.com'
APP_PASSWORD = 'tkvp inyt lams cyfq'


def send_email(subject, contents):
    msg = MIMEMultipart()

    msg['From'] = FROM_EMAIL
    msg['To'] = SEND_EMAIL
    msg['Subject'] = subject

    msg.attach(MIMEText(contents, 'plain'))

    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(FROM_EMAIL, APP_PASSWORD)
    text = msg.as_string()
    server.sendmail(FROM_EMAIL, SEND_EMAIL, text)
    server.quit()

    return True


""" Register Interest created by darrenchew@google.com """


@app.route('/registerEmail', methods=['POST'])
def register_email():
    try:
        data = request.json
        email = data.get('email')
        if not email:
            return jsonify({"error": "Email address not provided."}), 400
        else:
            subject = "[Cymbalsearch] Register Interest"
            contents = email
            send_email(subject, contents)

            logging.info('Email sent successfully.')
            return jsonify({"message": "Interest has been registered."}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


""" Send feedback to email from Contact Page"""


@app.route('/sendEmail', methods=['POST'])
def send_feedback():
    try:
        formData = request.get_json()
        name = formData.get("name")
        # country = formData.get("country")
        companyName = formData.get("companyName")
        companyEmail = formData.get("companyEmail")
        mobileNumber = formData.get("mobileNumber")

        subject = "[Cymbalsearch] Register Interest"
        new_line = '\n'
        contents = f"""Name: {name}{new_line}Company: {companyName}{
            new_line}Email: {companyEmail}{new_line}Contact: {mobileNumber}"""
        send_email(subject, contents)

        logging.info('Email sent successfully.')
        return jsonify({"message": "Interest has been registered."}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


""" Start a New Conversation """


@app.route('/start_convo', methods=['POST'])
def start_convo():
    data = request.get_json()
    datastore_id = data.get("engine_id")
    user_input = data.get("user_input")
    parent_value = f"""projects/{PROJECT_ID}/locations/{
        LOCATION}/collections/default_collection/dataStores/{datastore_id}"""
    print('parent_value:', parent_value)
    print('user_input:', user_input)
    try:
        results = converse_conversation(
            parent_value + "/conversations/-", user_input)
        return jsonify(results)
    except Exception as e:
        app.logger.error("Error in /start_convo: " + str(e))


""" Continue a Conversation """


@app.route('/continue_convo', methods=['POST'])
def continue_convo():
    data = request.get_json()
    conversation_name = data.get("conversation_name")
    user_input = data.get("user_input")
    datastore_id = data.get("engine_id")
    print('engine_id:', datastore_id)
    try:
        # New convo at chatbot
        if conversation_name == "":
            conversation_name = f"""projects/{PROJECT_ID}/locations/{
                LOCATION}/collections/default_collection/dataStores/{datastore_id}/conversations/-"""
        print('conversation_name:', conversation_name)
        print('user_input:', user_input)
        results = converse_conversation(conversation_name, user_input)
        return jsonify(results)
    except Exception as e:
        app.logger.error("Error in /continue_convo: " + str(e))


""" List all Conversations """


@app.route('/list_convo', methods=['POST'])
def list_convo():
    data = request.get_json()
    datastore_id = data.get("engine_id")
    parent_value = f"""projects/{PROJECT_ID}/locations/{
        LOCATION}/collections/default_collection/dataStores/{datastore_id}"""
    try:
        client = ConversationalSearchClient(parent_value)
        client.list_conversations()
        return jsonify(client.conversations)
    except Exception as e:
        app.logger.error("Error in /list_convo: " + str(e))


""" Delete Conversations """


@app.route('/delete_convos', methods=["POST"])
def delete_convos():
    data = request.get_json()
    convo_names = data.get("conversations")
    print("convo_names:", convo_names)
    try:
        for convo_name in convo_names:
            print("Convo Name: ", convo_name)
            delete_conversation(convo_name)
        return "", 200
    except Exception as e:
        app.logger.error("Error in /list_convo: " + str(e))

# """ Get Conversation """
# @app.route('/get_convo', methods=['POST'])
# def list_convo():
#     data = request.get_json()
#     conversation_name = data.get("conversation_name")
#     datastore_id = data.get("engine_id")
#     parent_value = f"projects/{PROJECT_ID}/locations/{LOCATION}/collections/default_collection/dataStores/{datastore_id}"
#     try:
#         client = ConversationalSearchClient(parent_value)
#         conversation = ConversationService(client, conversation_name=conversation_name)
#         return jsonify(client.conversations)
#     except Exception as e:
#         app.logger.error("Error in /list_convo: " + str(e))

# """ Update a Conversation """
# @app.route('/update_convo', methods=['POST'])
# def update_convo():
#     data = request.get_json()
#     conversation = data.get("conversation")
#     new_state = data.get("new_state")
#     new_user_pseudo_id = data.get("new_user_pseudo_id")
#     try:
#         updated_convo = update_conversation(conversation, new_state, new_user_pseudo_id)
#         return jsonify(updated_convo)
#     except Exception as e:
#         app.logger.error("Error in /update_convo: " + str(e))


if __name__ == '__main__':
    app.run(use_reloader=True, port=8000, threaded=True)
