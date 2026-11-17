(() => {
  const WHATSAPP = '553498880748';

  // Topo fica sólido ao rolar
  const topo = document.getElementById('topo');
  const atualizarTopo = () => topo.classList.toggle('rolou', window.scrollY > 40);
  atualizarTopo();
  window.addEventListener('scroll', atualizarTopo, { passive: true });

  // Menu do celular
  const botaoMenu = document.querySelector('.menu-btn');
  const menu = document.getElementById('menu');
  const fecharMenu = () => {
    menu.classList.remove('aberto');
    botaoMenu.setAttribute('aria-expanded', 'false');
    botaoMenu.setAttribute('aria-label', 'Abrir menu');
  };
  botaoMenu.addEventListener('click', () => {
    const abrir = !menu.classList.contains('aberto');
    menu.classList.toggle('aberto', abrir);
    botaoMenu.setAttribute('aria-expanded', String(abrir));
    botaoMenu.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
    if (abrir) topo.classList.add('rolou'); else atualizarTopo();
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', fecharMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharMenu(); });

  // Animação de entrada
  const itens = document.querySelectorAll('.revelar');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entradas => {
      entradas.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('visivel'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    itens.forEach(el => obs.observe(el));
  } else {
    itens.forEach(el => el.classList.add('visivel'));
  }

  // Contador dos números
  const formatar = n => n.toLocaleString('pt-BR');
  const contadores = document.querySelectorAll('[data-contar]');
  const animarNumero = el => {
    const alvo = Number(el.dataset.contar);
    const sufixo = el.querySelector('em')?.outerHTML || '';
    const inicio = performance.now();
    const duracao = 1400;
    const passo = agora => {
      const t = Math.min((agora - inicio) / duracao, 1);
      const suave = 1 - Math.pow(1 - t, 3);
      el.innerHTML = formatar(Math.round(alvo * suave)) + (alvo < 100 ? ' ' : '') + sufixo;
      if (t < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const obsNum = new IntersectionObserver(entradas => {
      entradas.forEach(en => {
        if (en.isIntersecting) { animarNumero(en.target); obsNum.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    contadores.forEach(el => obsNum.observe(el));
  }

  // Formulário -> mensagem pronta no WhatsApp
  const form = document.getElementById('form-orcamento');
  const erro = document.getElementById('form-erro');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const dados = new FormData(form);
    const nome = (dados.get('nome') || '').trim();
    if (!nome) {
      erro.hidden = false;
      form.querySelector('[name="nome"]').focus();
      return;
    }
    erro.hidden = true;

    const dataBruta = dados.get('data');
    const data = dataBruta ? dataBruta.split('-').reverse().join('/') : 'a definir';
    const linhas = [
      `Olá, Sandra! Meu nome é ${nome}.`,
      `Gostaria de um orçamento para: ${dados.get('tipo')}.`,
      `Data prevista: ${data}.`,
      dados.get('whatsapp') ? `Meu WhatsApp: ${dados.get('whatsapp')}.` : '',
      dados.get('mensagem') ? `\n${dados.get('mensagem').trim()}` : ''
    ].filter(Boolean);

    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(linhas.join('\n'))}`;
    window.open(url, '_blank', 'noopener');
  });

  // Ano do rodapé
  document.getElementById('ano').textContent = new Date().getFullYear();
})();

/* ===== Efeitos elegantes ===== */
(() => {
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Título da abertura palavra por palavra (preserva o <em>)
  const h1 = document.querySelector('.hero h1');
  if (h1 && !calmo) {
    let i = 0;
    const embrulhar = no => {
      [...no.childNodes].forEach(filho => {
        if (filho.nodeType === 3) {
          const frag = document.createDocumentFragment();
          filho.textContent.split(/(\s+)/).forEach(parte => {
            if (!parte) return;
            if (/^\s+$/.test(parte)) { frag.appendChild(document.createTextNode(' ')); return; }
            const p = document.createElement('span'); p.className = 'palavra';
            const d = document.createElement('span'); d.textContent = parte; d.style.setProperty('--i', i++);
            p.appendChild(d); frag.appendChild(p);
          });
          filho.replaceWith(frag);
        } else if (filho.nodeType === 1) embrulhar(filho);
      });
    };
    h1.setAttribute('aria-label', h1.textContent.replace(/\s+/g, ' ').trim());
    embrulhar(h1);
    requestAnimationFrame(() => requestAnimationFrame(() => h1.classList.add('titulo-pronto')));
  }

  // Fotos com efeito de cortina
  const fotos = document.querySelectorAll('.sobre__foto, .servicos__foto, .momentos figure');
  fotos.forEach(f => {
    const img = f.querySelector('img'); if (!img) return;
    const box = document.createElement('div'); box.className = 'foto-cortina';
    img.replaceWith(box); box.appendChild(img);
  });
  const cortinas = document.querySelectorAll('.foto-cortina');
  if ('IntersectionObserver' in window && !calmo) {
    const obs = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visivel'); obs.unobserve(e.target); }
    }), { threshold: 0.2 });
    cortinas.forEach(c => obs.observe(c));
  } else cortinas.forEach(c => c.classList.add('visivel'));

  // Rótulos soltos (fora de um bloco .revelar) também desenham o fio
  document.querySelectorAll('.rotulo').forEach(r => {
    if (!r.closest('.revelar')) r.classList.add('visivel');
  });

  if (calmo) return;

  // Barra de progresso + parallax leve
  const barra = document.getElementById('progresso');
  const heroFoto = document.querySelector('.hero__foto');
  const desktop = matchMedia('(min-width: 768px)');
  let pedido = false;
  const quadro = () => {
    pedido = false;
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    barra.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (heroFoto && y < innerHeight * 1.2) {
      heroFoto.style.translate = `0 ${y * (desktop.matches ? 0.3 : 0.15)}px`;
    }
    if (desktop.matches) {
      document.querySelectorAll('.servicos__foto .foto-cortina, .sobre__foto .foto-cortina').forEach(el => {
        const r = el.getBoundingClientRect();
        const centro = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        el.style.translate = `0 ${centro * -30}px`;
      });
    }
  };
  addEventListener('scroll', () => { if (!pedido) { pedido = true; requestAnimationFrame(quadro); } }, { passive: true });
  addEventListener('resize', quadro);
  quadro();
})();
