(function () {
  "use strict";

  var STORAGE_VOLUNTARIOS = "semearFuturo_voluntarios";
  var STORAGE_TEMA = "semearFuturo_tema";
  var STORAGE_EMAIL_ATUAL = "semearFuturo_ultimoEmail";

  var form = document.getElementById("formVoluntario");
  var totalEl = document.getElementById("totalVoluntarios");
  var msgSucesso = document.getElementById("msgSucesso");
  var msgJaInscrito = document.getElementById("msgJaInscrito");
  var btnTema = document.getElementById("btnTema");
  var campoEmail = document.getElementById("email");
  var cabecalho = document.getElementById("cabecalho");
  var scrollProgress = document.getElementById("scrollProgress");
  var heroCard3d = document.getElementById("heroCard3d");

  var reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduzirMovimento) {
    document.body.classList.add("reduzir-movimento");
  }

  /* ——— localStorage: voluntários ——— */
  function lerVoluntarios() {
    try {
      var dados = localStorage.getItem(STORAGE_VOLUNTARIOS);
      if (!dados) return [];
      var lista = JSON.parse(dados);
      return Array.isArray(lista) ? lista : [];
    } catch (e) {
      return [];
    }
  }

  function salvarVoluntarios(lista) {
    localStorage.setItem(STORAGE_VOLUNTARIOS, JSON.stringify(lista));
  }

  function atualizarContador() {
    var total = lerVoluntarios().length;
    if (totalEl) {
      if (reduzirMovimento) {
        totalEl.textContent = String(total);
      } else {
        animarNumero(totalEl, parseInt(totalEl.textContent, 10) || 0, total, 600);
      }
    }
  }

  function animarNumero(el, de, para, duracao) {
    var inicio = performance.now();
    function frame(agora) {
      var t = Math.min((agora - inicio) / duracao, 1);
      var ease = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(de + (para - de) * ease));
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function emailJaInscrito(email) {
    var normalizado = email.trim().toLowerCase();
    return lerVoluntarios().some(function (v) {
      return v.email === normalizado;
    });
  }

  function aplicarTema(tema) {
    var textoBtn = btnTema && btnTema.querySelector(".btn-tema-texto");
    if (tema === "escuro") {
      document.body.classList.add("tema-escuro");
      if (btnTema) btnTema.setAttribute("aria-pressed", "true");
      if (textoBtn) textoBtn.textContent = "Claro";
    } else {
      document.body.classList.remove("tema-escuro");
      if (btnTema) btnTema.setAttribute("aria-pressed", "false");
      if (textoBtn) textoBtn.textContent = "Escuro";
    }
  }

  function carregarTemaSalvo() {
    var tema = localStorage.getItem(STORAGE_TEMA);
    if (tema === "escuro" || tema === "claro") aplicarTema(tema);
  }

  function mostrarAvisoInscrito(email) {
    if (!msgJaInscrito) return;
    msgJaInscrito.textContent =
      "O e-mail " + email + " já está inscrito. Obrigado por fazer parte do Semear Futuro!";
    msgJaInscrito.classList.add("visivel");
    if (form) form.classList.add("oculto");
  }

  function verificarEmailAoSairDoCampo() {
    if (!campoEmail) return;
    var email = campoEmail.value.trim();
    if (!email || email.indexOf("@") === -1) return;
    if (emailJaInscrito(email)) {
      mostrarAvisoInscrito(email);
      localStorage.setItem(STORAGE_EMAIL_ATUAL, email.toLowerCase());
    }
  }

  function limparErros() {
    ["Nome", "Idade", "Email", "Telefone", "Itens"].forEach(function (nome) {
      var campo = document.getElementById("campo" + nome);
      var erro = document.getElementById("erro" + nome);
      if (campo) campo.classList.remove("campo-erro");
      if (erro) {
        erro.hidden = true;
        erro.textContent = "";
      }
    });
  }

  function mostrarErro(idCampo, idErro, mensagem) {
    var campo = document.getElementById(idCampo);
    var erro = document.getElementById(idErro);
    if (campo) campo.classList.add("campo-erro");
    if (erro) {
      erro.textContent = mensagem;
      erro.hidden = false;
    }
  }

  function validarFormulario(dados) {
    limparErros();
    var valido = true;
    if (!dados.nome || dados.nome.length < 3) {
      mostrarErro("campoNome", "erroNome", "Nome completo (mín. 3 caracteres).");
      valido = false;
    }
    if (!dados.idade || dados.idade < 14) {
      mostrarErro("campoIdade", "erroIdade", "Idade mínima: 14 anos.");
      valido = false;
    }
    if (!dados.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
      mostrarErro("campoEmail", "erroEmail", "E-mail inválido.");
      valido = false;
    }
    var telDigitos = (dados.telefone || "").replace(/\D/g, "");
    if (telDigitos.length < 10 || telDigitos.length > 11) {
      mostrarErro("campoTelefone", "erroTelefone", "Informe um telefone válido com DDD (10 ou 11 dígitos).");
      valido = false;
    }
    if (!dados.itensArrecadar) {
      mostrarErro("campoItens", "erroItens", "Selecione uma opção.");
      valido = false;
    }
    return valido;
  }

  function aoEnviar(evento) {
    evento.preventDefault();
    limparErros();
    if (msgSucesso) msgSucesso.classList.remove("visivel");
    if (msgJaInscrito) msgJaInscrito.classList.remove("visivel");

    var dados = {
      nome: document.getElementById("nome").value.trim(),
      idade: Number(document.getElementById("idade").value, 10),
      email: document.getElementById("email").value.trim().toLowerCase(),
      telefone: document.getElementById("telefone").value.trim(),
      itensArrecadar: document.getElementById("itensArrecadar").value,
      dataInscricao: new Date().toISOString(),
    };

    if (!validarFormulario(dados)) return;
    if (emailJaInscrito(dados.email)) {
      mostrarAvisoInscrito(dados.email);
      return;
    }

    var lista = lerVoluntarios();
    lista.push(dados);
    salvarVoluntarios(lista);
    localStorage.setItem(STORAGE_EMAIL_ATUAL, dados.email);
    atualizarContador();

    if (form) {
      form.reset();
      form.classList.add("oculto");
    }
    if (msgSucesso) {
      msgSucesso.textContent =
        "Inscrição confirmada, " +
        dados.nome.split(" ")[0] +
        "! Em breve a Direção divulgará as datas do Semear Futuro.";
      msgSucesso.classList.add("visivel");
    }
  }

  function verificarRetornoVisitante() {
    var ultimoEmail = localStorage.getItem(STORAGE_EMAIL_ATUAL);
    if (ultimoEmail && emailJaInscrito(ultimoEmail)) {
      mostrarAvisoInscrito(ultimoEmail);
    }
  }

  /* ——— Scroll: progress, header, parallax ——— */
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var scrollY = window.scrollY;
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docH > 0 ? (scrollY / docH) * 100 : 0;

      if (scrollProgress) scrollProgress.style.width = progress + "%";
      if (cabecalho) cabecalho.classList.toggle("scrolled", scrollY > 40);

      if (!reduzirMovimento) {
        document.querySelectorAll("[data-parallax]").forEach(function (el) {
          var fator = parseFloat(el.getAttribute("data-parallax")) || 0.1;
          var rect = el.getBoundingClientRect();
          var centro = rect.top + rect.height / 2 - window.innerHeight / 2;
          el.style.transform =
            "translate3d(0, " + centro * fator * -0.15 + "px, 0)";
        });

        if (heroCard3d) {
          var heroRect = heroCard3d.getBoundingClientRect();
          var heroCenter = heroRect.top / window.innerHeight;
          var rotX = Math.max(-6, Math.min(6, heroCenter * 8));
          var inner = heroCard3d.querySelector(".card-3d-inner");
          if (inner && !heroCard3d.dataset.mouseTilt) {
            inner.style.transform =
              "rotateY(-8deg) rotateX(" + (6 + rotX) + "deg)";
          }
        }
      }

      atualizarNavAtiva();
      ticking = false;
    });
  }

  function atualizarNavAtiva() {
    var secoes = document.querySelectorAll("main section[id]");
    var links = document.querySelectorAll("[data-nav]");
    var atual = "";

    secoes.forEach(function (sec) {
      var top = sec.offsetTop - 120;
      if (window.scrollY >= top) atual = sec.getAttribute("id");
    });

    links.forEach(function (link) {
      var href = link.getAttribute("href").replace("#", "");
      link.classList.toggle("ativo", href === atual);
    });
  }

  /* ——— Intersection Observer: reveal + count ——— */
  function initReveal() {
    var elementos = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window) || reduzirMovimento) {
      elementos.forEach(function (el) {
        el.classList.add("revealed");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var delay = parseInt(el.getAttribute("data-reveal-delay"), 10) || 0;
          setTimeout(function () {
            el.classList.add("revealed");
          }, delay);
          observer.unobserve(el);

          el.querySelectorAll("[data-count]").forEach(function (numEl) {
            if (numEl.dataset.animated) return;
            numEl.dataset.animated = "true";
            var alvo = parseFloat(numEl.getAttribute("data-count"));
            var sufixo = numEl.getAttribute("data-suffix") || "";
            animarContadorDecimal(numEl, 0, alvo, sufixo, 1400);
          });
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    elementos.forEach(function (el) {
      observer.observe(el);
    });
  }

  function animarContadorDecimal(el, de, para, sufixo, duracao) {
    var inicio = performance.now();
    function frame(agora) {
      var t = Math.min((agora - inicio) / duracao, 1);
      var ease = 1 - Math.pow(1 - t, 3);
      var valor = de + (para - de) * ease;
      el.textContent = valor.toFixed(1).replace(".0", "") + sufixo;
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ——— 3D tilt em cards ——— */
  function initTilt() {
    if (reduzirMovimento || window.matchMedia("(pointer: coarse)").matches) return;

    var maxTilt = 12;

    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        var rotY = x * maxTilt;
        var rotX = -y * maxTilt;

        card.style.transform =
          "perspective(900px) rotateX(" +
          rotX +
          "deg) rotateY(" +
          rotY +
          "deg) translateZ(8px)";
        card.style.boxShadow =
          -x * 20 +
          "px " +
          (y * 20 + 24) +
          "px 48px rgba(13, 71, 161, 0.2)";
      });

      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
        card.style.boxShadow = "";
      });
    });

    if (heroCard3d) {
      heroCard3d.addEventListener("mousemove", function (e) {
        var rect = heroCard3d.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        var inner = heroCard3d.querySelector(".card-3d-inner");
        if (!inner) return;
        heroCard3d.dataset.mouseTilt = "1";
        inner.style.animation = "none";
        inner.style.transform =
          "rotateY(" +
          x * 18 +
          "deg) rotateX(" +
          -y * 14 +
          "deg) translateZ(30px)";
      });

      heroCard3d.addEventListener("mouseleave", function () {
        delete heroCard3d.dataset.mouseTilt;
        var inner = heroCard3d.querySelector(".card-3d-inner");
        if (inner) {
          inner.style.transform = "";
          inner.style.animation = "";
        }
      });
    }
  }


  /* ——— Menu mobile ——— */
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");

  function fecharMenu() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove("aberto");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menu");
    document.body.classList.remove("menu-aberto");
  }

  function abrirFecharMenu() {
    if (!navMenu || !navToggle) return;
    var aberto = navMenu.classList.toggle("aberto");
    navToggle.setAttribute("aria-expanded", aberto ? "true" : "false");
    navToggle.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    document.body.classList.toggle("menu-aberto", aberto);
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", abrirFecharMenu);
    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", fecharMenu);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1101) fecharMenu();
    });
  }

  /* ——— Event listeners ——— */
  if (btnTema) {
    btnTema.addEventListener("click", function () {
      var escuro = document.body.classList.contains("tema-escuro");
      if (escuro) {
        aplicarTema("claro");
        localStorage.setItem(STORAGE_TEMA, "claro");
      } else {
        aplicarTema("escuro");
        localStorage.setItem(STORAGE_TEMA, "escuro");
      }
    });
  }

  if (campoEmail) campoEmail.addEventListener("blur", verificarEmailAoSairDoCampo);
  if (form) form.addEventListener("submit", aoEnviar);

  window.addEventListener("scroll", onScroll, { passive: true });

  carregarTemaSalvo();
  atualizarContador();
  verificarRetornoVisitante();
  initReveal();
  initTilt();
  onScroll();
})();
