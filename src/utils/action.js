// src/utils/actions.js
export const handleEdit = (idProtocolo, navigate) => {
    const path = `/visualizacao/${idProtocolo}`;
    navigate(path); // Redireciona o usuário para o caminho
};

export const handleDelete = (idProtocolo, setShowModal) => {
    console.log(`Excluindo protocolo: ${idProtocolo}`);
    setShowModal(true); // Exibe o modal de confirmação
};

export const handleComplete = (idProtocolo) => {
    console.log(`Concluindo protocolo: ${idProtocolo}`);
    // Aqui você pode implementar lógica adicional para conclusão
};
