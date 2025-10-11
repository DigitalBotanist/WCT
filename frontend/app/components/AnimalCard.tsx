import type AnimalInfo from "~/interfaces/AnimalInfo";
import AnimalInfoButton from "./AnimalInfoButton";
import AnimalProperty from "./AnimalProperty";

interface AnimalCardProps {
    animalImg: string | null;
    animal: AnimalInfo; // Assuming AnimalInfo is a predefined type
    handleDescribe: () => void;
    handleAnalyzeMigrationPattern: () => void;
    handleTreatLevels: () => void;
}

const AnimalCard: React.FC<AnimalCardProps> = ({
    animalImg,
    animal,
    handleDescribe,
    handleAnalyzeMigrationPattern,
    handleTreatLevels,
}) => {
    return (
        <div className="text-text-300 w-2/7 flex m-3 rounded-xl flex-col gap-4  p-3 bg-gradient-to-br from-primary-600 via-primary-900 to-primary-700">
            <div className="flex-1 bg-background-700 rounded-4xl p-2 flex gap-2 flex-col items-center">
                <div className="flex flex-col items-center">
                    <h3 className="font-bold">{animal.name}</h3>
                    <h3 className="text-sm">{animal.scientific_name}</h3>
                </div>

                {/* img */}
                {animalImg && (
                    <img
                        src={animalImg}
                        alt=""
                        className="rounded-2xl h-[300px] object-cover"
                    />
                )}

                <div className="text-sm rounded-2xl flex flex-col gap-1 items-center w-full bg-background-800 p-2">
                    <h3>Taxonomy</h3>
                    <div className="w-full flex gap-2 items-center">
                        <AnimalProperty
                            title="Phylum"
                            property={animal.phylum}
                        />
                        <AnimalProperty title="Class" property={animal.class} />
                        <AnimalProperty title="Order" property={animal.order} />
                    </div>
                    <div className="w-full flex gap-2 items-center">
                        <AnimalProperty
                            title="Family"
                            property={animal.family}
                        />
                        <AnimalProperty title="Genus" property={animal.genus} />
                        <AnimalProperty
                            title="Species"
                            property={animal.species}
                        />
                    </div>
                </div>
                <div className="text-sm rounded-2xl flex flex-col gap-1 items-center w-full bg-background-800 p-2">
                    <h3>Habitat</h3>
                    <div className="w-full flex gap-2 items-center">
                        <AnimalProperty
                            title="Locations"
                            property={animal.locations}
                        />
                        <AnimalProperty
                            title="Climate"
                            property={animal.climate}
                            isFlexOne={false}
                        />
                    </div>
                </div>
                <div className="text-sm rounded-2xl flex flex-col gap-1 items-center w-full bg-background-800 p-2">
                    <h3>Diet</h3>
                    <div className="w-full flex gap-2 items-center">
                        <AnimalProperty
                            title="Order"
                            property={animal.order}
                            isFlexOne={false}
                        />
                        <AnimalProperty title="Food" property={animal.diet} />
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <AnimalInfoButton
                    text="Describe"
                    handleClick={handleDescribe}
                />
                <AnimalInfoButton
                    text="Analyze migration"
                    handleClick={handleAnalyzeMigrationPattern}
                />
                {/* <AnimalInfoButton
                            text="Show migration pattern"
                            handleClick={handleShowMigrationPattern}
                        /> */}
                <AnimalInfoButton
                    text="Treat levels"
                    handleClick={handleTreatLevels}
                />
                {/* <button className="bg-red-900 p-3 rounded-lg">
                            Describe
                        </button> */}
            </div>
        </div>
    );
};

export default AnimalCard;
