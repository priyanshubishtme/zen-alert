@echo off
echo Starting ZenAlert Server...
cd backend
uvicorn main:app --reload
