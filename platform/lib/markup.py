from pydantic import BaseModel, Field
from pydantic import PositiveInt, PositiveFloat
from typing import Union

from lxml import etree
from bindings import sum_as_string

from lib.example import example_svg


class TextOverlay(BaseModel):
    transform: tuple[float, float]
    x: float
    y: float
    

class DocumentModel(BaseModel):
    
    """
    Amount of pages in the document.
    """
    pages: PositiveInt = Field(default=0)

    """
    Size of the document in pixels.
    """
    attrib_width: Union[str, None]
    attrib_height: Union[str, None]
    width: Union[float, None]
    height: Union[float, None]

    """
    Overlay elements.
    """
    overlay: list[TextOverlay] = Field(default=[])
    
ns = { "svg": "http://www.w3.org/2000/svg" }

def overlay_svg(svg: str, markup: str) -> DocumentModel :

    root = etree.fromstring(svg)

    attrib_width: Union[str, None] = root.get("width")
    attrib_height: Union[str, None] = root.get("height")

    width: Union[float, None] = float(attrib_width.removesuffix("pt")) if attrib_width else None
    height: Union[float, None] = float(attrib_height.removesuffix("pt")) if attrib_height else None

    class_search = "typst-text"
    elements = root.xpath(
        f"//*[contains(concat(' ', normalize-space(@class), ' '), ' {class_search} ')]",
        namespaces=ns
    )



    
    return DocumentModel(
        pages=1,
        width=width,
        height=height,
    )


if __name__ == "__main__":
    print(sum_as_string(1, 2))
    # overlay_svg(example_svg, "")