console.log("galeria.js carregou");


async function carregarGaleria(){


    const { data, error } = await supabaseClient
        .from("gallery")
        .select("*")
        .eq("profile_id", "f30eedbf-1c8a-4c1d-a44d-18ee493ad9bf")
        .order("created_at", { ascending: false });



    console.log("DATA:", data);

    console.log("ERRO:", error);



    if(error){

        console.log("Erro ao carregar galeria:", error);

        return;

    }



    const galeria = document.querySelector(".galeria");


    galeria.innerHTML = "";



    data.forEach(foto => {


        galeria.innerHTML += `

            <img 
            src="${foto.imagem}" 
            alt="Trabalho realizado">

        `;


    });




    // Lightbox

    const imagens = document.querySelectorAll(".galeria img");

    const lightbox = document.querySelector(".lightbox");

    const imagemGrande = document.querySelector(".lightbox img");



    imagens.forEach(imagem => {


        imagem.addEventListener("click",()=>{


            lightbox.classList.add("active");


            imagemGrande.src = imagem.src;


        });


    });



    lightbox.addEventListener("click",()=>{


        lightbox.classList.remove("active");


    });



}



carregarGaleria();