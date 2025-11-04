use pyo3::exceptions::PyRuntimeError;
use pyo3::prelude::*;
use pyo3::types::PyModule;

#[pyfunction]
fn compile_svg(document: String) -> PyResult<Vec<String>> {
    match wright_core::compile_svg(&document) {
        Ok(svgs) => Ok(svgs),
        Err(e) => Err(PyErr::new::<PyRuntimeError, _>(e)),
    }
}

#[pyfunction]
fn compile_html(document: String) -> PyResult<String> {
    match wright_core::compile_html(&document) {
        Ok(html) => Ok(html),
        Err(e) => Err(PyErr::new::<PyRuntimeError, _>(e)),
    }
}

#[pymodule]
fn bindings(_py: Python, m: &Bound<PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(compile_svg, m)?)?;
    m.add_function(wrap_pyfunction!(compile_html, m)?)?;
    Ok(())
}
