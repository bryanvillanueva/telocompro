/* Te lo compro. Interacciones de la landing.
   Todo el movimiento se apaga con prefers-reduced-motion. */

(function () {
  'use strict';

  var quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- 1. Entrada del hero. Jerarquia: primero el titular. ---- */
  requestAnimationFrame(function () {
    document.querySelectorAll('.fx').forEach(function (el) { el.classList.add('is-in'); });
  });

  /* ---- 2. Revelado por scroll. Secuencia de lectura, no decoracion. ---- */
  var porRevelar = document.querySelectorAll('.reveal');
  if (quieto || !('IntersectionObserver' in window)) {
    porRevelar.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var ojo = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        ojo.unobserve(e.target);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    porRevelar.forEach(function (el) { ojo.observe(el); });
  }

  /* ---- 3. Estado de la barra: transparente sobre el rojo, solida al bajar. ---- */
  var nav = document.getElementById('nav');
  if (nav) {
    var centinela = document.createElement('div');
    centinela.setAttribute('aria-hidden', 'true');
    centinela.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:80px;pointer-events:none';
    document.body.prepend(centinela);

    var flota = document.querySelector('[data-flota]');

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entradas) {
        var pasoElHero = !entradas[0].isIntersecting;
        nav.classList.toggle('is-scrolled', pasoElHero);
        // el boton flotante no compite con el CTA del hero: sale despues
        if (flota) flota.hidden = !pasoElHero;
      }, { threshold: 0 }).observe(centinela);
    } else if (flota) {
      flota.hidden = false;
    }
  }

  /* ---- 4. Menu movil ---- */
  var boton = document.querySelector('.nav__toggle');
  var cajon = document.getElementById('menu-movil');
  if (boton && cajon) {
    var pintarMenu = function (abierto) {
      boton.setAttribute('aria-expanded', String(abierto));
      boton.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
      cajon.hidden = !abierto;
    };
    boton.addEventListener('click', function () {
      pintarMenu(boton.getAttribute('aria-expanded') !== 'true');
    });
    cajon.addEventListener('click', function (e) {
      if (e.target.closest('a')) pintarMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && boton.getAttribute('aria-expanded') === 'true') {
        pintarMenu(false);
        boton.focus();
      }
    });
  }

  /* ---- 5. Tablero de exclusion. Demuestra la personalizacion real. ---- */
  var tablero = document.querySelector('.tablero');
  if (tablero) {
    var maxExcluidos = parseInt(tablero.dataset.max, 10) || 4;
    var lista = tablero.querySelector('[data-lista]');
    var conteo = tablero.querySelector('[data-conteo]');
    var pie = tablero.querySelector('[data-vacio]');
    var listo = tablero.querySelector('[data-listo]');

    var pintarTablero = function () {
      var marcados = lista.querySelectorAll('[aria-pressed="true"]');
      var n = marcados.length;
      var lleno = n >= maxExcluidos;

      conteo.textContent = n + ' de ' + maxExcluidos + ' excluidos';

      lista.querySelectorAll('button').forEach(function (b) {
        var activo = b.getAttribute('aria-pressed') === 'true';
        b.disabled = lleno && !activo;
      });

      // completar los 4 es el momento de pedir: ahi aparece el CTA
      if (listo) listo.hidden = !lleno;

      if (n === 0) {
        pie.textContent = 'Toca un producto para sacarlo de tu canasta.';
        pie.removeAttribute('data-estado');
      } else if (lleno) {
        pie.textContent = 'Listo. Estos cuatro no vuelven a entrar a tu caja.';
        pie.setAttribute('data-estado', 'lleno');
      } else {
        var nombres = Array.prototype.map.call(marcados, function (b) { return b.textContent.trim(); });
        pie.textContent = 'Fuera: ' + nombres.join(', ') + '.';
        pie.removeAttribute('data-estado');
      }
    };

    lista.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b || b.disabled) return;
      b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      pintarTablero();
    });

    pintarTablero();
  }

  /* ---- 6. Riel de add-ons: avanza solo, con control de pausa. ---- */
  var pista = document.querySelector('[data-riel-pista]');
  if (pista) {
    var LAPSO = 3200;
    var reloj = null;
    var pausado = quieto;                 // con movimiento reducido no arranca
    var botonPausa = document.querySelector('[data-riel="pausa"]');

    // El indice manda, no scrollLeft: durante el scroll suave la posicion aun
    // no llego y dos avances seguidos se pisarian.
    var indice = 0;

    var paso = function () {
      var tarjeta = pista.querySelector('.addon');
      if (!tarjeta) return 0;
      var gap = parseFloat(getComputedStyle(pista).columnGap) || 16;
      return tarjeta.getBoundingClientRect().width + gap;
    };

    var ultimoIndice = function () {
      var d = paso();
      return d ? Math.ceil((pista.scrollWidth - pista.clientWidth) / d) : 0;
    };

    var mover = function (dir) {
      var d = paso();
      if (!d) return;
      var fin = pista.scrollWidth - pista.clientWidth;
      var ultimo = ultimoIndice();
      var previo = indice;

      indice += dir;
      if (indice > ultimo) indice = 0;
      else if (indice < 0) indice = ultimo;

      var vuelta = Math.abs(indice - previo) > 1;
      pista.scrollTo({
        left: Math.min(fin, indice * d),
        behavior: (quieto || vuelta) ? 'auto' : 'smooth'
      });
    };

    // si el usuario arrastra el riel a mano, el indice se pone al dia
    var resync = null;
    pista.addEventListener('scroll', function () {
      clearTimeout(resync);
      resync = setTimeout(function () {
        var d = paso();
        if (!d) return;
        var fin = pista.scrollWidth - pista.clientWidth;
        // el ultimo paso queda recortado contra el final: si estamos ahi, el
        // indice es el ultimo, no el que sugiere la division
        indice = pista.scrollLeft >= fin - 4
          ? ultimoIndice()
          : Math.min(ultimoIndice(), Math.round(pista.scrollLeft / d));
      }, 160);
    }, { passive: true });

    var arrancar = function () {
      if (reloj || pausado || document.hidden) return;
      reloj = setInterval(function () { mover(1); }, LAPSO);
    };
    var parar = function () {
      if (reloj) { clearInterval(reloj); reloj = null; }
    };

    var pintarPausa = function () {
      if (!botonPausa) return;
      botonPausa.setAttribute('aria-pressed', String(pausado));
      botonPausa.setAttribute('aria-label', pausado ? 'Reanudar el carrusel' : 'Pausar el carrusel');
      var uso = botonPausa.querySelector('use');
      if (uso) uso.setAttribute('href', pausado ? '#i-play' : '#i-pause');
    };

    document.querySelectorAll('[data-riel]').forEach(function (b) {
      b.addEventListener('click', function () {
        var accion = b.dataset.riel;
        if (accion === 'pausa') {
          pausado = !pausado;
          pintarPausa();
          if (pausado) parar(); else arrancar();
          return;
        }
        // tocar una flecha cuenta como intencion del usuario: se detiene el solo
        pausado = true;
        pintarPausa();
        parar();
        mover(accion === 'next' ? 1 : -1);
      });
    });

    // se frena mientras el usuario mira, toca o navega con teclado
    ['pointerenter', 'focusin'].forEach(function (ev) {
      pista.addEventListener(ev, parar);
    });
    ['pointerleave', 'focusout'].forEach(function (ev) {
      pista.addEventListener(ev, arrancar);
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) parar(); else arrancar();
    });

    pintarPausa();

    // no gasta ciclos hasta que la seccion esta a la vista
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) arrancar(); else parar();
      }, { threshold: 0.25 }).observe(pista);
    } else {
      arrancar();
    }
  }
})();
