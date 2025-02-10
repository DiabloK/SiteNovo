// templateProcessor.js
export function processTemplate(template, item) {
    let message = template;
    message = message.replace("{Nome}", item.Nome || "");
    message = message.replace(
      "{horarioInicial}",
      item.horarioInicial
        ? new Date(item.horarioInicial).toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short"
          })
        : ""
    );
    message = message.replace(
      "{horarioPrevisto}",
      item.horarioPrevisto
        ? new Date(item.horarioPrevisto).toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short"
          })
        : ""
    );
    // Você pode adicionar mais substituições conforme os placeholders necessários
    return message;
  }
  