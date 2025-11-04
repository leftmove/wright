use typst::compile;
use typst_library::layout::PagedDocument;
use typst_svg::svg_selectable;

mod compile;
mod html;
mod markup;

pub use compile::TypstWrapperWorld;
pub use html::compile_html;
pub use markup::analyze_markup;

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
