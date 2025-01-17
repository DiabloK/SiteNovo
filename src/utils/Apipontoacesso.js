const fetchPontosAcesso = async () => {
    try {
        const ggnetResponse = await fetch("https://api.ggnet.com.br/pontosAcesso"); // Exemplo
        const altResponse = await fetch("https://api.alt.com.br/pontosAcesso"); // Exemplo

        const ggnetData = await ggnetResponse.json();
        const altData = await altResponse.json();

        // Combinar dados
        const combinedData = [...ggnetData, ...altData].reduce((unique, item) => {
            // Evitar duplicatas (baseado no campo 'codcon')
            if (!unique.some((u) => u.codcon === item.codcon)) {
                unique.push(item);
            }
            return unique;
        }, []);

        return combinedData;
    } catch (error) {
        console.error("Erro ao buscar pontos de acesso:", error);
        return [];
    }
};
