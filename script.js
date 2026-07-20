/* =====================================
   MARIANE NAILS STUDIO
===================================== */

// ===============================
// ANIMAÇÕES
// ===============================

const elementos = document.querySelectorAll(".animar");

elementos.forEach((elemento, index) => {
    elemento.style.animationDelay = `${index * 0.12}s`;
});

document.body.style.opacity = "0";

window.addEventListener("load", () => {
    document.body.style.transition = "opacity .6s ease";
    document.body.style.opacity = "1";
});

// ===============================
// LINKS EXTERNOS
// ===============================

const linksExternos = document.querySelectorAll('a[target="_blank"]');

linksExternos.forEach((link) => {
    link.addEventListener("click", () => {
        console.log("Abrindo link:", link.href);
    });
});

// ===============================
// FUNÇÕES AUXILIARES
// ===============================

function escaparHtml(valor = "") {
    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// ===============================
// CARREGAR PERFIL
// ===============================

async function carregarPerfil() {

    const { data, error } = await supabaseClient
        .from("profiles")
        .select("*")
        .single();

    if (error) {
        console.error(error);
        return;
    }

    document.getElementById("nomePerfil").textContent = data.nome;
    document.getElementById("descricaoPerfil").innerHTML = data.descricao;
    document.getElementById("fotoPerfil").src = data.foto;

    const nomeMobile = document.getElementById("nomePerfilMobile");
    const descricaoMobile = document.getElementById("descricaoPerfilMobile");
    const fotoMobile = document.getElementById("fotoPerfilMobile");

    if (nomeMobile) nomeMobile.textContent = data.nome || "Mariane Nails Studio";
    if (descricaoMobile) {
        descricaoMobile.textContent = String(data.descricao || "")
            .replace(/<br\s*\/?>/gi, " ")
            .replace(/<[^>]*>/g, "");
    }
    if (fotoMobile && data.foto) fotoMobile.src = data.foto;
}

// ===============================
// TRABALHOS RECENTES
// ===============================

async function carregarTrabalhosRecentes() {

    const container = document.getElementById("trabalhosRecentesHome");

    if (!container) return;

    const perfilId = "f30eedbf-1c8a-4c1d-a44d-18ee493ad9bf";

    const limite = window.innerWidth <= 768 ? 4 : 6;

    const { data, error } = await supabaseClient
        .from("gallery")
        .select("id, titulo, imagem")
        .eq("profile_id", perfilId)
        .eq("tipo", "trabalho")
        .order("created_at", { ascending: false })
        .limit(limite);

    if (error) {

        console.error(error);

        container.innerHTML = `
            <p class="carregandoTrabalhos">
                Não foi possível carregar os trabalhos.
            </p>
        `;

        return;
    }

    if (!data || data.length === 0) {

        container.innerHTML = `
            <p class="carregandoTrabalhos">
                Nenhum trabalho publicado ainda.
            </p>
        `;

        return;
    }

    const trabalhosHtml = data.map((trabalho) => {

        const titulo = trabalho.titulo || "Trabalho";

        return `
            <a
                href="galeria.html"
                class="trabalhoRecenteCard"
                aria-label="${escaparHtml(titulo)}"
            >

                <img
                    src="${escaparHtml(trabalho.imagem || "")}"
                    alt="${escaparHtml(titulo)}"
                    loading="lazy"
                >

                ${
                    trabalho.titulo
                        ? `
                            <span>
                                ${escaparHtml(trabalho.titulo)}
                            </span>
                        `
                        : ""
                }

            </a>
        `;

    }).join("");

    container.innerHTML = trabalhosHtml;

    const containerMobile = document.getElementById("trabalhosRecentesMobile");

    if (containerMobile) {
        containerMobile.innerHTML = trabalhosHtml;
    }

    window.dispatchEvent(new Event("interfaceAtualizada"));

}

// ===============================
// ANTES E DEPOIS
// ===============================

async function carregarAntesDepoisRecentes() {

    const container =
        document.getElementById("antesDepoisRecentesHome");

    if (!container) return;

    const perfilId =
        "f30eedbf-1c8a-4c1d-a44d-18ee493ad9bf";

    const { data, error } = await supabaseClient
        .from("gallery")
        .select(
            "id, titulo, imagem, imagem_depois"
        )
        .eq("profile_id", perfilId)
        .eq("tipo", "antes_depois")
        .order("created_at", {
            ascending: false
        })
        .limit(1);

    if (error) {

        console.error(error);

        container.innerHTML = `
            <p class="carregandoTrabalhos">
                Não foi possível carregar os comparativos.
            </p>
        `;

        return;
    }

    if (!data || data.length === 0) {

        container.innerHTML = `
            <p class="carregandoTrabalhos">
                Nenhum comparativo publicado ainda.
            </p>
        `;

        return;
    }

    const comparativosHtml = data.map((item) => {

        const titulo = item.titulo || "Antes e Depois";

        return `
            <a
                href="galeria.html"
                class="cardAntesDepoisHome"
                aria-label="${escaparHtml(titulo)}"
            >

                <div class="comparacaoHome">

                    <div>

                        <span>Antes</span>

                        <img
                            src="${escaparHtml(item.imagem || "")}"
                            alt="Antes"
                            loading="lazy"
                        >

                    </div>

                    <div>

                        <span>Depois</span>

                        <img
                            src="${escaparHtml(item.imagem_depois || "")}"
                            alt="Depois"
                            loading="lazy"
                        >

                    </div>

                </div>

            </a>
        `;

    }).join("");

    container.innerHTML = comparativosHtml;

    const containerMobile = document.getElementById("antesDepoisMobile");

    if (containerMobile) {
        containerMobile.innerHTML = comparativosHtml;
    }

    window.dispatchEvent(new Event("interfaceAtualizada"));

}

// ===============================
// INICIAR
// ===============================

carregarPerfil();
carregarTrabalhosRecentes();
carregarAntesDepoisRecentes();
