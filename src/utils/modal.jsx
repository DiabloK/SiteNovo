const Modal = ({ isOpen, title, children, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <div className="border-b p-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
        </div>
        <div className="p-4">{children}</div>
        <div className="flex justify-end border-t p-4 dark:border-gray-700">
          <button
            onClick={onClose}
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
