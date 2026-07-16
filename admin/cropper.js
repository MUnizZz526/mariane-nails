// =========================================
// CROPPER.JS - RECORTE DE IMAGENS
// =========================================

const arquivosRecortados = new Map();
const urlsPreview = new Map();

let cropperAtivo = null;
let inputAtual = null;
let configuracaoAtual = null;
let urlImagemOriginal = null;


// =========================================
// CONFIGURAR INPUT
// =========================================

function configurarInputComCropper(
    inputId,
    previewId,
    containerId = null,
    opcoes = {}
) {
    const input = document.getElementById(inputId);

    if (!input) return;

    input.addEventListener("change", () => {
        const arquivo = input.files[0];

        if (!arquivo) return;

        if (!arquivo.type.startsWith("image/")) {
            alert("Escolha um arquivo de imagem.");
            input.value = "";
            return;
        }

        if (arquivo.size > 12 * 1024 * 1024) {
            alert("A imagem deve ter no máximo 12 MB.");
            input.value = "";
            return;
        }

        inputAtual = {
            id: inputId,
            elemento: input,
            previewId,
            containerId
        };

        configuracaoAtual = {
            largura: opcoes.largura || 1080,
            altura: opcoes.altura || 1350,
            proporcao:
                opcoes.proporcao ||
                (opcoes.largura || 1080) /
                (opcoes.altura || 1350),
            qualidade: opcoes.qualidade || 0.9
        };

        abrirEditorRecorte(arquivo);
    });
}


// =========================================
// ABRIR EDITOR
// =========================================

function abrirEditorRecorte(arquivo) {
    const modal = document.getElementById("modalRecorte");
    const imagem = document.getElementById("imagemRecorte");

    if (!modal || !imagem) {
        alert("O editor de recorte não foi encontrado.");
        return;
    }

    destruirCropper();

    urlImagemOriginal = URL.createObjectURL(arquivo);

    imagem.src = urlImagemOriginal;

    modal.classList.remove("escondido");
    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("recorteAberto");

    imagem.onload = () => {
        cropperAtivo = new Cropper(imagem, {
            aspectRatio: configuracaoAtual.proporcao,
            viewMode: 1,
            dragMode: "move",
            autoCropArea: 1,
            responsive: true,
            background: false,
            guides: true,
            center: true,
            highlight: false,
            movable: true,
            zoomable: true,
            rotatable: false,
            scalable: false
        });
    };
}


// =========================================
// CONFIRMAR RECORTE
// =========================================

function confirmarRecorteImagem() {
    if (
        !cropperAtivo ||
        !inputAtual ||
        !configuracaoAtual
    ) {
        return;
    }

    const botao =
        document.getElementById("confirmarRecorte");

    alterarTextoBotaoRecorte(
        botao,
        true,
        "Processando..."
    );

    const canvas = cropperAtivo.getCroppedCanvas({
        width: configuracaoAtual.largura,
        height: configuracaoAtual.altura,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
        fillColor: "#ffffff"
    });

    if (!canvas) {
        alterarTextoBotaoRecorte(
            botao,
            false,
            "Usar imagem"
        );

        alert("Não foi possível recortar a imagem.");
        return;
    }

    canvas.toBlob(
        (blob) => {
            if (!blob) {
                alterarTextoBotaoRecorte(
                    botao,
                    false,
                    "Usar imagem"
                );

                alert("Não foi possível gerar a imagem.");
                return;
            }

            const nomeArquivo =
                `imagem-${Date.now()}.jpg`;

            const arquivoFinal = new File(
                [blob],
                nomeArquivo,
                {
                    type: "image/jpeg",
                    lastModified: Date.now()
                }
            );

            arquivosRecortados.set(
                inputAtual.id,
                arquivoFinal
            );

            atualizarPreviewRecortado(
                inputAtual,
                arquivoFinal
            );

            alterarTextoBotaoRecorte(
                botao,
                false,
                "Usar imagem"
            );

            fecharEditorRecorte(false);
        },
        "image/jpeg",
        configuracaoAtual.qualidade
    );
}


// =========================================
// ATUALIZAR PREVIEW
// =========================================

function atualizarPreviewRecortado(
    dadosInput,
    arquivo
) {
    const preview =
        document.getElementById(
            dadosInput.previewId
        );

    const container =
        dadosInput.containerId
            ? document.getElementById(
                dadosInput.containerId
            )
            : null;

    if (!preview) return;

    const urlAntiga =
        urlsPreview.get(dadosInput.id);

    if (urlAntiga) {
        URL.revokeObjectURL(urlAntiga);
    }

    const novaUrl =
        URL.createObjectURL(arquivo);

    urlsPreview.set(
        dadosInput.id,
        novaUrl
    );

    preview.src = novaUrl;

    if (container) {
        container.classList.remove("escondido");
    }
}


// =========================================
// FECHAR OU CANCELAR
// =========================================

function fecharEditorRecorte(cancelado = true) {
    const modal =
        document.getElementById("modalRecorte");

    const imagem =
        document.getElementById("imagemRecorte");

    if (cancelado && inputAtual) {
        inputAtual.elemento.value = "";
    }

    modal?.classList.add("escondido");
    modal?.setAttribute("aria-hidden", "true");

    document.body.classList.remove(
        "recorteAberto"
    );

    destruirCropper();

    if (imagem) {
        imagem.removeAttribute("src");
    }

    inputAtual = null;
    configuracaoAtual = null;
}


// =========================================
// DESTRUIR CROPPER
// =========================================

function destruirCropper() {
    if (cropperAtivo) {
        cropperAtivo.destroy();
        cropperAtivo = null;
    }

    if (urlImagemOriginal) {
        URL.revokeObjectURL(urlImagemOriginal);
        urlImagemOriginal = null;
    }
}


// =========================================
// OBTER E LIMPAR ARQUIVOS
// =========================================

function obterArquivoRecortado(inputId) {
    return arquivosRecortados.get(inputId) || null;
}

function limparArquivoRecortado(inputId) {
    arquivosRecortados.delete(inputId);

    const url = urlsPreview.get(inputId);

    if (url) {
        URL.revokeObjectURL(url);
        urlsPreview.delete(inputId);
    }

    const input =
        document.getElementById(inputId);

    if (input) {
        input.value = "";
    }
}


// =========================================
// BOTÃO
// =========================================

function alterarTextoBotaoRecorte(
    botao,
    carregando,
    texto
) {
    if (!botao) return;

    botao.disabled = carregando;
    botao.textContent = texto;
}


// =========================================
// EVENTOS DO EDITOR
// =========================================

window.addEventListener("DOMContentLoaded", () => {
    document
        .getElementById("confirmarRecorte")
        ?.addEventListener(
            "click",
            confirmarRecorteImagem
        );

    document
        .getElementById("cancelarRecorte")
        ?.addEventListener(
            "click",
            () => fecharEditorRecorte(true)
        );

    document
        .getElementById("fecharRecorte")
        ?.addEventListener(
            "click",
            () => fecharEditorRecorte(true)
        );

    document
        .getElementById("aumentarZoom")
        ?.addEventListener(
            "click",
            () => cropperAtivo?.zoom(0.1)
        );

    document
        .getElementById("diminuirZoom")
        ?.addEventListener(
            "click",
            () => cropperAtivo?.zoom(-0.1)
        );

    document
        .getElementById("modalRecorte")
        ?.addEventListener(
            "click",
            (evento) => {
                if (
                    evento.target.id ===
                    "modalRecorte"
                ) {
                    fecharEditorRecorte(true);
                }
            }
        );

    document.addEventListener(
        "keydown",
        (evento) => {
            if (
                evento.key === "Escape" &&
                !document
                    .getElementById("modalRecorte")
                    ?.classList.contains("escondido")
            ) {
                fecharEditorRecorte(true);
            }
        }
    );
});