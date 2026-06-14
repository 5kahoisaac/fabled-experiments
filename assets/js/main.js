/* Renders the experiment showcase from window.EXPERIMENTS. */
(function () {
  "use strict";

  var experiments = Array.isArray(window.EXPERIMENTS) ? window.EXPERIMENTS : [];

  /** Escape user/data text before injecting into HTML. */
  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /** Build a single contender column. */
  function renderContender(c, isWinner) {
    var skill =
      c.skill && c.skill !== "—"
        ? '<span class="skill">+ ' + esc(c.skill) + "</span>"
        : "";

    var metrics = [
      ["Tokens", c.tokens],
      ["Est. cost", c.cost],
      ["Wall-clock", c.time],
      ["Prompts", c.prompts],
      ["Outcome", c.outcome],
    ]
      .map(function (row) {
        return (
          '<li><span class="k">' +
          esc(row[0]) +
          '</span><span class="v">' +
          esc(row[1]) +
          "</span></li>"
        );
      })
      .join("");

    var winFlag = isWinner ? '<span class="win-flag">★ Winner</span>' : "";

    // Markdown docs open through the in-browser viewer.
    var docLinks = "";
    if (c.spec) {
      docLinks +=
        '<a class="md-pill" href="viewer.html?doc=' +
        encodeURIComponent(c.spec) +
        '">SPEC.md</a>';
    }
    if (c.journey) {
      docLinks +=
        '<a class="md-pill" href="viewer.html?doc=' +
        encodeURIComponent(c.journey) +
        '">JOURNEY.md</a>';
    }

    // Coding agent + its plugins.
    var pluginChips = (c.plugins || [])
      .map(function (p) {
        return '<span class="chip">' + esc(p) + "</span>";
      })
      .join("");
    var agentBlock = c.agent
      ? '<div class="contender__agent">' +
        '<span class="agent-name">⌘ ' +
        esc(c.agent) +
        "</span>" +
        (pluginChips ? '<div class="chips">' + pluginChips + "</div>" : "") +
        "</div>"
      : "";

    // External reference links.
    var refLinks = (c.links || [])
      .map(function (lnk) {
        var href = /^(https?:|mailto:|#|\.|\/)/.test(lnk.url) ? lnk.url : "#";
        var ext = /^https?:/.test(href)
          ? ' target="_blank" rel="noopener"'
          : "";
        return (
          '<a class="ref-link" href="' +
          esc(href) +
          '"' +
          ext +
          ">" +
          esc(lnk.label) +
          " ↗</a>"
        );
      })
      .join("");

    return (
      '<div class="contender contender--' +
      esc(c.role) +
      (c.failed ? " contender--failed" : "") +
      (isWinner ? " contender--winner" : "") +
      '">' +
      '<p class="contender__role">' +
      esc(c.role) +
      "</p>" +
      '<h4 class="contender__label">' +
      esc(c.label) +
      "</h4>" +
      '<p class="contender__model">' +
      esc(c.model) +
      skill +
      "</p>" +
      agentBlock +
      winFlag +
      '<ul class="metrics">' +
      metrics +
      "</ul>" +
      '<a class="result-link' +
      (c.failed ? " result-link--report" : "") +
      '" href="' +
      esc(
        c.failed && c.report
          ? "viewer.html?doc=" + encodeURIComponent(c.report)
          : c.result
      ) +
      '">' +
      (c.failed && c.report ? "Read the report" : "View result") +
      ' <span class="arrow">→</span></a>' +
      (docLinks ? '<div class="md-pills">' + docLinks + "</div>" : "") +
      (refLinks ? '<div class="ref-links">' + refLinks + "</div>" : "") +
      "</div>"
    );
  }

  /** Build one experiment card. */
  function renderExperiment(exp) {
    var builds = exp.contenders || [];
    var columns = builds
      .map(function (c) {
        return renderContender(c, exp.winner === c.dir);
      })
      .join("");

    return (
      '<article class="exp reveal" id="' +
      esc(exp.id) +
      '">' +
      '<div class="exp__top">' +
      (exp.episode
        ? '<span class="exp__episode">' + esc(exp.episode) + "</span>"
        : "") +
      '<h3 class="exp__title">' +
      esc(exp.title) +
      "</h3>" +
      '<span class="exp__meta">' +
      esc(exp.date) +
      ' · <span class="exp__status" data-status="' +
      esc(exp.status) +
      '">' +
      esc(exp.status) +
      "</span></span>" +
      "</div>" +
      '<p class="exp__prompt"><b>Prompt:</b> ' +
      esc(exp.prompt) +
      "</p>" +
      '<div class="versus">' +
      columns +
      "</div>" +
      '<div class="exp__footer">' +
      (exp.doc
        ? '<a class="doc-link" href="' +
          esc(exp.doc) +
          '">Read the write-up <span class="arrow">→</span></a>'
        : "") +
      (exp.folder
        ? '<span class="exp__folder mono">' + esc(exp.folder) + "</span>"
        : "") +
      "</div>" +
      (exp.notes
        ? '<p class="exp__notes">' + esc(exp.notes) + "</p>"
        : "") +
      "</article>"
    );
  }

  /** Aggregate top-line stats for the hero. */
  function renderHeroStats() {
    var total = experiments.length;
    var ready = experiments.filter(function (e) {
      return e.status === "ready";
    }).length;
    var builds = experiments.reduce(function (n, e) {
      return n + (e.contenders ? (e.contenders.filter(c => !c.failed)).length : 0);
    }, 0);

    var stats = [
      [total, total === 1 ? "Experiment" : "Experiments"],
      [builds, "Project builds"],
      [ready, "Ready to view"],
      ["1", "Prompt each"],
    ];

    return stats
      .map(function (s) {
        return (
          '<div class="stat"><div class="stat__num">' +
          esc(s[0]) +
          '</div><div class="stat__label">' +
          esc(s[1]) +
          "</div></div>"
        );
      })
      .join("");
  }

  function mount() {
    var list = document.getElementById("experiment-list");
    var heroStats = document.getElementById("hero-stats");

    if (heroStats) heroStats.innerHTML = renderHeroStats();

    if (list) {
      if (!experiments.length) {
        list.innerHTML =
          '<p class="section-head__note">No experiments yet — add one to <code>assets/data/experiments.js</code>.</p>';
      } else {
        list.innerHTML = experiments.map(renderExperiment).join("");
      }
    }

    // Scroll reveal
    var reveals = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || !reveals.length) {
      reveals.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
