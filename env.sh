#!/usr/bin/env bash
PROJECT_ID=$(gcloud config get-value project)

export PROJECT_ID=$PROJECT_ID
export BUCKET_FOR_UPLOAD="searchtooltest-upload"
export ENGINE_1="searchtest_1721034046034"
export MODEL_1="gemini-pro"
export MODEL_2="text-bison@002"
