from fastapi import FastAPI, File, UploadFile, Depends
from clustering import getClusters

app = FastAPI()


# run: uvicorn main:app --port 8001

@app.post("/getClusters/")
async def getfile(file: UploadFile = File(...)):
    contents = await file.read()
    res = getClusters(contents)
    return res
