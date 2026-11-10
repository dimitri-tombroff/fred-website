(() => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const progress = document.getElementById('progress');
  const counter = document.getElementById('counter');
  const notes = document.getElementById('notes');
  const notesContent = document.getElementById('notes-content');
  const previous = document.getElementById('prevzone');
  const next = document.getElementById('nextzone');
  let index = 0;

  function readHash() {
    const number = Number.parseInt(location.hash.slice(1), 10);
    return Number.isFinite(number) ? number - 1 : 0;
  }
  function show(i) {
    index = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach((slide, n) => {
      slide.classList.toggle('active', n === index);
      slide.setAttribute('aria-hidden', String(n !== index));
      slide.inert = n !== index;
    });
    progress.style.width = `${(index + 1) / slides.length * 100}%`;
    counter.textContent = `${index + 1} / ${slides.length}`;
    previous.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    history.replaceState(null, '', `#${index + 1}`);
    notesContent.innerHTML = slides[index].querySelector('.speaker-notes').innerHTML;
  }
  function fit() {
    const scale = Math.min(innerWidth / 1320, innerHeight / 760);
    slides.forEach(slide => { slide.style.transform = `translate(-50%, -50%) scale(${scale})`; });
  }
  function toggleNotes() {
    if (notes.open) notes.close();
    else notes.showModal();
  }
  document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.key.toLowerCase() === 'n') { event.preventDefault(); toggleNotes(); return; }
    if (notes.open || event.target.closest('input, textarea, select, [contenteditable]')) return;
    if (event.key === ' ' && event.target.closest('a, button')) return;
    if (['ArrowRight', ' ', 'PageDown'].includes(event.key)) { event.preventDefault(); show(index + 1); }
    else if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); show(index - 1); }
    else if (event.key === 'Home') { event.preventDefault(); show(0); }
    else if (event.key === 'End') { event.preventDefault(); show(slides.length - 1); }
    else if (event.key.toLowerCase() === 'f') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen().catch(() => {});
    }
  });
  previous.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  document.getElementById('notes-toggle').addEventListener('click', toggleNotes);
  document.getElementById('close-notes').addEventListener('click', () => notes.close());
  window.addEventListener('hashchange', () => show(readHash()));
  window.addEventListener('resize', fit);
  fit();
  show(readHash());
})();
