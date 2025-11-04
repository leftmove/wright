use maud::{html, PreEscaped, DOCTYPE};
use typst::compile;
use typst_library::layout::PagedDocument;
use typst_svg::{svg, svg_text_overlay};

use crate::compile::TypstWrapperWorld;

pub fn compile_html(typst_code: &str) -> Result<String, String> {
    let world = TypstWrapperWorld::new(String::from("."), typst_code.to_string());

    let paged_document: PagedDocument = compile(&world).output.map_err(|errors| {
        errors
            .iter()
            .map(|e| format!("{:?}", e))
            .collect::<Vec<_>>()
            .join("\n")
    })?;

    let backgrounds: Vec<String> = paged_document.pages.iter().map(|page| svg(page)).collect();

    let overlays: Vec<String> = paged_document
        .pages
        .iter()
        .map(|page| svg_text_overlay(page))
        .collect();

    let pages_html = paged_document
        .pages
        .iter()
        .zip(backgrounds.iter().zip(overlays.iter()))
        .map(|(page, (bg, overlay))| {
            let width = page.frame.size().x.to_pt();
            let height = page.frame.size().y.to_pt();

            html! {
                div class="typst-page" style=(format!("position: relative; width: {}pt; height: {}pt; margin: 20px auto;", width, height)) {
                    div class="svg-background" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" {
                        (PreEscaped(bg))
                    }
                    div class="html-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: auto;" {
                        (PreEscaped(overlay))
                    }
                }
            }
        })
        .collect::<Vec<_>>();

    let full_html = html! {
        (DOCTYPE)
        html {
            head {
                meta charset="utf-8";
                meta name="viewport" content="width=device-width, initial-scale=1";
                style {
                    (PreEscaped(r#"
                        body {
                            margin: 0;
                            padding: 0;
                            background: #f5f5f5;
                        }
                        .typst-page {
                            background: white;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        }
                        .svg-background {
                            pointer-events: none;
                        }
                        .html-overlay * {
                            margin: 0;
                            padding: 0;
                        }
                    "#))
                }
            }
            body {
                @for page in pages_html {
                    (page)
                }
            }
        }
    };

    Ok(full_html.into_string())
}
