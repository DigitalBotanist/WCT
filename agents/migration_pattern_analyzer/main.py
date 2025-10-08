from fastapi import FastAPI, File, UploadFile, Depends
from clustering import getClusters

from io import BytesIO
import csv

app = FastAPI()


# run: uvicorn main:app --port 8001

@app.post("/process")
async def getfile(file: UploadFile = File(...)):
    print(file.content_type)
    file_contents = await file.read()

    if file.content_type == "text/csv":
        try:
            csv_file = BytesIO(file_contents)
            print(csv_file)
            res = getClusters(csv_file)
            return {"status": "success", "data": res}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    # If it's an image or other file type, you can add your logic to handle it
    return {"status": "success", "message": "File processed successfully"}
