from fastapi import FastAPI, File, UploadFile, Depends
from clustering import getClusters

from io import BytesIO
import csv

app = FastAPI()


# run: uvicorn main:app --port 8001

@app.post("/process")
async def getfile(file: UploadFile = File(...)):
    file_contents = await file.read()

    if file.content_type == "text/csv":
        try:
            csv_file = BytesIO(file_contents)
            res = getClusters(csv_file)
            return {"data": res}
        except Exception as e:
            return 
