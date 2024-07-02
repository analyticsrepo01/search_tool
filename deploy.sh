## Enable APIs ############################################################################################################################

printf "Enabling the required APIs...\n"
gcloud services enable logging.googleapis.com
gcloud services enable monitoring.googleapis.com
gcloud services enable sourcerepo.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable appengine.googleapis.com
gcloud services enable appengineflex.googleapis.com
gcloud services enable discoveryengine.googleapis.com
gcloud services enable aiplatform.googleapis.com

printf "APIs enabled.\n\n"

## Create Service Account ############################################################################################################################

echo "✅ Creating service account..."
SA_EXISTS=$(gcloud iam service-accounts list --filter="$SERVICE_ACC" | wc -l)
if [ $SA_EXISTS = "0" ]; then
   gcloud iam service-accounts create $SERVICE_ACC
fi

echo "✅ Granting Service account permissions..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACC@$PROJECT_ID.iam.gserviceaccount.com" \
  --role=roles/discoveryengine.admin
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACC@$PROJECT_ID.iam.gserviceaccount.com" \
  --role=roles/aiplatform.user
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACC@$PROJECT_ID.iam.gserviceaccount.com" \
  --role=roles/logging.logWriter
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACC@$PROJECT_ID.iam.gserviceaccount.com" \
  --role=roles/run.admin
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACC@$PROJECT_ID.iam.gserviceaccount.com" \
  --role=roles/storage.objectUser

echo "⭐️ Service account permissions assigned!"

# echo "Check service account permissions:\n"
# gcloud projects get-iam-policy $PROJECT_ID  \
# --flatten="bindings[].members" \
# --format='table(bindings.role)' \
# --filter="bindings.members:$SERVICE_ACC@$PROJECT_ID.iam.gserviceaccount.com"

## Docker ############################################################################################################################
printf "✅ Creating a Docker Repository in Artifact Registry...\n"
gcloud artifacts repositories create $REPOSITORY --repository-format=docker --location=$REGION
gcloud artifacts repositories list

printf "✅ Authenticate Docker in $REGION...\n"
gcloud config set run/region $REGION
gcloud auth configure-docker $REGION-docker.pkg.dev

printf "✅ Build image and push to Artifact Registry...\n"
docker build -t $REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$IMAGE:$TAG .
docker push $REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$IMAGE:$TAG

echo "⭐️ Docker image is ready!"

## Cloud Run ############################################################################################################################

# printf "✅ Deploy container to Cloud Run...\n"
# gcloud run deploy $REPOSITORY --image $REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$IMAGE:$TAG --region $REGION \
# --service-account=$SERVICE_ACC@$PROJECT_ID.iam.gserviceaccount.com \
# --set-env-vars=PROJECT_ID=$PROJECT_ID,BUCKET_FOR_UPLOAD=$BUCKET_FOR_UPLOAD,ENGINE_1=$ENGINE_1,MODEL_1=$MODEL_1,MODEL_2=$MODEL_2

# printf "⭐️ Cloud Run Service deployed!\n"

## APP ENGINE ############################################################################################################################

# gcloud projects add-iam-policy-binding $PROJECT_ID \
#   --member="serviceAccount:$SERVICE_ACC@$PROJECT_ID.iam.gserviceaccount.com" \
#   --role=roles/appengine.appAdmin
# gcloud projects add-iam-policy-binding $PROJECT_ID \
#   --member="serviceAccount:$SERVICE_ACC@$PROJECT_ID.iam.gserviceaccount.com" \
#   --role=roles/appengineflex.serviceAgent

# echo "runtime: custom
# env: flex
# env_variables:
#     PROJECT_ID: $PROJECT_ID
#     BUCKET_FOR_UPLOAD: $BUCKET_FOR_UPLOAD
#     ENGINE_1: $ENGINE_1
#     MODEL_1: $MODEL_1
#     MODEL_2: $MODEL_2
# " > app.yaml

# gcloud app deploy --image-url=$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$IMAGE:$TAG