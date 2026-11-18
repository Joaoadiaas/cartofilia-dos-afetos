// Cartofilia dos Afetos — interações do site
document.documentElement.classList.add('js');
const temIO = 'IntersectionObserver' in window;
const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Entrada dos blocos ---------- */
const reveals = document.querySelectorAll('.reveal');
if (temIO) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visivel'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('visivel'));
}

/* ---------- Menu ---------- */
const topo = document.querySelector('.topo');
const menu = document.getElementById('menu');
const botaoMenu = document.querySelector('.menu-botao');
const fecharMenu = () => { menu.classList.remove('aberto'); botaoMenu.setAttribute('aria-expanded', 'false'); };
botaoMenu.addEventListener('click', () => {
  const abrir = !menu.classList.contains('aberto');
  menu.classList.toggle('aberto', abrir);
  botaoMenu.setAttribute('aria-expanded', String(abrir));
});
menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', fecharMenu));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharMenu(); });

// Link ativo conforme a seção visível
const links = [...menu.querySelectorAll('a')];
if (temIO) {
  const so = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((l) => l.classList.toggle('ativo', l.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach((l) => { const s = document.querySelector(l.getAttribute('href')); if (s) so.observe(s); });
}

/* ---------- Progresso, sombra do menu, botão de voltar ---------- */
const barra = document.querySelector('.progresso');
const voltar = document.querySelector('.voltar');
let pendente = false;
const aoRolar = () => {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  barra.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
  topo.classList.toggle('rolou', y > 10);
  voltar.classList.toggle('mostrar', y > window.innerHeight * 1.2);
  pendente = false;
};
window.addEventListener('scroll', () => { if (!pendente) { pendente = true; requestAnimationFrame(aoRolar); } }, { passive: true });
aoRolar();

/* ---------- Vídeos ---------- */
const videos = [...document.querySelectorAll('.js-video')];
const atualizaBotao = (b, ligado) => {
  b.setAttribute('aria-pressed', String(ligado));
  b.textContent = ligado ? 'Desativar som' : 'Ativar som';
  b.setAttribute('aria-label', ligado ? 'Desativar som do vídeo' : 'Ativar som do vídeo');
};
videos.forEach((v) => {
  const botao = v.parentElement.querySelector('.som');
  if (reduz) { v.removeAttribute('autoplay'); v.pause(); v.controls = true; }
  v.addEventListener('loadedmetadata', () => {
    const semAudio = v.mozHasAudio === false || (typeof v.audioTracks !== 'undefined' && v.audioTracks.length === 0);
    if (semAudio && botao) botao.hidden = true;
  });
  if (!botao) return;
  botao.addEventListener('click', () => {
    const ligar = v.muted;
    videos.forEach((o) => { o.muted = true; const b = o.parentElement.querySelector('.som'); if (b) atualizaBotao(b, false); });
    if (ligar) { v.muted = false; v.play().catch(() => {}); atualizaBotao(botao, true); }
  });
});
if (temIO && !reduz) {
  const vo = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) e.target.play().catch(() => {}); else e.target.pause(); });
  }, { threshold: 0.2 });
  videos.forEach((v) => vo.observe(v));
}

/* ---------- Antes e depois ---------- */
document.querySelectorAll('.comparacao').forEach((c) => {
  const controle = c.querySelector('.comparacao__controle');
  const depois = c.querySelector('.comparacao__depois');
  const aplica = () => c.style.setProperty('--pos', controle.value + '%');
  controle.addEventListener('input', aplica);
  aplica();
  // Se a foto atual ainda não estiver na pasta, mostra só o cartão-postal
  const semFoto = () => c.classList.add('sem-foto');
  if (depois.complete && depois.naturalWidth === 0) semFoto();
  depois.addEventListener('error', semFoto);
});
