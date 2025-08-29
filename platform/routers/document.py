from fastapi import APIRouter
from pydantic import BaseModel

from lib import markup

router: APIRouter = APIRouter(prefix="/doc")


@router.get("/")
def read_root():
    return {"message": "Hello World"}

    