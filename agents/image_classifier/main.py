from fastapi import FastAPI, File, UploadFile, Depends
from predict import classify_image

app = FastAPI()



@app.get("/predict")
async def respond():
    print("predict")
    return {"reply": "predict"}

# run: uvicorn main:app --port 8001

@app.post("/predict/")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()
    predication = classify_image(contents)
    return {"prediction": predication}
