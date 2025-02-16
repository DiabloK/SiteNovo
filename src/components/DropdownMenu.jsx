import  { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom"; // Se estiver usando React Router

const DropdownMenu = ({ label, icon: Icon, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-3 text-white bg-gray-800 rounded-lg hover:bg-gray-700"
      >
        <div className="flex items-center">
          <Icon className="w-5 h-5 mr-2" />
          <span>{label}</span>
        </div>
        <ChevronDown className={`w-5 h-5 transition ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 w-full mt-2 bg-gray-900 rounded-lg shadow-lg">
          {children.map((child, index) => (
            <Link
              key={index}
              to={child.path}
              className="block px-4 py-2 text-white hover:bg-gray-700 rounded-lg"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
