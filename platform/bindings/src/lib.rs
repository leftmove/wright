use pyo3::prelude::*;
use pyo3::types::PyModule;

use compile::TypstWrapperWorld;
use typst::layout::Abs;

mod compile;

#[pyfunction]
fn sum_as_string(a: usize, b: usize) -> PyResult<String> {
    Ok((a + b).to_string())
}

#[pyfunction]
fn compile_svg(document: String) -> PyResult<String> {
    let world = TypstWrapperWorld::new(
        "/Users/anonyo/School/PSY-200 (Cognitive Psychology)/Notes".to_owned(),
        document,
    );
    let document = typst::compile(&world)
        .output
        .expect("Error compiling typst");
    let svg = typst_svg::svg_merged(&document, Abs::pt(2.0));

    Ok(svg)
}

#[pymodule]
fn extensions(_py: Python, m: &Bound<PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(sum_as_string, m)?)?;
    m.add_function(wrap_pyfunction!(compile_svg, m)?)?;
    Ok(())
}
