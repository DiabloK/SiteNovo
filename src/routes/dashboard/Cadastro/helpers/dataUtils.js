// Filtra os pontos de acesso pelas cidades selecionadas
export const filtrarPontosPorCidade = (formData, pontosAcesso) => {
    if (!formData.cidadesSelecionadas || formData.cidadesSelecionadas.length === 0) {
        return [];
    }

    const nomesCidadesSelecionadas = formData.cidadesSelecionadas
        .map((cidade) => (cidade?.nome || "").trim().toLowerCase())
        .filter((nome) => nome !== ""); // Remove valores inválidos

    const pontosFiltrados = pontosAcesso.filter((ponto) => {
        const nomeCidadePonto = (ponto?.nome_cid || "").trim().toLowerCase();
        return nomesCidadesSelecionadas.includes(nomeCidadePonto);
    });

    return pontosFiltrados;
};

// Divide a manutenção em partes
export const dividirManutencao = (inicio, fim, partes) => {
    const inicioTime = new Date(inicio).getTime();
    const fimTime = new Date(fim).getTime();
    const intervalo = (fimTime - inicioTime) / partes;

    const partesDivididas = {};
    for (let i = 0; i < partes; i++) {
        const inicioParte = new Date(inicioTime + i * intervalo).toISOString();
        const fimParte = new Date(inicioTime + (i + 1) * intervalo).toISOString();

        partesDivididas[`${i + 1}-parte`] = {
            "Inicio Horario": i === 0 ? inicio : null, // Apenas a primeira parte recebe o horário inicial
            "Previsto Horario": i === 0 ? fim : null, // Apenas a primeira parte recebe o horário previsto
            "Fim Horario": null, // Valores temporários
        };
    }

    return partesDivididas;
};
