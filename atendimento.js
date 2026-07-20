const PERFIL_ID_ATENDIMENTO = "f30eedbf-1c8a-4c1d-a44d-18ee493ad9bf";
const WHATSAPP_PADRAO = "5511970684683";
const INSTAGRAM_PADRAO = "marianenailss__";
const ENDERECO_PADRAO = "Alameda das Rosas, 102, Carapicuíba";

let modalAberto = null;
let elementoComFocoAntesDoModal = null;

function escaparHtmlAtendimento(valor = "") {
    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function normalizarWhatsapp(valor = "") {
    return String(valor).replace(/\D/g, "") || WHATSAPP_PADRAO;
}

function normalizarInstagram(valor = "") {
    return String(valor).trim().replace(/^@/, "") || INSTAGRAM_PADRAO;
}

function nomePublico(valor = "") {
    return String(valor || "Mariane Nails").replace(/\s+Studio\s*$/i, "").trim();
}

function criarLinkWhatsapp(numero) {
    const mensagem = encodeURIComponent("Olá! Gostaria de agendar um horário.");
    return `https://wa.me/${normalizarWhatsapp(numero)}?text=${mensagem}`;
}

function atualizarLinksDoPerfil(perfil = {}) {
    const linkWhatsapp = criarLinkWhatsapp(perfil.whatsapp);
    const usuarioInstagram = normalizarInstagram(perfil.instagram);
    const endereco = String(perfil.endereco || ENDERECO_PADRAO).trim();
    const linkMapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;

    ["whatsappCabecalho", "whatsappPrincipal", "whatsappValores"].forEach((id) => {
        const link = document.getElementById(id);
        if (link) link.href = linkWhatsapp;
    });

    const instagram = document.getElementById("instagramAtendimento");
    if (instagram) instagram.href = `https://www.instagram.com/${encodeURIComponent(usuarioInstagram)}/`;

    const enderecoCompleto = document.getElementById("enderecoCompleto");
    const resumoEndereco = document.getElementById("resumoEndereco");
    const mapa = document.getElementById("linkMapa");

    if (enderecoCompleto) enderecoCompleto.textContent = endereco;
    if (resumoEndereco) resumoEndereco.textContent = endereco;
    if (mapa) mapa.href = linkMapa;

    const nome = document.getElementById("nomePerfilLinktree");
    const descricao = document.getElementById("descricaoPerfilLinktree");
    const foto = document.getElementById("fotoPerfilLinktree");

    if (nome) nome.textContent = nomePublico(perfil.nome);
    if (descricao && perfil.descricao) {
        descricao.textContent = String(perfil.descricao)
            .replace(/<br\s*\/?>/gi, " ")
            .replace(/<[^>]*>/g, "")
            .replace(/(?:,?\s*e\s+|,\s*)nail\s*art\.?/gi, ".");
    }
    if (foto && perfil.foto) foto.src = perfil.foto;
}

async function carregarPerfilAtendimento() {
    const { data, error } = await supabaseClient
        .from("profiles")
        .select("nome, descricao, foto, whatsapp, instagram, endereco")
        .eq("id", PERFIL_ID_ATENDIMENTO)
        .single();

    if (error) {
        console.error("Não foi possível carregar os dados de atendimento:", error);
        atualizarLinksDoPerfil();
        return;
    }

    atualizarLinksDoPerfil(data || {});
}

async function carregarPreviaGaleriaAtendimento() {
    const container = document.getElementById("previaGaleriaAtendimento");
    if (!container) return;

    const { data, error } = await supabaseClient
        .from("gallery")
        .select("id, titulo, tipo, imagem, imagem_depois")
        .eq("profile_id", PERFIL_ID_ATENDIMENTO)
        .order("created_at", { ascending: false })
        .limit(4);

    if (error) {
        console.error("Não foi possível carregar a prévia da galeria:", error);
        container.innerHTML = '<p class="carregandoAtendimento">Não foi possível carregar as fotos agora.</p>';
        return;
    }

    if (!data?.length) {
        container.innerHTML = '<p class="carregandoAtendimento">Nenhum trabalho publicado ainda.</p>';
        return;
    }

    container.innerHTML = data.map((trabalho) => {
        const titulo = trabalho.titulo || "Trabalho realizado";

        if (trabalho.tipo === "antes_depois" && trabalho.imagem_depois) {
            return `
                <a href="galeria.html" class="fotoPreviaAtendimento comparativoPreviaAtendimento" aria-label="Abrir comparativo: ${escaparHtmlAtendimento(titulo)}">
                    <span class="ladoPreviaAtendimento">
                        <small>Antes</small>
                        <img src="${escaparHtmlAtendimento(trabalho.imagem || "")}" alt="Antes: ${escaparHtmlAtendimento(titulo)}" loading="lazy">
                    </span>
                    <span class="ladoPreviaAtendimento">
                        <small>Depois</small>
                        <img src="${escaparHtmlAtendimento(trabalho.imagem_depois)}" alt="Depois: ${escaparHtmlAtendimento(titulo)}" loading="lazy">
                    </span>
                </a>
            `;
        }

        return `
            <a href="galeria.html" class="fotoPreviaAtendimento" aria-label="Abrir galeria: ${escaparHtmlAtendimento(titulo)}">
                <img src="${escaparHtmlAtendimento(trabalho.imagem || "")}" alt="${escaparHtmlAtendimento(titulo)}" loading="lazy">
            </a>
        `;
    }).join("");

    window.dispatchEvent(new Event("interfaceAtualizada"));
}

function abrirModalAtendimento(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    elementoComFocoAntesDoModal = document.activeElement;
    modal.hidden = false;
    modalAberto = modal;
    document.body.classList.add("modalAtendimentoAberto");

    requestAnimationFrame(() => {
        modal.classList.add("aberto");
        modal.querySelector(".modalAtendimentoPainel")?.focus();
    });
}

function fecharModalAtendimento() {
    if (!modalAberto) return;

    const modal = modalAberto;
    modal.classList.remove("aberto");
    document.body.classList.remove("modalAtendimentoAberto");
    modalAberto = null;

    window.setTimeout(() => {
        modal.hidden = true;
        elementoComFocoAntesDoModal?.focus();
    }, 250);
}

function configurarModaisAtendimento() {
    document.querySelectorAll("[data-abrir-modal]").forEach((botao) => {
        botao.addEventListener("click", () => abrirModalAtendimento(botao.dataset.abrirModal));
    });

    document.querySelectorAll("[data-fechar-modal]").forEach((botao) => {
        botao.addEventListener("click", fecharModalAtendimento);
    });

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") fecharModalAtendimento();
    });
}

window.addEventListener("DOMContentLoaded", async () => {
    configurarModaisAtendimento();
    await Promise.all([
        carregarPerfilAtendimento(),
        carregarPreviaGaleriaAtendimento()
    ]);
});
