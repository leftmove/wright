use typst::syntax::{LinkedNode, SyntaxKind, SyntaxNode};

fn callee_name_from_func_call(node: &LinkedNode) -> Option<String> {
    let mut name: Option<String> = None;
    for child in node.children() {
        if child.kind() == SyntaxKind::Ident {
            return Some(child.get().text().to_string());
        }
        for grand in child.children() {
            if grand.kind() == SyntaxKind::Ident {
                name = Some(grand.get().text().to_string());
            }
        }
    }
    name
}

fn classify_callable(name: &str) -> Option<&'static str> {
    match name {
        "heading" => Some("heading"),
        "image" => Some("image"),
        "figure" => Some("figure"),
        "table" => Some("table"),
        "quote" => Some("quote"),
        "outline" => Some("outline"),
        "bibliography" => Some("bibliography"),
        "list" => Some("list"),
        "enum" => Some("enum"),
        "terms" => Some("terms"),
        _ => None,
    }
}

fn is_equation_block(node: &LinkedNode) -> bool {
    let children: Vec<_> = node.children().collect();
    if children.len() < 3 {
        return false;
    }
    matches!(children.get(1).map(|n| n.kind()), Some(SyntaxKind::Space))
        && matches!(
            children
                .get(children.len().saturating_sub(2))
                .map(|n| n.kind()),
            Some(SyntaxKind::Space)
        )
}

fn is_raw_block(node: &LinkedNode) -> bool {
    let children: Vec<_> = node.children().collect();
    let delim_len_ok = children
        .first()
        .map(|n| n.kind() == SyntaxKind::RawDelim && n.get().len() >= 3)
        .unwrap_or(false);
    if delim_len_ok {
        return true;
    }
    children
        .iter()
        .any(|n| n.kind() == SyntaxKind::RawTrimmed && n.get().text().chars().any(|c| c == '\n'))
}

fn node_text(node: &LinkedNode) -> String {
    node.get().clone().into_text().to_string()
}

fn finalize_paragraph_fn(
    paragraph_active: &mut bool,
    paragraph_buf: &mut String,
    out: &mut Vec<String>,
) {
    if *paragraph_active || !paragraph_buf.is_empty() {
        out.push(std::mem::take(paragraph_buf));
        *paragraph_active = false;
    }
}

fn finalize_list_fn(
    current_list: &mut Option<&'static str>,
    current_list_text: &mut Option<String>,
    out: &mut Vec<String>,
) {
    if current_list.is_some() {
        if let Some(text) = current_list_text.take() {
            out.push(text);
        }
        *current_list = None;
    }
}

fn analyze_markup_node(markup: &LinkedNode) -> Vec<String> {
    let mut results: Vec<String> = Vec::new();
    let mut paragraph_active = false;
    let mut paragraph_buf = String::new();
    let mut current_list: Option<&'static str> = None;
    let mut current_list_text: Option<String> = None;

    let mut children = markup.children();
    while let Some(child) = children.next() {
        match child.kind() {
            SyntaxKind::Parbreak => {
                finalize_paragraph_fn(&mut paragraph_active, &mut paragraph_buf, &mut results);
                finalize_list_fn(&mut current_list, &mut current_list_text, &mut results);
            }
            SyntaxKind::Hash => {
                if let Some(next) = children.next() {
                    if next.kind() == SyntaxKind::FuncCall {
                        if let Some(name) = callee_name_from_func_call(&next) {
                            if classify_callable(&name).is_some() {
                                finalize_paragraph_fn(
                                    &mut paragraph_active,
                                    &mut paragraph_buf,
                                    &mut results,
                                );
                                finalize_list_fn(
                                    &mut current_list,
                                    &mut current_list_text,
                                    &mut results,
                                );
                                let combined = format!("{}{}", node_text(&child), node_text(&next));
                                results.push(combined);
                                continue;
                            }
                        }
                    }

                    paragraph_active = true;
                    paragraph_buf.push_str(&node_text(&child));
                    paragraph_buf.push_str(&node_text(&next));
                } else {
                    paragraph_active = true;
                    paragraph_buf.push_str(&node_text(&child));
                }
            }
            SyntaxKind::Heading => {
                finalize_paragraph_fn(&mut paragraph_active, &mut paragraph_buf, &mut results);
                finalize_list_fn(&mut current_list, &mut current_list_text, &mut results);
                results.push(node_text(&child));
            }
            SyntaxKind::ListItem => {
                finalize_paragraph_fn(&mut paragraph_active, &mut paragraph_buf, &mut results);
                if current_list != Some("list") {
                    finalize_list_fn(&mut current_list, &mut current_list_text, &mut results);
                    current_list = Some("list");
                    current_list_text = Some(node_text(&child));
                } else if let Some(text) = &mut current_list_text {
                    text.push_str(&node_text(&child));
                }
            }
            SyntaxKind::EnumItem => {
                finalize_paragraph_fn(&mut paragraph_active, &mut paragraph_buf, &mut results);
                if current_list != Some("enum") {
                    finalize_list_fn(&mut current_list, &mut current_list_text, &mut results);
                    current_list = Some("enum");
                    current_list_text = Some(node_text(&child));
                } else if let Some(text) = &mut current_list_text {
                    text.push_str(&node_text(&child));
                }
            }
            SyntaxKind::TermItem => {
                finalize_paragraph_fn(&mut paragraph_active, &mut paragraph_buf, &mut results);
                if current_list != Some("terms") {
                    finalize_list_fn(&mut current_list, &mut current_list_text, &mut results);
                    current_list = Some("terms");
                    current_list_text = Some(node_text(&child));
                } else if let Some(text) = &mut current_list_text {
                    text.push_str(&node_text(&child));
                }
            }
            SyntaxKind::Equation => {
                if is_equation_block(&child) {
                    finalize_paragraph_fn(&mut paragraph_active, &mut paragraph_buf, &mut results);
                    finalize_list_fn(&mut current_list, &mut current_list_text, &mut results);
                    results.push(node_text(&child));
                } else {
                    paragraph_active = true;
                    paragraph_buf.push_str(&node_text(&child));
                }
            }
            SyntaxKind::Raw => {
                if is_raw_block(&child) {
                    finalize_paragraph_fn(&mut paragraph_active, &mut paragraph_buf, &mut results);
                    finalize_list_fn(&mut current_list, &mut current_list_text, &mut results);
                    results.push(node_text(&child));
                } else {
                    paragraph_active = true;
                    paragraph_buf.push_str(&node_text(&child));
                }
            }
            SyntaxKind::CodeBlock => {
                finalize_paragraph_fn(&mut paragraph_active, &mut paragraph_buf, &mut results);
                finalize_list_fn(&mut current_list, &mut current_list_text, &mut results);
                results.push(node_text(&child));
            }
            SyntaxKind::ContentBlock => {
                finalize_paragraph_fn(&mut paragraph_active, &mut paragraph_buf, &mut results);
                finalize_list_fn(&mut current_list, &mut current_list_text, &mut results);
                let inner = child.children().find(|n| n.kind() == SyntaxKind::Markup);
                if let Some(inner_markup) = inner {
                    results.extend(analyze_markup_node(&inner_markup));
                } else {
                    results.push(node_text(&child));
                }
            }
            SyntaxKind::FuncCall => {
                if let Some(name) = callee_name_from_func_call(&child) {
                    if let Some(_kind) = classify_callable(&name) {
                        finalize_paragraph_fn(
                            &mut paragraph_active,
                            &mut paragraph_buf,
                            &mut results,
                        );
                        finalize_list_fn(&mut current_list, &mut current_list_text, &mut results);
                        results.push(node_text(&child));
                    } else {
                        paragraph_active = true;
                        paragraph_buf.push_str(&node_text(&child));
                    }
                } else {
                    paragraph_active = true;
                    paragraph_buf.push_str(&node_text(&child));
                }
            }
            _ => {
                paragraph_active = true;
                paragraph_buf.push_str(&node_text(&child));
            }
        }
    }

    finalize_list_fn(&mut current_list, &mut current_list_text, &mut results);
    finalize_paragraph_fn(&mut paragraph_active, &mut paragraph_buf, &mut results);
    results
}

pub fn analyze_markup(root: &SyntaxNode) -> Vec<String> {
    if root.kind() == SyntaxKind::Markup {
        let linked = LinkedNode::new(root);
        analyze_markup_node(&linked)
    } else {
        let linked = LinkedNode::new(root);
        if let Some(markup) = linked.children().find(|n| n.kind() == SyntaxKind::Markup) {
            analyze_markup_node(&markup)
        } else {
            Vec::new()
        }
    }
}
