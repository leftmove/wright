from typing import Union
from fastapi import FastAPI

from routers import document

app: FastAPI = FastAPI()

app.include_router(document.router)


@app.get("/")
def read_root():
    return {"message": "Hello World"}