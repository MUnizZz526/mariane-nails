function prepararAnimacoesDaInterface() {
    const seletores = [
        ".perfilLinktree",
        ".linkLinktree",
        ".fotoPreviaAtendimento",
        ".atendimentoHero",
        ".cardAtendimento",
        ".mobileHeroCard",
        ".mobileWhatsappPrincipal",
        ".mobileAcaoCard",
        ".mobileSecao",
        ".mobileFinalCard",
        ".card-trabalho",
        ".card-antes-depois",
        ".precoCard",
        ".valoresCTA"
    ];

    const elementos = Array.from(
        document.querySelectorAll(seletores.join(","))
    );

    elementos.forEach((elemento, indice) => {
        elemento.classList.add("revelarInterface");
        elemento.style.setProperty("--atraso-revelar", `${Math.min(indice % 6, 5) * 55}ms`);
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        elementos.forEach((elemento) => elemento.classList.add("reveladoInterface"));
        return;
    }

    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (!entrada.isIntersecting) return;
            entrada.target.classList.add("reveladoInterface");
            observador.unobserve(entrada.target);
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -24px"
    });

    elementos.forEach((elemento) => observador.observe(elemento));
}

window.addEventListener("DOMContentLoaded", prepararAnimacoesDaInterface);

window.addEventListener("interfaceAtualizada", prepararAnimacoesDaInterface);
