"""Convert the observed WordPress practice-area HTML into Sanity Portable Text.

Only the markup present in the audited 28 pages is accepted. An unfamiliar tag or
text-loss check fails the plan rather than silently dropping source content.
"""

from __future__ import annotations

import html
import json
import re
import sys
from html.parser import HTMLParser

INLINE = {"strong": "strong", "b": "strong", "em": "em", "i": "em", "u": "underline"}
CONTAINERS = {"root", "section", "div"}
ALLOWED = CONTAINERS | {"p", "ul", "ol", "li", "br"} | set(INLINE)
WORD = re.compile(r"\w+", re.UNICODE)


class Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = {"tag": "root", "children": []}
        self.stack = [self.root]
        self.unsupported = set()

    def handle_starttag(self, tag, attrs):
        if tag not in ALLOWED:
            self.unsupported.add(tag)
        node = {"tag": tag, "children": []}
        self.stack[-1]["children"].append(node)
        if tag != "br":
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag != "br":
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index]["tag"] == tag:
                self.stack = self.stack[:index]
                return

    def handle_data(self, data):
        self.stack[-1]["children"].append(data)


def plain(node):
    if isinstance(node, str):
        return node
    separator = " " if node["tag"] in {"br", "p", "li", "ul", "ol", "section", "div"} else ""
    return separator + "".join(plain(child) for child in node["children"]) + separator


def normalized_words(value):
    return [word.casefold() for word in WORD.findall(html.unescape(value))]


class Converter:
    def __init__(self):
        self.counter = 0
        self.blocks = []
        self.issues = []

    def key(self):
        self.counter += 1
        return f"k{self.counter:06d}"

    def inline(self, node, marks=()):
        if isinstance(node, str):
            return [(node, marks)]
        tag = node["tag"]
        if tag == "br":
            return [(None, ())]
        next_marks = marks + (INLINE[tag],) if tag in INLINE and INLINE[tag] not in marks else marks
        result = []
        for child in node["children"]:
            result.extend(self.inline(child, next_marks))
        return result

    @staticmethod
    def clean(segments):
        merged = []
        for value, marks in segments:
            value = re.sub(r"\s+", " ", value or "")
            if not value:
                continue
            if merged and merged[-1][1] == marks:
                merged[-1] = (merged[-1][0] + value, marks)
            else:
                merged.append((value, marks))
        if merged:
            merged[0] = (merged[0][0].lstrip(), merged[0][1])
            merged[-1] = (merged[-1][0].rstrip(), merged[-1][1])
        return [(value, marks) for value, marks in merged if value]

    def block(self, segments, style="normal", list_item=None):
        segments = self.clean(segments)
        if not segments:
            return
        children = [
            {"_type": "span", "_key": self.key(), "text": value, "marks": list(marks)}
            for value, marks in segments
        ]
        block = {"_type": "block", "_key": self.key(), "style": style, "markDefs": [], "children": children}
        if list_item:
            block.update({"listItem": list_item, "level": 1})
        self.blocks.append(block)

    def paragraph(self, node):
        parts = []
        for child in node["children"]:
            parts.extend(self.inline(child))
        lines = [[]]
        for value, marks in parts:
            if value is None:
                lines.append([])
            else:
                lines[-1].append((value, marks))
        for line in lines:
            line = self.clean(line)
            if not line:
                continue
            value = "".join(text for text, _ in line)
            if value.startswith("•"):
                first, marks = line[0]
                line[0] = (first.lstrip("• "), marks)
                self.block(line, list_item="bullet")
            elif all("strong" in marks for _, marks in line):
                self.block([(text, tuple(mark for mark in marks if mark != "strong")) for text, marks in line], style="h2")
            else:
                self.block(line)

    def walk(self, node):
        if isinstance(node, str):
            if node.strip():
                self.issues.append("text outside a paragraph or list")
            return
        tag = node["tag"]
        if tag in CONTAINERS:
            if tag != "root" and plain(node).strip():
                self.issues.append(f"nonempty {tag} wrapper requires review")
            for child in node["children"]:
                self.walk(child)
        elif tag == "p":
            self.paragraph(node)
        elif tag in {"ul", "ol"}:
            for child in node["children"]:
                if isinstance(child, str):
                    if child.strip():
                        self.issues.append("text outside a list item")
                elif child["tag"] == "li":
                    self.block(self.inline(child), list_item="bullet" if tag == "ul" else "number")
                else:
                    self.issues.append(f"unexpected {child['tag']} in {tag}")
        else:
            self.issues.append(f"unexpected top-level {tag}")


def convert(source_html):
    tree = Tree()
    tree.feed(source_html)
    converter = Converter()
    converter.walk(tree.root)
    source_words = normalized_words(plain(tree.root))
    converted_words = normalized_words(" ".join(
        span["text"] for block in converter.blocks for span in block["children"]
    ))
    # A printed bullet becomes a Portable Text list marker, not document text.
    source_words = [word for word in source_words if word != "•"]
    if source_words != converted_words:
        converter.issues.append("text-loss check failed")
    if tree.unsupported:
        converter.issues.append("unsupported tags: " + ", ".join(sorted(tree.unsupported)))
    return {"body": converter.blocks, "issues": sorted(set(converter.issues)), "sourceWordCount": len(source_words)}


if __name__ == "__main__":
    request = json.load(sys.stdin)
    output = [convert(item["contentHtml"]) for item in request]
    json.dump(output, sys.stdout, ensure_ascii=False)
