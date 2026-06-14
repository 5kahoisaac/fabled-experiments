/* Minimal, self-contained Markdown viewer — no external dependencies.
 * Loads the file named by ?doc=<relative .md path> and renders it.
 * Supports: headings, bold/italic, inline + fenced code, lists, blockquotes,
 * tables, horizontal rules, links, and paragraphs.
 */
(function () {
  "use strict";

  /* ---------------------------------------------------------------- helpers */
  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /** Inline formatting on already-escaped text. */
  function inline(text) {
    return text
      // inline code first (protect its contents)
      .replace(/`([^`]+)`/g, function (_, c) {
        return "<code>" + c + "</code>";
      })
      // images ![alt](src)
      .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (_, alt, src) {
        return '<img alt="' + alt + '" src="' + src + '" />';
      })
      // links [text](href)
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, t, href) {
        var safe = /^(https?:|mailto:|#|\.|\/)/.test(href) ? href : "#";
        var ext = /^https?:/.test(safe) ? ' target="_blank" rel="noopener"' : "";
        return '<a href="' + safe + '"' + ext + ">" + t + "</a>";
      })
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
      .replace(/_([^_]+)_/g, "<em>$1</em>");
  }

  function isTableSep(line) {
    return /^\s*\|?[\s:-]*-[\s:|-]*\|?\s*$/.test(line) && line.indexOf("-") !== -1;
  }

  function splitRow(line) {
    return line
      .replace(/^\s*\|/, "")
      .replace(/\|\s*$/, "")
      .split("|")
      .map(function (c) {
        return c.trim();
      });
  }

  /* ------------------------------------------------------------- the parser */
  function render(md) {
    var lines = md.replace(/\r\n?/g, "\n").split("\n");
    var html = [];
    var i = 0;

    function flushParagraph(buf) {
      if (buf.length) html.push("<p>" + inline(esc(buf.join(" "))) + "</p>");
      buf.length = 0;
    }

    var para = [];

    while (i < lines.length) {
      var line = lines[i];

      // fenced code
      if (/^```/.test(line)) {
        flushParagraph(para);
        var code = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) {
          code.push(esc(lines[i]));
          i++;
        }
        i++; // closing fence
        html.push("<pre><code>" + code.join("\n") + "</code></pre>");
        continue;
      }

      // table (header row followed by separator)
      if (line.indexOf("|") !== -1 && i + 1 < lines.length && isTableSep(lines[i + 1])) {
        flushParagraph(para);
        var headers = splitRow(line);
        i += 2;
        var rows = [];
        while (i < lines.length && lines[i].indexOf("|") !== -1 && lines[i].trim() !== "") {
          rows.push(splitRow(lines[i]));
          i++;
        }
        var t = "<table><thead><tr>";
        headers.forEach(function (h) {
          t += "<th>" + inline(esc(h)) + "</th>";
        });
        t += "</tr></thead><tbody>";
        rows.forEach(function (r) {
          t += "<tr>";
          r.forEach(function (c) {
            t += "<td>" + inline(esc(c)) + "</td>";
          });
          t += "</tr>";
        });
        t += "</tbody></table>";
        html.push(t);
        continue;
      }

      // heading
      var h = /^(#{1,6})\s+(.*)$/.exec(line);
      if (h) {
        flushParagraph(para);
        var lvl = h[1].length;
        html.push("<h" + lvl + ">" + inline(esc(h[2])) + "</h" + lvl + ">");
        i++;
        continue;
      }

      // horizontal rule
      if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
        flushParagraph(para);
        html.push("<hr />");
        i++;
        continue;
      }

      // blockquote
      if (/^\s*>\s?/.test(line)) {
        flushParagraph(para);
        var quote = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
          quote.push(lines[i].replace(/^\s*>\s?/, ""));
          i++;
        }
        html.push("<blockquote>" + inline(esc(quote.join(" "))) + "</blockquote>");
        continue;
      }

      // lists (grouped runs of ordered or unordered items)
      if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
        flushParagraph(para);
        var ordered = /^\s*\d+\.\s+/.test(line);
        var tag = ordered ? "ol" : "ul";
        var items = [];
        while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^\s*([-*+]|\d+\.)\s+/, ""));
          i++;
        }
        html.push(
          "<" +
            tag +
            ">" +
            items
              .map(function (it) {
                return "<li>" + inline(esc(it)) + "</li>";
              })
              .join("") +
            "</" +
            tag +
            ">"
        );
        continue;
      }

      // blank line ends a paragraph
      if (line.trim() === "") {
        flushParagraph(para);
        i++;
        continue;
      }

      // default: accumulate paragraph text
      para.push(line.trim());
      i++;
    }
    flushParagraph(para);
    return html.join("\n");
  }

  /* --------------------------------------------------------------- bootstrap */
  function getParam(name) {
    var m = new RegExp("[?&]" + name + "=([^&]*)").exec(window.location.search);
    return m ? decodeURIComponent(m[1]) : "";
  }

  function fail(el, msg) {
    el.innerHTML = '<p class="md-error">' + esc(msg) + "</p>";
  }

  function boot() {
    var body = document.getElementById("md-body");
    var pathEl = document.getElementById("md-path");
    var doc = getParam("doc");

    if (!doc) {
      fail(body, "No document specified. Use viewer.html?doc=path/to/file.md");
      return;
    }
    // Safety: local markdown only, no remote, no traversal.
    if (
      /^https?:/i.test(doc) ||
      doc.indexOf("..") !== -1 ||
      !/\.md$/i.test(doc)
    ) {
      fail(body, "Refusing to load: " + doc);
      return;
    }

    if (pathEl) pathEl.textContent = doc;
    document.title = doc.split("/").pop() + " · viewer";

    fetch(doc)
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      })
      .then(function (text) {
        body.innerHTML = render(text);
      })
      .catch(function (err) {
        fail(
          body,
          "Could not load " +
            doc +
            " (" +
            err.message +
            "). Tip: serve the folder (python3 -m http.server) — file:// blocks fetch."
        );
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
