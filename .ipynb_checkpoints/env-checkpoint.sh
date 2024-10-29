#!/usr/bin/env bash
PROJECT_ID=$(gcloud config get-value project)

export PROJECT_ID=$PROJECT_ID
export BUCKET_FOR_UPLOAD="jinglebells-search"
export ENGINE_1="jinglebells_1729826904667"
export MODEL_1="gemini-pro"
export MODEL_2="text-bison@002"
