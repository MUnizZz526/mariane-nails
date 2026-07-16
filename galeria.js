const PERFIL_ID = "f30eedbf-1c8a-4c1d-a44d-18ee493ad9bf";

let imagensLightbox = [];
let indiceAtual = 0;
let toqueInicialX = 0;


// =========================================
// CARREGAR GALERIA
// =========================================

async function carregarGaleria() {
    const galeriaTrabalhos =
        document.getElementById("galeriaTrabalhos");

    const galeriaAntesDepois =
        document.getElementById("galeriaAntesDepois");

    const { data, error } = await supabaseClient
        .from("gallery")
        .select("*")
        .eq("profile_id", PERFIL_ID)
        .order("created_at", {
            ascending: false
        });

    if (error) {
        console.error("Erro ao carregar galeria:", error);

        galeriaTrabalhos.innerHTML =
            "<p>Não foi possível carregar os trabalhos.</p>";

        galeriaAntesDepois.innerHTML =
            "<p>Não foi possível carregar os comparativos.</p>";

        return;
    }

    const trabalhos = data.filter((item) => {
        return item.tipo === "trabalho" || !item.tipo;
    });

    const antesDepois = data.filter((item) => {
        return item.tipo === "antes_depois";
    });

    renderizarTrabalhos(
        trabalhos,
        galeriaTrabalhos
    );

    renderizarAntesDepois(
        antesDepois,
        galeriaAntesDepois
    );

    prepararImagensLightbox();
}


// =========================================
// RENDERIZAR TRABALHOS
// =========================================

function renderizarTrabalhos(trabalhos, container) {
    if (!trabalhos.length) {
        container.innerHTML = `
            <p class="galeriaVazia">
                Nenhum trabalho cadastrado ainda.
            </p>
        `;

        return;
    }

    container.innerHTML = trabalhos
        .map((item) => {
            const titulo =
                item.titulo || "Trabalho realizado";

            return `
                <article class="card-trabalho">

                    <img
                        src="${escaparHtml(item.imagem || "")}"
                        alt="${escaparHtml(titulo)}"
                        data-titulo="${escaparHtml(titulo)}"
                        class="imagem-galeria"
                    >

                    ${
                        item.titulo
                            ? `
                                <p class="titulo-trabalho">
                                    ${escaparHtml(item.titulo)}
                                </p>
                            `
                            : ""
                    }

                </article>
            `;
        })
        .join("");
}


// =========================================
// RENDERIZAR ANTES E DEPOIS
// =========================================

function renderizarAntesDepois(itens, container) {
    if (!itens.length) {
        container.innerHTML = `
            <p class="galeriaVazia">
                Nenhum Antes e Depois cadastrado ainda.
            </p>
        `;

        return;
    }

    container.innerHTML = itens
        .map((item) => {
            const titulo =
                item.titulo || "Antes e Depois";

            return `
                <article class="card-antes-depois">

                    <div class="comparacao-imagens">

                        <div class="foto-comparacao">

                            <span>Antes</span>

                            <img
                                src="${escaparHtml(item.imagem || "")}"
                                alt="Antes - ${escaparHtml(titulo)}"
                                data-titulo="Antes — ${escaparHtml(titulo)}"
                                class="imagem-galeria"
                            >

                        </div>

                        <div class="foto-comparacao">

                            <span>Depois</span>

                            <img
                                src="${escaparHtml(item.imagem_depois || "")}"
                                alt="Depois - ${escaparHtml(titulo)}"
                                data-titulo="Depois — ${escaparHtml(titulo)}"
                                class="imagem-galeria"
                            >

                        </div>

                    </div>

                    <p class="titulo-trabalho">
                        ${escaparHtml(titulo)}
                    </p>

                </article>
            `;
        })
        .join("");
}


// =========================================
// ABAS
// =========================================

function configurarAbas() {
    const abaTrabalhos =
        document.getElementById("abaTrabalhos");

    const abaAntesDepois =
        document.getElementById("abaAntesDepois");

    const secaoTrabalhos =
        document.getElementById("secaoTrabalhos");

    const secaoAntesDepois =
        document.getElementById("secaoAntesDepois");

    abaTrabalhos.addEventListener("click", () => {
        abaTrabalhos.classList.add("ativa");
        abaAntesDepois.classList.remove("ativa");

        secaoTrabalhos.classList.remove(
            "escondido-galeria"
        );

        secaoAntesDepois.classList.add(
            "escondido-galeria"
        );
    });

    abaAntesDepois.addEventListener("click", () => {
        abaAntesDepois.classList.add("ativa");
        abaTrabalhos.classList.remove("ativa");

        secaoAntesDepois.classList.remove(
            "escondido-galeria"
        );

        secaoTrabalhos.classList.add(
            "escondido-galeria"
        );
    });
}


// =========================================
// LIGHTBOX
// =========================================

function prepararImagensLightbox() {
    imagensLightbox = Array.from(
        document.querySelectorAll(".imagem-galeria")
    );

    imagensLightbox.forEach((imagem, indice) => {
        imagem.addEventListener("click", () => {
            abrirLightbox(indice);
        });
    });

    atualizarVisibilidadeSetas();
}

function abrirLightbox(indice) {
    indiceAtual = indice;

    atualizarLightbox();

    document
        .getElementById("lightbox")
        .classList.add("active");

    document
        .getElementById("lightbox")
        .setAttribute("aria-hidden", "false");

    document.body.classList.add(
        "lightbox-aberto"
    );
}

function fecharLightbox() {
    const lightbox =
        document.getElementById("lightbox");

    const imagem =
        document.getElementById("imagemLightbox");

    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");

    document.body.classList.remove(
        "lightbox-aberto"
    );

    setTimeout(() => {
        if (!lightbox.classList.contains("active")) {
            imagem.src = "";
        }
    }, 250);
}

function atualizarLightbox() {
    const item = imagensLightbox[indiceAtual];

    if (!item) return;

    const imagem =
        document.getElementById("imagemLightbox");

    const titulo =
        document.getElementById("tituloLightbox");

    imagem.src = item.src;
    imagem.alt = item.alt || "Imagem ampliada";

    titulo.textContent =
        item.dataset.titulo ||
        item.alt ||
        "";
}

function mostrarProximaImagem() {
    if (!imagensLightbox.length) return;

    indiceAtual =
        (indiceAtual + 1) %
        imagensLightbox.length;

    atualizarLightbox();
}

function mostrarImagemAnterior() {
    if (!imagensLightbox.length) return;

    indiceAtual =
        (indiceAtual - 1 + imagensLightbox.length) %
        imagensLightbox.length;

    atualizarLightbox();
}

function atualizarVisibilidadeSetas() {
    const anterior =
        document.getElementById("imagemAnterior");

    const proxima =
        document.getElementById("proximaImagem");

    const mostrar =
        imagensLightbox.length > 1;

    anterior.style.display =
        mostrar ? "grid" : "none";

    proxima.style.display =
        mostrar ? "grid" : "none";
}


// =========================================
// EVENTOS DO LIGHTBOX
// =========================================

function configurarEventosLightbox() {
    const lightbox =
        document.getElementById("lightbox");

    document
        .getElementById("fecharLightbox")
        .addEventListener(
            "click",
            fecharLightbox
        );

    document
        .getElementById("imagemAnterior")
        .addEventListener(
            "click",
            mostrarImagemAnterior
        );

    document
        .getElementById("proximaImagem")
        .addEventListener(
            "click",
            mostrarProximaImagem
        );

    lightbox.addEventListener("click", (evento) => {
        if (evento.target === lightbox) {
            fecharLightbox();
        }
    });

    document.addEventListener("keydown", (evento) => {
        if (
            !lightbox.classList.contains("active")
        ) {
            return;
        }

        if (evento.key === "Escape") {
            fecharLightbox();
        }

        if (evento.key === "ArrowRight") {
            mostrarProximaImagem();
        }

        if (evento.key === "ArrowLeft") {
            mostrarImagemAnterior();
        }
    });

    lightbox.addEventListener(
        "touchstart",
        (evento) => {
            toqueInicialX =
                evento.changedTouches[0].clientX;
        },
        {
            passive: true
        }
    );

    lightbox.addEventListener(
        "touchend",
        (evento) => {
            const toqueFinalX =
                evento.changedTouches[0].clientX;

            const distancia =
                toqueFinalX - toqueInicialX;

            if (Math.abs(distancia) < 50) {
                return;
            }

            if (distancia < 0) {
                mostrarProximaImagem();
            } else {
                mostrarImagemAnterior();
            }
        },
        {
            passive: true
        }
    );
}


// =========================================
// SEGURANÇA DO HTML
// =========================================

function escaparHtml(valor = "") {
    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// =========================================
// INICIAR
// =========================================

window.addEventListener(
    "DOMContentLoaded",
    async () => {
        configurarAbas();
        configurarEventosLightbox();

        await carregarGaleria();
    }
);