// =========================================
// ADMIN.JS - MARIANE NAILS
// =========================================

const perfilId = "f30eedbf-1c8a-4c1d-a44d-18ee493ad9bf";
const bucketImagens = "images";


// =========================================
// LOGIN
// =========================================

async function verificarLogin() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error || !data.session) {
        window.location.href = "login.html";
        return false;
    }

    return true;
}

async function logout() {
    await supabaseClient.auth.signOut();
    window.location.href = "login.html";
}


// =========================================
// NAVEGAÇÃO
// =========================================

function abrirPagina(nome) {
    document.querySelectorAll(".pagina").forEach((pagina) => {
        pagina.classList.add("escondido");
    });

    document.getElementById(nome)?.classList.remove("escondido");

    document.querySelectorAll(".sidebar a").forEach((menu) => {
        menu.classList.remove("ativo");
    });

    const nomeMenu =
        "menu" +
        nome.charAt(0).toUpperCase() +
        nome.slice(1);

    document.getElementById(nomeMenu)?.classList.add("ativo");

    if (nome === "galeria") {
        carregarGaleria();
    }
}


// =========================================
// PERFIL
// =========================================

async function carregarPerfil() {
    const { data, error } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", perfilId)
        .single();

    if (error) {
        console.error("Erro ao carregar perfil:", error);
        return;
    }

    document.getElementById("nome").value = data.nome || "";

    document.getElementById("descricao").value =
        (data.descricao || "").replace(/<br\s*\/?>/gi, "\n");

    if (data.foto) {
        document.getElementById("previewFoto").src = data.foto;
    }

    const guiaNome = document.getElementById("guiaNomePerfil");
    const guiaFoto = document.getElementById("guiaFotoPerfil");

    if (guiaNome) guiaNome.textContent = data.nome || "Mariane Nails";
    if (guiaFoto && data.foto) guiaFoto.src = data.foto;

    const whatsapp = document.getElementById("whatsapp");
    const instagram = document.getElementById("instagram");
    const endereco = document.getElementById("endereco");

    if (whatsapp) whatsapp.value = data.whatsapp || "";
    if (instagram) instagram.value = data.instagram || "";
    if (endereco) endereco.value = data.endereco || "";
}

async function salvarPerfil() {
    const nome = document.getElementById("nome").value.trim();

    const descricao = document
        .getElementById("descricao")
        .value
        .trim()
        .replace(/\n/g, "<br>");

    const botao = document.getElementById("salvarPerfil");

    alterarBotao(botao, true, "Salvando...");

    const { error } = await supabaseClient
        .from("profiles")
        .update({
            nome,
            descricao
        })
        .eq("id", perfilId);

    alterarBotao(botao, false, "Salvar Alterações");

    if (error) {
        alert("Erro ao salvar perfil: " + error.message);
        return;
    }

    const guiaNome = document.getElementById("guiaNomePerfil");
    if (guiaNome) guiaNome.textContent = nome || "Mariane Nails";

    alert("Perfil atualizado!");
}


// =========================================
// REDES SOCIAIS
// =========================================

async function salvarRedes() {
    const whatsapp = document
        .getElementById("whatsapp")
        .value
        .trim();

    const instagram = document
        .getElementById("instagram")
        .value
        .trim();

    const endereco = document
        .getElementById("endereco")
        .value
        .trim();

    const botao = document.getElementById("salvarRedes");

    alterarBotao(botao, true, "Salvando...");

    const { error } = await supabaseClient
        .from("profiles")
        .update({
            whatsapp,
            instagram,
            endereco
        })
        .eq("id", perfilId);

    alterarBotao(botao, false, "Salvar contato e local");

    if (error) {
        alert("Erro ao salvar redes: " + error.message);
        return;
    }

    alert("Redes sociais atualizadas!");
}


// =========================================
// UPLOAD DE IMAGENS
// =========================================

function gerarNomeArquivo(arquivo, pasta) {
    const extensao =
        arquivo.name.split(".").pop()?.toLowerCase() || "jpg";

    const codigo =
        Math.random().toString(36).slice(2, 9);

    return `${pasta}/${Date.now()}-${codigo}.${extensao}`;
}

async function enviarImagem(arquivo, pasta) {
    if (!arquivo) {
        throw new Error("Nenhuma imagem foi selecionada.");
    }

    if (!arquivo.type.startsWith("image/")) {
        throw new Error("Escolha um arquivo de imagem.");
    }

    if (arquivo.size > 8 * 1024 * 1024) {
        throw new Error("A imagem deve ter no máximo 8 MB.");
    }

    const caminho = gerarNomeArquivo(arquivo, pasta);

    const { error } = await supabaseClient.storage
        .from(bucketImagens)
        .upload(caminho, arquivo, {
            cacheControl: "3600",
            upsert: false
        });

    if (error) {
        throw error;
    }

    const { data } = supabaseClient.storage
        .from(bucketImagens)
        .getPublicUrl(caminho);

    return {
        url: data.publicUrl,
        caminho
    };
}


// =========================================
// FOTO DE PERFIL
// =========================================

async function salvarFoto() {
    const inputFoto = document.getElementById("foto");
    const arquivo = 
    obterArquivoRecortado("foto");
    const botao = document.getElementById("salvarFoto");

    if (!arquivo) {
        alert("Escolha uma imagem.");
        return;
    }

    alterarBotao(botao, true, "Enviando...");

    try {
        const imagem = await enviarImagem(arquivo, "perfil");

        const { error } = await supabaseClient
            .from("profiles")
            .update({
                foto: imagem.url
            })
            .eq("id", perfilId);

        if (error) {
            await supabaseClient.storage
                .from(bucketImagens)
                .remove([imagem.caminho]);

            throw error;
        }

        document.getElementById("previewFoto").src = imagem.url;
        const guiaFoto = document.getElementById("guiaFotoPerfil");
        if (guiaFoto) guiaFoto.src = imagem.url;
        inputFoto.value = "";
        limparArquivoRecortado("foto");

        alert("Foto atualizada!");
    } catch (error) {
        alert(error.message || "Não foi possível atualizar a foto.");
    } finally {
        alterarBotao(botao, false, "Salvar nova foto");
    }
}

document
    .querySelectorAll("[data-abrir-pagina]")
    .forEach((card) => {
        card.addEventListener("click", () => {
            abrirPagina(card.dataset.abrirPagina);
        });
    });



// =========================================
// GALERIA - TIPO
// =========================================

function atualizarTipoGaleria() {
    const tipo = document.getElementById("tipoGaleria").value;

    const campoTrabalho =
        document.getElementById("campoTrabalho");

    const campoAntesDepois =
        document.getElementById("campoAntesDepois");

    campoTrabalho.classList.toggle(
        "escondido",
        tipo !== "trabalho"
    );

    campoAntesDepois.classList.toggle(
        "escondido",
        tipo !== "antes_depois"
    );

    mostrarMensagemGaleria("");
}


// =========================================
// GALERIA - PRÉ-VISUALIZAÇÃO
// =========================================

function configurarPreview(inputId, imagemId, containerId) {
    const input = document.getElementById(inputId);
    const imagem = document.getElementById(imagemId);
    const container = document.getElementById(containerId);

    if (!input || !imagem || !container) return;

    input.addEventListener("change", () => {
        const arquivo = input.files[0];

        if (!arquivo) {
            imagem.removeAttribute("src");
            container.classList.add("escondido");
            return;
        }

        imagem.src = URL.createObjectURL(arquivo);
        container.classList.remove("escondido");
    });
}


// =========================================
// GALERIA - MENSAGEM E LIMPEZA
// =========================================

function mostrarMensagemGaleria(texto, tipo = "") {
    const mensagem =
        document.getElementById("mensagemGaleria");

    if (!mensagem) return;

    mensagem.textContent = texto;
    mensagem.className =
        `mensagemGaleria ${tipo}`.trim();
}

function limparFormularioGaleria() {
    document.getElementById("tituloGaleria").value = "";
    document.getElementById("fotoTrabalho").value = "";
    document.getElementById("fotoAntes").value = "";
    document.getElementById("fotoDepois").value = "";

    limparArquivoRecortado("fotoTrabalho");
    limparArquivoRecortado("fotoAntes");
    limparArquivoRecortado("fotoDepois");

    [
        "previewTrabalhoContainer",
        "previewAntesContainer",
        "previewDepoisContainer"
    ].forEach((id) => {
        document
            .getElementById(id)
            ?.classList.add("escondido");
    });

    [
        "previewTrabalho",
        "previewAntes",
        "previewDepois"
    ].forEach((id) => {
        document
            .getElementById(id)
            ?.removeAttribute("src");
    });
}


// =========================================
// GALERIA - SALVAR
// =========================================

async function salvarGaleria() {
    const tipo =
        document.getElementById("tipoGaleria").value;

    const titulo =
        document
            .getElementById("tituloGaleria")
            .value
            .trim();

    const fotoTrabalho =
    obterArquivoRecortado("fotoTrabalho");

    const fotoAntes =
    obterArquivoRecortado("fotoAntes");

    const fotoDepois =
    obterArquivoRecortado("fotoDepois");

    if (tipo === "trabalho" && !fotoTrabalho) {
        mostrarMensagemGaleria(
            "Escolha a foto do trabalho.",
            "erro"
        );
        return;
    }

    if (
        tipo === "antes_depois" &&
        (!fotoAntes || !fotoDepois)
    ) {
        mostrarMensagemGaleria(
            "Escolha as fotos de antes e depois.",
            "erro"
        );
        return;
    }

    const botao =
        document.getElementById("salvarGaleria");

    alterarBotao(botao, true, "Enviando...");
    mostrarMensagemGaleria("Enviando imagens...");

    const caminhosEnviados = [];

    try {
        let imagem;
        let imagemDepois = null;
        let caminhoImagem;
        let caminhoImagemDepois = null;

        if (tipo === "trabalho") {
            const upload = await enviarImagem(
                fotoTrabalho,
                "galeria/trabalhos"
            );

            imagem = upload.url;
            caminhoImagem = upload.caminho;

            caminhosEnviados.push(upload.caminho);
        } else {
            const uploadAntes = await enviarImagem(
                fotoAntes,
                "galeria/antes-depois"
            );

            caminhosEnviados.push(uploadAntes.caminho);

            const uploadDepois = await enviarImagem(
                fotoDepois,
                "galeria/antes-depois"
            );

            caminhosEnviados.push(uploadDepois.caminho);

            imagem = uploadAntes.url;
            imagemDepois = uploadDepois.url;

            caminhoImagem = uploadAntes.caminho;
            caminhoImagemDepois = uploadDepois.caminho;
        }

        const { error } = await supabaseClient
            .from("gallery")
            .insert({
                profile_id: perfilId,
                tipo,
                titulo: titulo || null,
                imagem,
                imagem_depois: imagemDepois,
                caminho_imagem: caminhoImagem,
                caminho_imagem_depois: caminhoImagemDepois
            });

        if (error) {
            throw error;
        }

        limparFormularioGaleria();

        mostrarMensagemGaleria(
            "Item adicionado com sucesso!",
            "sucesso"
        );

        await carregarGaleria();
    } catch (error) {
        if (caminhosEnviados.length > 0) {
            await supabaseClient.storage
                .from(bucketImagens)
                .remove(caminhosEnviados);
        }

        mostrarMensagemGaleria(
            error.message ||
                "Não foi possível adicionar o item.",
            "erro"
        );
    } finally {
        alterarBotao(
            botao,
            false,
            "Publicar no site"
        );
    }
}


// =========================================
// GALERIA - CARREGAR
// =========================================

async function carregarGaleria() {
    const lista =
        document.getElementById("listaGaleria");

    if (!lista) return;

    lista.innerHTML =
        "<p>Carregando galeria...</p>";

    const { data, error } = await supabaseClient
        .from("gallery")
        .select("*")
        .eq("profile_id", perfilId)
        .order("created_at", {
            ascending: false
        });

    if (error) {
        lista.innerHTML =
            `<p>Erro ao carregar: ${escaparHtml(error.message)}</p>`;

        return;
    }

    atualizarGuiaGaleria(data || []);

    if (!data || data.length === 0) {
        lista.innerHTML =
            "<p>Nenhuma foto cadastrada.</p>";

        return;
    }

    lista.innerHTML =
        data.map(criarCardGaleria).join("");

    lista
        .querySelectorAll("[data-excluir-galeria]")
        .forEach((botao) => {
            botao.addEventListener("click", () => {
                excluirGaleria(
                    botao.dataset.excluirGaleria
                );
            });
        });
}

function atualizarGuiaGaleria(itens = []) {
    const guia = document.getElementById("guiaGaleriaImagens");
    if (!guia) return;

    const imagens = itens
        .flatMap((item) => [item.imagem, item.imagem_depois])
        .filter(Boolean)
        .slice(0, 2);

    if (imagens.length === 0) return;

    guia.innerHTML = imagens
        .map((url) => `<span><img src="${escaparHtml(url)}" alt=""></span>`)
        .join("");
}


// =========================================
// GALERIA - CARD
// =========================================

function criarCardGaleria(item) {
    const antesDepois =
        item.tipo === "antes_depois" &&
        item.imagem_depois;

    const nomeTipo =
        antesDepois
            ? "Antes e Depois"
            : "Trabalho";

    const titulo =
        item.titulo || nomeTipo;

    return `
        <article class="itemGaleria">

            <div class="imagensItemGaleria ${antesDepois ? "duasImagens" : ""}">

                <div class="imagemComLegenda">

                    ${antesDepois ? "<span>Antes</span>" : ""}

                    <img
                        src="${escaparHtml(item.imagem || "")}"
                        alt="${escaparHtml(titulo)}"
                    >

                </div>

                ${
                    antesDepois
                        ? `
                            <div class="imagemComLegenda">

                                <span>Depois</span>

                                <img
                                    src="${escaparHtml(item.imagem_depois)}"
                                    alt="Depois"
                                >

                            </div>
                        `
                        : ""
                }

            </div>

            <div class="informacoesItemGaleria">

                <strong>
                    ${escaparHtml(titulo)}
                </strong>

                <small>
                    ${nomeTipo}
                </small>

                <button
                    type="button"
                    class="botaoExcluirGaleria"
                    data-excluir-galeria="${item.id}"
                >
                    Excluir
                </button>

            </div>

        </article>
    `;
}


// =========================================
// GALERIA - EXCLUIR
// =========================================

async function excluirGaleria(id) {
    const confirmar = confirm(
        "Deseja realmente excluir este item?"
    );

    if (!confirmar) return;

    const { data: item, error: erroBusca } =
        await supabaseClient
            .from("gallery")
            .select(
                "caminho_imagem, caminho_imagem_depois"
            )
            .eq("id", id)
            .single();

    if (erroBusca) {
        alert(
            "Erro ao localizar o item: " +
                erroBusca.message
        );

        return;
    }

    const { error: erroExclusao } =
        await supabaseClient
            .from("gallery")
            .delete()
            .eq("id", id);

    if (erroExclusao) {
        alert(
            "Erro ao excluir: " +
                erroExclusao.message
        );

        return;
    }

    const caminhos = [
        item?.caminho_imagem,
        item?.caminho_imagem_depois
    ].filter(Boolean);

    if (caminhos.length > 0) {
        const { error: erroStorage } =
            await supabaseClient.storage
                .from(bucketImagens)
                .remove(caminhos);

        if (erroStorage) {
            console.warn(
                "Erro ao excluir imagens do Storage:",
                erroStorage
            );
        }
    }

    mostrarMensagemGaleria(
        "Item excluído com sucesso!",
        "sucesso"
    );

    await carregarGaleria();
}


// =========================================
// FUNÇÕES AUXILIARES
// =========================================

function alterarBotao(botao, carregando, texto) {
    if (!botao) return;

    botao.disabled = carregando;
    botao.textContent = texto;
}

function escaparHtml(valor = "") {
    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
function configurarSeletorTipoGaleria() {
    const select =
        document.getElementById("tipoGaleria");

    const opcoes =
        document.querySelectorAll(
            "[data-tipo-galeria]"
        );

    if (!select || !opcoes.length) {
        return;
    }

    opcoes.forEach((opcao) => {
        opcao.addEventListener("click", () => {
            const tipo =
                opcao.dataset.tipoGaleria;

            select.value = tipo;

            opcoes.forEach((item) => {
                item.classList.toggle(
                    "ativa",
                    item.dataset.tipoGaleria === tipo
                );
            });

            atualizarTipoGaleria();
        });
    });
}


// =========================================
// EVENTOS
// =========================================

window.addEventListener("DOMContentLoaded", async () => {
    const logado = await verificarLogin();

    if (!logado) return;

    const paginas = [
        "dashboard",
        "perfil",
        "galeria",
        "redes"
    ];

    paginas.forEach((nome) => {
        const nomeMenu =
            "menu" +
            nome.charAt(0).toUpperCase() +
            nome.slice(1);

        document
            .getElementById(nomeMenu)
            ?.addEventListener(
                "click",
                () => abrirPagina(nome)
            );
    });

    document
        .getElementById("salvarPerfil")
        ?.addEventListener(
            "click",
            salvarPerfil
        );

    document
        .getElementById("salvarFoto")
        ?.addEventListener(
            "click",
            salvarFoto
        );

    document
        .getElementById("salvarRedes")
        ?.addEventListener(
            "click",
            salvarRedes
        );

    document
        .getElementById("tipoGaleria")
        ?.addEventListener(
            "change",
            atualizarTipoGaleria
        );

    document
        .getElementById("salvarGaleria")
        ?.addEventListener(
            "click",
            salvarGaleria
        );

    document
        .getElementById("atualizarGaleria")
        ?.addEventListener(
            "click",
            carregarGaleria
        );

    document
        .getElementById("logout")
        ?.addEventListener(
            "click",
            logout
        );

    // Foto de perfil em formato quadrado
configurarInputComCropper(
    "foto",
    "previewFoto",
    null,
    {
        largura: 800,
        altura: 800,
        proporcao: 1
    }
);

// Trabalhos em formato 4:5
configurarInputComCropper(
    "fotoTrabalho",
    "previewTrabalho",
    "previewTrabalhoContainer",
    {
        largura: 1080,
        altura: 1350,
        proporcao: 4 / 5
    }
);

// Antes em formato 4:5
configurarInputComCropper(
    "fotoAntes",
    "previewAntes",
    "previewAntesContainer",
    {
        largura: 1080,
        altura: 1350,
        proporcao: 4 / 5
    }
);

// Depois em formato 4:5
configurarInputComCropper(
    "fotoDepois",
    "previewDepois",
    "previewDepoisContainer",
    {
        largura: 1080,
        altura: 1350,
        proporcao: 4 / 5
    }
);
    configurarSeletorTipoGaleria();

    atualizarTipoGaleria();

    await carregarPerfil();

    abrirPagina("dashboard");
});
