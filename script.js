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
    if (totalEl) totalEl.textContent = String(total);
  }

  function emailJaInscrito(email) {
    var normalizado = email.trim().toLowerCase();
    return lerVoluntarios().some(function (v) {
      return v.email === normalizado;
    });
  }

  function aplicarTema(tema) {
    if (tema === "escuro") {
      document.body.classList.add("tema-escuro");
      if (btnTema) {
        btnTema.textContent = "Modo claro";
        btnTema.setAttribute("aria-pressed", "true");
      }
    } else {
      document.body.classList.remove("tema-escuro");
      if (btnTema) {
        btnTema.textContent = "Modo escuro";
        btnTema.setAttribute("aria-pressed", "false");
      }
    }
  }

  function carregarTemaSalvo() {
    var tema = localStorage.getItem(STORAGE_TEMA);
    if (tema === "escuro" || tema === "claro") {
      aplicarTema(tema);
    }
  }

  function mostrarAvisoInscrito(email) {
    if (!msgJaInscrito) return;
    msgJaInscrito.textContent =
      "O e-mail " +
      email +
      " já está inscrito no Semear Futuro. Obrigado por fazer parte da nossa rede de voluntários!";
    msgJaInscrito.classList.add("visivel");
    if (form) form.classList.add("oculto");
  }

  function verificarEmailAoSairDoCampo() {
    if (!campoEmail) return;
    var email = campoEmail.value.trim();
    if (!email || !email.includes("@")) return;

    if (emailJaInscrito(email)) {
      mostrarAvisoInscrito(email);
      localStorage.setItem(STORAGE_EMAIL_ATUAL, email.toLowerCase());
    }
  }

  function limparErros() {
    var campos = ["Nome", "Idade", "Email", "Itens"];
    campos.forEach(function (nome) {
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
      mostrarErro("campoNome", "erroNome", "Informe seu nome completo (mínimo 3 caracteres).");
      valido = false;
    }

    if (!dados.idade || dados.idade < 14) {
      mostrarErro("campoIdade", "erroIdade", "Voluntários devem ter pelo menos 14 anos.");
      valido = false;
    }

    if (!dados.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
      mostrarErro("campoEmail", "erroEmail", "Informe um e-mail válido.");
      valido = false;
    }

    if (!dados.itensArrecadar) {
      mostrarErro("campoItens", "erroItens", "Selecione quantos itens você pode arrecadar.");
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
        "Inscrição realizada com sucesso, " +
        dados.nome.split(" ")[0] +
        "! Nos vemos no Semear Futuro. Sua participação foi salva neste navegador.";
      msgSucesso.classList.add("visivel");
    }
  }

  function verificarRetornoVisitante() {
    var ultimoEmail = localStorage.getItem(STORAGE_EMAIL_ATUAL);
    if (ultimoEmail && emailJaInscrito(ultimoEmail)) {
      mostrarAvisoInscrito(ultimoEmail);
    }
  }

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

  if (campoEmail) {
    campoEmail.addEventListener("blur", verificarEmailAoSairDoCampo);
  }

  if (form) {
    form.addEventListener("submit", aoEnviar);
  }

  carregarTemaSalvo();
  atualizarContador();
  verificarRetornoVisitante();
})();
