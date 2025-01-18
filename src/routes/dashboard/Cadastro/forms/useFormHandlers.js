// Restringe a entrada de protocolo ISP a números
export const handleProtocoloChange = (setFormData) => (e) => {
    const valor = e.target.value;
    const valorLimpo = valor.replace(/\D/g, ""); // Remove caracteres não numéricos
    setFormData((prev) => ({
        ...prev,
        protocoloISP: valorLimpo,
    }));
};

// Remove espaços em branco ao sair do campo
export const handleProtocoloBlur = (setFormData, formData) => () => {
    setFormData((prev) => ({
        ...prev,
        protocoloISP: formData.protocoloISP.trim(),
    }));
};
