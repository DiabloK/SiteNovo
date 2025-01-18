import { doc, getDoc } from "firebase/firestore";

// Valida o formulário antes de salvar
export const validarFormulario = async (formData, selectedPontos, db) => {
    if (!formData.protocoloISP.trim()) return "O protocolo ISP é obrigatório.";
    if (!formData.horarioInicial) return "O horário inicial é obrigatório.";
    if (!formData.horarioPrevisto) return "O horário previsto é obrigatório.";
    if (selectedPontos.length === 0) return "Selecione pelo menos um ponto de acesso.";
    if (new Date(formData.horarioPrevisto) <= new Date(formData.horarioInicial)) {
        return "O horário previsto deve ser maior que o horário inicial.";
    }

    // Verifica se o protocolo já existe
    const protocoloRef = doc(db, "protocolos", formData.protocoloISP);
    const protocoloSnap = await getDoc(protocoloRef);
    if (protocoloSnap.exists()) {
        return "O protocolo ISP já existe. Escolha outro.";
    }

    return null; // Tudo certo
};
