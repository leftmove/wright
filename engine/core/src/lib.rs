use typst::compile;
use typst_library::layout::PagedDocument;

// Patches
// ./patches/typst-svg-0.13.1/src/lib.rs
// ./patches/typst-html-0.13.1/src/lib.rs
use typst_html::html;
use typst_svg::svg_selectable;

mod compile;
pub use compile::TypstWrapperWorld;

pub fn compile_svg(typst_code: &str) -> Result<Vec<String>, String> {
    let world = TypstWrapperWorld::new(String::from("."), typst_code.to_string());

    let document: PagedDocument = compile(&world).output.map_err(|errors| {
        errors
            .iter()
            .map(|e| format!("{:?}", e))
            .collect::<Vec<_>>()
            .join("\n")
    })?;

    let svgs: Vec<String> = document
        .pages
        .iter()
        .map(|page| svg_selectable(page))
        .collect();

    Ok(svgs)
}

pub fn compile_html(typst_code: &str) -> Result<String, String> {
    let world = TypstWrapperWorld::new(String::from("."), typst_code.to_string());

    let document: PagedDocument = compile(&world).output.map_err(|errors| {
        errors
            .iter()
            .map(|e| format!("{:?}", e))
            .collect::<Vec<_>>()
            .join("\n")
    })?;

    Ok(html(&document))
}
