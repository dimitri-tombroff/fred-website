---
title: "Showcase"
description: "Fred in action — real screenshots of agent creation, platform features, and team administration."
summary: "Screenshots of Fred in action."
date: 2026-04-30T00:00:00+02:00
lastmod: 2026-09-22T00:00:00+02:00
draft: false
weight: 840
toc: false
sidebar:
  collapsed: false
seo:
  title: "Showcase — Fred"
  description: "Explore Fred through screenshots of agent creation, capabilities, models, knowledge bases, and team governance."
---

Explore Fred through real screenshots: select conversation resources, explore available data, manage platform features, enable agents and knowledge bases, configure models, create agents, and define team roles and responsibilities.

<style>
  /* Thumbnails — more vertical air + cleaner layout */
  .fred-thumbs {
    display:grid;
    gap: 22px;                           /* more space between rows */
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    max-width: 1120px;
    margin: 14px auto 28px;              /* extra bottom space */
    padding-bottom: 8px;
  }

  /* Each item stacks: [tile] then [caption] */
  .fred-thumbs > div {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .fred-thumb {
    position:relative; border-radius:12px; overflow:hidden;
    box-shadow:0 2px 10px rgba(0,0,0,.12);
    aspect-ratio: 16 / 10;
    background:#111;
    transition: box-shadow .18s ease, transform .18s ease;
  }
  .fred-thumb img {
    width:100%; height:100%; object-fit:cover; display:block;
    filter:saturate(1.02);
    transition: transform .18s ease, filter .18s ease;
  }
  .fred-thumb::after {
    content:"🔍"; position:absolute; right:10px; bottom:8px;
    font-size:18px; opacity:.0; transition:opacity .18s ease;
  }
  .fred-thumb:hover { box-shadow:0 6px 18px rgba(0,0,0,.20); transform: translateY(-1px); }
  .fred-thumb:hover img { transform: scale(1.03); filter:saturate(1.06); }
  .fred-thumb:hover::after { opacity:.9; }
  .fred-thumb:focus-visible { outline: 2px solid rgba(255,255,255,.6); outline-offset: 2px; }

  .fred-caption {
    margin: 8px 2px 0;                   /* add top margin so it never touches the tile */
    text-align:center;
    font-size:12px;
    line-height: 1.35;
    color:#666;
    min-height: 1.4em;                   /* prevents visual overlap on single-line captions */
  }

  /* Lightbox overlay (unchanged, included here for context if needed) */
  .fred-lightbox {
    position:fixed; inset:0; display:none; place-items:center;
    background:rgba(0,0,0,.85); z-index:9999;
  }
  .fred-lightbox.open { display:grid; }
  .fred-lightbox img {
    max-width:90vw; max-height:90vh; user-select:none;
    cursor: zoom-in; transition: transform .2s ease;
  }
  .fred-lightbox img.zoomed {
    cursor: zoom-out; max-width:none; max-height:none;
    transform: scale(1.4);
  }
  .fred-lightbox .ctrl {
    position:absolute; top:50%; transform:translateY(-50%);
    width:48px; height:48px; border:none; border-radius:999px;
    background:rgba(255,255,255,.14); backdrop-filter: blur(4px);
    display:grid; place-items:center; cursor:pointer;
  }
  .fred-lightbox .prev { left:16px; }
  .fred-lightbox .next { right:16px; }
  .fred-lightbox .close {
    top:16px; right:16px; transform:none; width:auto; height:auto; padding:8px 12px; border-radius:10px;
  }
  .fred-lightbox .ctrl span { color:#fff; font-size:22px; line-height:1; user-select:none; }
  .fred-lightbox .caption {
    position:absolute; left:0; right:0; bottom:16px; text-align:center;
    color:#fff; font-size:14px; opacity:.9; padding:0 24px;
  }
</style>

<div class="fred-thumbs" id="fredGallery">
  <div>
    <a class="fred-thumb" href="/images/new-conversation.png" data-caption="Starting a conversation with TheDoc and selecting a resource subfolder to define the accessible documents.">
      <img src="/images/new-conversation.png" alt="Selecting conversation resources" loading="lazy" decoding="async">
    </a>
    <div class="fred-caption">Selecting conversation resources</div>
  </div>
  <div>
    <a class="fred-thumb" href="/images/tabular-search.png" data-caption="Asking TheDoc what data is available in the selected folder, with a visible document-tree tool call listing PDF and CSV resources.">
      <img src="/images/tabular-search.png" alt="Exploring available data" loading="lazy" decoding="async">
    </a>
    <div class="fred-caption">Exploring available data</div>
  </div>
  <div>
    <a class="fred-thumb" href="/images/features.png" data-caption="Managing platform capabilities, default availability, and enablement by team.">
      <img src="/images/features.png" alt="Platform feature catalog" loading="lazy" decoding="async">
    </a>
    <div class="fred-caption">Platform feature catalog</div>
  </div>
  <div>
    <a class="fred-thumb" href="/images/enabling-agents.png" data-caption="Controlling which agent templates are available across the platform and to each team.">
      <img src="/images/enabling-agents.png" alt="Enabling agents by team" loading="lazy" decoding="async">
    </a>
    <div class="fred-caption">Enabling agents by team</div>
  </div>
  <div>
    <a class="fred-thumb" href="/images/models.png" data-caption="Managing model availability, reasoning options, and platform model bindings.">
      <img src="/images/models.png" alt="Model management" loading="lazy" decoding="async">
    </a>
    <div class="fred-caption">Model management</div>
  </div>
  <div>
    <a class="fred-thumb" href="/images/resources.png" data-caption="The default push mode: teams upload and organize documents in Resources. Fred indexes them in its internal corpus and makes them available to agents.">
      <img src="/images/resources.png" alt="Team resources: uploaded documents in the indexed corpus" loading="lazy" decoding="async">
    </a>
    <div class="fred-caption">Team resources — push mode</div>
  </div>
  <div>
    <a class="fred-thumb" href="/images/enabling-knowledge-bases.png" data-caption="Making Git repositories and WebDAV knowledge bases available to teams.">
      <img src="/images/enabling-knowledge-bases.png" alt="Enabling knowledge bases" loading="lazy" decoding="async">
    </a>
    <div class="fred-caption">Enabling knowledge bases</div>
  </div>
  <div>
    <a class="fred-thumb" href="/images/create-agents.png" data-caption="Choosing an agent template to create an assistant for your team.">
      <img src="/images/create-agents.png" alt="Creating an agent" loading="lazy" decoding="async">
    </a>
    <div class="fred-caption">Creating an agent</div>
  </div>
  <div>
    <a class="fred-thumb" href="/images/capabilities.png" data-caption="Selecting the resources and tools an agent can use, with optional folder restrictions.">
      <img src="/images/capabilities.png" alt="Agent capabilities" loading="lazy" decoding="async">
    </a>
    <div class="fred-caption">Agent capabilities</div>
  </div>
  <div>
    <a class="fred-thumb" href="/images/roles.png" data-caption="Assigning administrator, editor, and analyst roles to team members.">
      <img src="/images/roles.png" alt="Team roles" loading="lazy" decoding="async">
    </a>
    <div class="fred-caption">Team roles</div>
  </div>
  <div>
    <a class="fred-thumb" href="/images/responsabilities.png" data-caption="Reviewing the team administrator charter and responsibilities.">
      <img src="/images/responsabilities.png" alt="Team administrator responsibilities" loading="lazy" decoding="async">
    </a>
    <div class="fred-caption">Team administrator responsibilities</div>
  </div>
</div>


<div class="fred-lightbox" id="fredLightbox" aria-hidden="true">
  <button class="ctrl close" id="lbClose" aria-label="Close"><span>✕</span></button>
  <button class="ctrl prev" id="lbPrev" aria-label="Previous"><span>‹</span></button>
  <button class="ctrl next" id="lbNext" aria-label="Next"><span>›</span></button>
  <img id="lbImg" alt="">
  <div class="caption" id="lbCaption"></div>
</div>

<script>
(function() {
  const thumbs = Array.from(document.querySelectorAll('#fredGallery a'));
  const box = document.getElementById('fredLightbox');
  const img = document.getElementById('lbImg');
  const caption = document.getElementById('lbCaption');
  const btnPrev = document.getElementById('lbPrev');
  const btnNext = document.getElementById('lbNext');
  const btnClose = document.getElementById('lbClose');
  let idx = 0;

  function openAt(i) {
    idx = i;
    const a = thumbs[idx];
    img.src = a.getAttribute('href');
    img.alt = a.querySelector('img')?.alt || '';
    caption.textContent = a.getAttribute('data-caption') || img.alt || '';
    img.classList.remove('zoomed');
    box.classList.add('open');
    box.setAttribute('aria-hidden', 'false');
  }
  function close() {
    box.classList.remove('open');
    box.setAttribute('aria-hidden', 'true');
    img.src = '';
    img.classList.remove('zoomed');
  }
  function prev() { openAt((idx - 1 + thumbs.length) % thumbs.length); }
  function next() { openAt((idx + 1) % thumbs.length); }

  // Thumb click
  thumbs.forEach((a, i) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      openAt(i);
    });
  });

  // Controls
  btnPrev.addEventListener('click', prev);
  btnNext.addEventListener('click', next);
  btnClose.addEventListener('click', close);

  // Click outside to close; click image to zoom
  box.addEventListener('click', (e) => {
    if (e.target === box || e.target === caption) close();
  });
  img.addEventListener('click', (e) => {
    e.stopPropagation();
    img.classList.toggle('zoomed');
  });

  // Keyboard: ESC, arrows
  window.addEventListener('keydown', (e) => {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') prev();
    else if (e.key === 'ArrowRight') next();
  });
})();
</script>
