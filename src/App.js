import { useEffect, useRef, useState } from 'react';
import logo from './assets/img/clara-nail-logo.png';
import portfolio1 from './assets/img/portfolio1.png';
import portfolio2 from './assets/img/portfolio2.png';
import portfolio3 from './assets/img/portfolio3.png';
import portfolio4 from './assets/img/portfolio4.png';
import portfolio5 from './assets/img/portfolio5.png';
import portfolio6 from './assets/img/portfolio6.png';
import { whatsappUrl } from './config';
import './App.css';

const works = [
  { image: portfolio2, name: 'Um toque de magia', detail: 'Rosa, brilho & detalhes dourados', alt: 'Unhas amendoadas com esmalte rosa brilhante, luas e estrelas douradas' },
  { image: portfolio3, name: 'Delicada e marcante', detail: 'Francesinha preta & laços', alt: 'Unhas com francesinha preta, pequenos desenhos florais e laços brancos' },
  { image: portfolio1, name: 'Brilho que encanta', detail: 'Azul metalizado & estrelas', alt: 'Unhas longas em azul metalizado com detalhes de estrelas prateadas' },
  { image: portfolio4, name: 'Cheia de personalidade', detail: 'Vermelho profundo & prata', alt: 'Unhas vermelhas e nude com nail art em prata' },
  { image: portfolio5, name: 'Romance nos detalhes', detail: 'Laços, pérolas & francesinha', alt: 'Unhas com francesinha preta, laços cor-de-rosa e aplicações de pérolas' },
  { image: portfolio6, name: 'O clássico que fica', detail: 'Vermelho & acabamento delicado', alt: 'Unhas quadradas esmaltadas em vermelho vivo' },
];

function Icon({ name, size = 22, ...props }) {
  const paths = {
    arrow: <path d="M4 12h15M13 5l7 7-7 7" />,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
    sparkle: <><path d="m12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6L12 3Z" /><path d="m20 2 .6 1.4L22 4l-1.4.6L20 6l-.6-1.4L18 4l1.4-.6L20 2Z" /></>,
    flower: <><path d="M12 8c-6-9-12 1-5 4-7 3-1 13 5 4 6 9 12-1 5-4 7-3 1-13-5-4Z" /><circle cx="12" cy="12" r="2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    expand: <path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7" />,
    whatsapp: <><path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.4-4.8A8.5 8.5 0 1 1 20.5 11.6Z" /><path d="M8.2 7.3c-.6 0-1.1.8-1.1 1.6 0 2.5 3.8 6.2 6.3 6.2.9 0 1.8-.5 1.8-1.2l-2.1-1.2-.9.9a7.7 7.7 0 0 1-3.1-3.1l.9-.9-1.1-2.3Z" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.sparkle}</svg>;
}

function WhatsAppButton({ children = 'Agendar meu horário', className = '' }) {
  return <a className={`button button-primary ${className}`} href={whatsappUrl} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={21} />{children}<Icon name="arrow" size={18} /></a>;
}

function Brand() {
  return <a className="brand" href="#inicio" aria-label="Clara Nail Designer — início"><img src={logo} alt="Clara Nail Designer" width="500" height="500" /></a>;
}

function Portfolio() {
  const trackRef = useRef(null);
  const dialogRef = useRef(null);
  const [position, setPosition] = useState({ index: 0, total: works.length, start: true, end: false, progress: 0 });
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const track = trackRef.current;
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const step = track.children[1].offsetLeft - track.children[0].offsetLeft;
      const total = Math.round(max / step) + 1;
      setPosition({ index: Math.round(track.scrollLeft / step), total, start: track.scrollLeft < 5, end: track.scrollLeft >= max - 5, progress: max > 0 ? track.scrollLeft / max : 1 });
    };
    update();
    track.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(track);
    return () => { track.removeEventListener('scroll', update); observer.disconnect(); };
  }, []);

  useEffect(() => {
    if (selected === null) return undefined;
    dialogRef.current.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [selected]);

  const move = (direction) => {
    const track = trackRef.current;
    const step = track.children[1].offsetLeft - track.children[0].offsetLeft;
    track.scrollBy({ left: direction * step, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  const close = () => { dialogRef.current.close(); setSelected(null); };
  const nextPhoto = (direction) => setSelected(current => (current + direction + works.length) % works.length);

  return <section className="portfolio section-space" id="portfolio" aria-labelledby="portfolio-title">
    <div className="container">
      <div className="section-heading portfolio-heading">
        <div><span className="eyebrow"><span />FEITAS COM CARINHO</span><h2 id="portfolio-title">Pequenos detalhes.<br /><em>Grandes encantos.</em></h2></div>
        <p>Cada unha, uma forma de se expressar.<br />Encontre a inspiração que combina com você.</p>
      </div>
      <div className="portfolio-track" ref={trackRef} role="region" aria-roledescription="carrossel" aria-label="Portfólio de unhas" tabIndex="0" onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); } }}>
        {works.map((work, index) => <article className="work-card" key={work.name} aria-label={`${index + 1} de ${works.length}`}>
          <button className="work-image" onClick={() => setSelected(index)} aria-label={`Ampliar foto: ${work.name}`}><img src={work.image} alt={work.alt} loading="lazy" width="760" height="840" /><span className="image-number">0{index + 1}</span><span className="image-expand"><Icon name="expand" size={20} /></span></button>
          <div className="work-caption"><div><h3>{work.name}</h3><p>{work.detail}</p></div><Icon name="sparkle" size={22} /></div>
        </article>)}
      </div>
      <div className="carousel-footer"><span className="carousel-hint">Um pouquinho do que podemos criar juntas</span><div className="carousel-controls"><span className="carousel-count" aria-live="polite">0{position.index + 1}<span> / {String(position.total).padStart(2, '0')}</span></span><div className="carousel-progress"><span style={{ transform: `translateX(${position.progress * 200}%)` }} /></div><button className="round-button previous" onClick={() => move(-1)} disabled={position.start} aria-label="Fotos anteriores"><Icon name="arrow" /></button><button className="round-button" onClick={() => move(1)} disabled={position.end} aria-label="Próximas fotos"><Icon name="arrow" /></button></div></div>
    </div>
    <dialog className="lightbox" ref={dialogRef} aria-label="Foto ampliada do portfólio" onClose={() => setSelected(null)} onClick={event => { if (event.target === event.currentTarget) close(); }} onKeyDown={event => { if (event.key === 'ArrowRight') { event.preventDefault(); nextPhoto(1); } if (event.key === 'ArrowLeft') { event.preventDefault(); nextPhoto(-1); } }}>
      {selected !== null && <div className="lightbox-content"><button className="lightbox-close round-button" onClick={close} autoFocus aria-label="Fechar foto ampliada"><Icon name="close" /></button><img src={works[selected].image} alt={works[selected].alt} /><div className="lightbox-caption"><button className="round-button previous" onClick={() => nextPhoto(-1)} aria-label="Foto anterior"><Icon name="arrow" /></button><div><h3>{works[selected].name}</h3><span>{selected + 1} / {works.length}</span></div><button className="round-button" onClick={() => nextPhoto(1)} aria-label="Próxima foto"><Icon name="arrow" /></button></div></div>}
    </dialog>
  </section>;
}

const questions = [
  ['Como faço para agendar?', 'É só tocar em um dos botões de WhatsApp e me chamar. A gente conversa sobre o que você deseja e combina o melhor dia e horário disponível.'],
  ['Posso levar uma foto de inspiração?', 'Claro! Pode me enviar sua inspiração pelo WhatsApp. Vamos conversar sobre as cores, o formato e os detalhes para criar uma versão que combine com você.'],
  ['Ainda não sei qual estilo escolher. Você me ajuda?', 'Sim! Você não precisa chegar com tudo decidido. Me conte o que você gosta e como é a sua rotina. A gente pensa juntas nas possibilidades.'],
  ['Como consulto os valores e a duração do atendimento?', 'Me chama no WhatsApp e conta qual resultado você tem em mente. Assim, posso te passar os valores e o tempo previsto para o seu atendimento.'],
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  return <>
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <div className="announcement"><Icon name="sparkle" size={14} /><span>Um momento seu. Um cuidado em cada detalhe.</span><Icon name="sparkle" size={14} /></div>
    <header className="site-header"><div className="container header-inner"><Brand /><nav className={menuOpen ? 'navigation is-open' : 'navigation'} id="main-navigation" aria-label="Menu principal"><a href="#inicio" onClick={() => setMenuOpen(false)}>Início</a><a href="#portfolio" onClick={() => setMenuOpen(false)}>Portfólio</a><a href="#sobre" onClick={() => setMenuOpen(false)}>Meu cuidado</a><a href="#duvidas" onClick={() => setMenuOpen(false)}>Dúvidas</a><a className="mobile-contact" href={whatsappUrl} target="_blank" rel="noopener noreferrer">Agendar pelo WhatsApp</a></nav><a className="header-cta" href={whatsappUrl} target="_blank" rel="noopener noreferrer">Vamos agendar?<Icon name="arrow" size={18} /></a><button className="menu-toggle" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? 'close' : 'menu'} /></button></div></header>
    <main id="conteudo">
      <section className="hero" id="inicio"><div className="container hero-inner">
        <div className="hero-copy"><span className="eyebrow"><span />CLARA NAIL DESIGNER</span><h1>Suas unhas,<br />um toque de<br /><em>quem você é.</em><span className="heading-sparkle" aria-hidden="true">✧</span></h1><p>Mais que unhas bonitas, um momento para você.<br className="desktop-break" /> Cuidado, carinho e detalhes que fazem você<br className="desktop-break" /> se sentir ainda mais linda.</p><div className="hero-actions"><WhatsAppButton /><a className="text-link" href="#portfolio">Conhecer meu trabalho<Icon name="arrow" size={18} /></a></div><div className="hero-note"><span className="little-heart"><Icon name="heart" size={18} /></span>Feito com calma. Pensado em você.</div></div>
        <div className="hero-visual"><div className="hero-photo-frame"><img className="hero-photo" src={portfolio2} alt="Nail art da Clara: unhas rosas com brilho e delicadas estrelas douradas" width="603" height="830" fetchPriority="high" /><span className="photo-label"><span />BELEZA EM CADA DETALHE</span></div><div className="hero-inset"><img src={portfolio3} alt="Detalhes de laços brancos em francesinhas pretas criadas pela Clara" width="788" height="738" /><span>Seu estilo, seu jeitinho.</span></div><div className="hero-seal"><Icon name="sparkle" size={27} /><span>um carinho<br />em forma de <em>unhas</em></span></div><span className="visual-sparkle" aria-hidden="true">✧</span><span className="hero-side-note">FEITO POR CLARA, COM AMOR.</span></div>
      </div><div className="hero-bottom container"><span>BELEZA QUE COMEÇA NO CUIDADO</span><a href="#portfolio" aria-label="Explorar portfólio"><span>Role e se inspire</span><Icon name="arrow" size={17} /></a></div></section>
      <div className="values-strip"><div className="container"><span><Icon name="flower" />Seu estilo em primeiro lugar</span><i aria-hidden="true">✧</i><span><Icon name="heart" />Carinho em cada atendimento</span><i aria-hidden="true">✧</i><span><Icon name="sparkle" />Beleza nos pequenos detalhes</span></div></div>
      <Portfolio />
      <section className="about section-space" id="sobre"><div className="container about-inner"><div className="about-art"><span className="eyebrow">PRAZER, CLARA</span><img src={logo} alt="Clara Nail Designer" width="500" height="500" /><span className="about-signature">Das minhas mãos para as suas.</span><Icon name="sparkle" className="about-sparkle" size={39} /></div><div className="about-copy"><span className="eyebrow"><span />UM CUIDADO QUE VAI ALÉM</span><h2>Suas mãos merecem<br /><em>esse carinho.</em></h2><p>Oi, eu sou a Clara! Acredito que fazer as unhas também é uma maneira de cuidar de você. É aquela pausa na rotina para escolher uma cor, experimentar algo novo e sair se sentindo bem.</p><p>Do delicado ao cheio de personalidade, quero criar com você unhas que tenham a sua cara. Por aqui, sua inspiração é sempre bem-vinda.</p><div className="about-points"><span><Icon name="check" size={17} />Escuta e atenção ao que você gosta</span><span><Icon name="check" size={17} />Um olhar cuidadoso para cada detalhe</span><span><Icon name="check" size={17} />Liberdade para ser você, até nas unhas</span></div><a href={whatsappUrl} className="text-link" target="_blank" rel="noopener noreferrer">Vou adorar cuidar de você<Icon name="arrow" size={18} /></a></div></div></section>
      <section className="how-it-works section-space"><div className="container"><div className="section-heading centered"><span className="eyebrow">DO SEU JEITO, SEM COMPLICAÇÃO</span><h2>Seu próximo momento<br /><em>de cuidado começa aqui.</em></h2></div><div className="steps"><article><span className="step-number">01</span><h3>Me conta sua ideia</h3><p>Me chama no WhatsApp. Pode mandar uma inspiração ou só dizer o que você tem em mente.</p></article><article><span className="step-number">02</span><h3>A gente combina</h3><p>Conversamos sobre os detalhes, valores e o melhor horário para o seu atendimento.</p></article><article><span className="step-number">03</span><h3>O momento é seu</h3><p>Agora é aproveitar sua pausa e deixar o carinho por minha conta. Vai ser um prazer te receber!</p></article></div></div></section>
      <section className="faq section-space" id="duvidas"><div className="container faq-inner"><div><span className="eyebrow"><span />VAMOS CONVERSAR?</span><h2>Antes de agendar,<br /><em>talvez você queira saber.</em></h2><p>Ficou com outra dúvida?<br />Estou a uma mensagem de distância.</p><a href={whatsappUrl} className="text-link" target="_blank" rel="noopener noreferrer">Falar com a Clara<Icon name="arrow" size={18} /></a></div><div className="faq-list">{questions.map(([question, answer]) => <details key={question}><summary>{question}<Icon name="plus" size={20} /></summary><p>{answer}</p></details>)}</div></div></section>
      <section className="contact" id="contato"><div className="container contact-inner"><Icon name="sparkle" className="contact-sparkle" size={42} /><span className="eyebrow">RESERVE UM TEMPINHO PRA VOCÊ</span><h2>Seu próximo detalhe favorito<br /><em>pode estar nas suas mãos.</em></h2><p>Vamos escolher juntas? Me chama e a gente combina.</p><WhatsAppButton>Quero meu momento de cuidado</WhatsAppButton><span className="contact-note">Agendamento direto comigo, pelo WhatsApp.</span></div></section>
    </main>
    <footer className="site-footer"><div className="container footer-main"><Brand /><p>Beleza nas unhas.<br /><span>Carinho em cada detalhe.</span></p><a href="#inicio" className="back-top">Voltar ao início<Icon name="arrow" size={18} /></a></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} Clara Nail Designer. Todos os direitos reservados.</span><span>Desenvolvido por <strong>Nivox Sistemas</strong><span className="footer-star" aria-hidden="true"> ✧</span></span></div></footer>
    <a className="floating-whatsapp" href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Conversar com Clara pelo WhatsApp"><Icon name="whatsapp" size={28} /><span>Vamos conversar?</span></a>
  </>;
}

export default App;
