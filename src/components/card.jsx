const Card = ({ icon: Icon, title, value, children }) => (
    <div className="card">
        <div className="card-header flex items-center gap-2">
            {Icon && <Icon className="icon" size={26} />}
            <p className="card-title">{title}</p>
        </div>
        <div className="card-body">{value ? <p className="text-3xl font-bold">{value}</p> : children}</div>
    </div>
);

export default Card;
