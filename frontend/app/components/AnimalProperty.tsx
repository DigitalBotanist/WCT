const AnimalProperty = ({
    title,
    property,
    isFlexOne = true,
}: {
    title: string;
    property: string;
    isFlexOne?: boolean;
}) => {
    return (
        <div className={`${isFlexOne && 'flex-1' } flex flex-col items-center bg-background-400 p-2 rounded-lg`}>
            <h4 className="font-bold">{title}</h4>
            <p>{property}</p>
        </div>
    );
};

export default AnimalProperty;
