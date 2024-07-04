#!/usr/bin/env bash
PROJECT_ID=$(gcloud config get-value project)

export PROJECT_ID=$PROJECT_ID
export BUCKET_FOR_UPLOAD="cymbal-search-poc"
export ENGINE_1="cym-ds_1716228262297"
export MODEL_1="gemini-pro"
export MODEL_2="text-bison@002"
