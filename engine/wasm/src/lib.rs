mod utils;

use wasm_bindgen::prelude::*;

use typst::diag::{FileError, FileResult};
use typst::foundations::Datetime;
use typst::syntax::{FileId, Source};
use typst::utils::LazyHash;
use typst::Library;
use typst_library::layout::PagedDocument;
use typst_library::text::{Font, FontBook};

#[wasm_bindgen]
pub fn compile_svg(code: &str) -> Result<JsValue, JsValue> {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();

    let world = WasmWorld::new(code.to_owned());
    let doc: PagedDocument = typst::compile(&world)
        .output
        .map_err(|errs| JsValue::from_str(&format_errors(&errs)))?;

    let svgs: Vec<String> = doc.pages.iter().map(typst_svg::svg_selectable).collect();

    serde_wasm_bindgen::to_value(&svgs).map_err(|e| JsValue::from_str(&e.to_string()))
}

fn format_errors(errors: &[typst::diag::SourceError]) -> String {
    errors
        .iter()
        .map(|e| format!("{:?}", e))
        .collect::<Vec<_>>()
        .join("\n")
}

struct WasmWorld {
    source: Source,
    library: LazyHash<Library>,
    book: LazyHash<FontBook>,
    fonts: Vec<Font>,
    now: time::OffsetDateTime,
}

impl WasmWorld {
    fn new(code: String) -> Self {
        let source = Source::detached(code);

        let mut book = FontBook::new();
        let mut fonts: Vec<Font> = Vec::new();

        for data in typst_assets::fonts() {
            let bytes = typst_library::foundations::Bytes::new(data);
            for font in Font::iter(bytes) {
                book.push(font.info().clone());
                fonts.push(font);
            }
        }

        let library = Library::builder().build();

        Self {
            source,
            library: LazyHash::new(library),
            book: LazyHash::new(book),
            fonts,
            now: time::OffsetDateTime::now_utc(),
        }
    }
}

impl typst::World for WasmWorld {
    fn library(&self) -> &LazyHash<Library> {
        &self.library
    }

    fn book(&self) -> &LazyHash<FontBook> {
        &self.book
    }

    fn main(&self) -> FileId {
        self.source.id()
    }

    fn source(&self, id: FileId) -> FileResult<Source> {
        if id == self.source.id() {
            Ok(self.source.clone())
        } else {
            Err(FileError::AccessDenied)
        }
    }

    fn file(&self, _id: FileId) -> FileResult<typst::foundations::Bytes> {
        Err(FileError::AccessDenied)
    }

    fn font(&self, id: usize) -> Option<Font> {
        self.fonts.get(id).cloned()
    }

    fn today(&self, offset: Option<i64>) -> Option<Datetime> {
        let offset = offset.unwrap_or(0);
        let offset = time::UtcOffset::from_hms(offset.try_into().ok()?, 0, 0).ok()?;
        let time = self.now.checked_to_offset(offset)?;
        Some(Datetime::Date(time.date()))
    }
}
