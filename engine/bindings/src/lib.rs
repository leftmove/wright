use pyo3::prelude::*;
use pyo3::types::PyModule;

use compile::TypstWrapperWorld;
use typst_library::layout::PagedDocument;

mod compile;

#[pyfunction]
fn compile_svg(document: String) -> PyResult<Vec<String>> {
    let world = TypstWrapperWorld::new(
        "/Users/anonyo/School/PSY-200 (Cognitive Psychology)/Notes".to_owned(),
        document,
    );
    let document: PagedDocument = typst::compile(&world)
        .output
        .expect("Error compiling typst");

    let svgs = document
        .pages
        .iter()
        .map(|page| typst_svg::svg(page))
        .collect();

    Ok(svgs)
}

#[pymodule]
fn bindings(_py: Python, m: &Bound<PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(compile_svg, m)?)?;
    Ok(())
}
