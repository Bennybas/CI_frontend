import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { CircleX } from 'lucide-react';
import { fetchNewsletters } from './newsletterApi';
import Competitors from '../Comp_Page/Competitors';

const TherapeuticArea = () => {
    const [cards, setCards] = useState([]);
    const [error, setError] = useState(null);
    const [flipped, setFlipped] = useState({});
    const navigate = useNavigate(); // Hook for navigation

    useEffect(() => {
        const loadNewsletters = async () => {
            try {
                const data = await fetchNewsletters();
                
                // Group by therapeutic_area
                const groupedCards = data.reduce((acc, item) => {
                    const { therapeutic_area, molecule } = item;
                    
                    if (!acc[therapeutic_area]) {
                        acc[therapeutic_area] = {
                            therapeutic_area,
                            molecules: new Set()
                        };
                    }
                    acc[therapeutic_area].molecules.add(molecule);
                    return acc;
                }, {});
                
                setCards(Object.values(groupedCards).map(group => ({
                    ...group,
                    molecules: Array.from(group.molecules)
                })));
                setError(null);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching newsletters:', err);
            }
        };

        loadNewsletters();
    }, []);

    const handleMoleculeClick = (molecule) => {
        console.log(`Navigating to Competitors for molecule: ${molecule}`);
        navigate(`/competitors_page`); // Navigate to Competitors page
    };

    const handleCloseClick = (index, e) => {
        e.stopPropagation();
        setFlipped(prev => ({ ...prev, [index]: false }));
    };
    
    if (error) return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-red-500 text-lg">Error: {error}</div>
        </div>
    );

    return (
        <div className="flex flex-col gap-4 px-8 w-full pt-[7.5rem]">
            {cards.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-4">
                    {cards.map((card, index) => (
                        <div
                            key={index}
                            className="relative w-full max-w-[250px] min-h-[16rem]"
                            style={{ perspective: '1000px' }}
                        >
                            <div 
                                onClick={() => setFlipped(prev => ({ 
                                    ...prev, 
                                    [index]: !prev[index] 
                                }))}
                                className="relative w-full h-full transition-transform duration-500 cursor-pointer"
                                style={{ 
                                    transformStyle: 'preserve-3d',
                                    transform: flipped[index] ? 'rotateY(180deg)' : 'rotateY(0deg)'
                                }}
                            >
                                {/* Front Side */}
                                <div 
                                    className="absolute w-full h-full backface-hidden bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-between shadow-lg"
                                    style={{ backfaceVisibility: 'hidden' }}
                                >
                                    <div className="flex items-center justify-center h-[150px] w-full">
                                        <img
                                            src={'/png/icon3.png'}
                                            className="max-w-[50%] max-h-[100%] object-contain"
                                        />
                                    </div>
                                    <div className="text-center w-full">
                                        <h2 className="text-lg font-medium">
                                            {card.therapeutic_area}
                                        </h2>
                                    </div>
                                </div>

                                {/* Back Side */}
                                <div 
                                    className="absolute w-full h-full bg-white border border-gray-200 rounded-xl p-4 shadow-lg"
                                    style={{ 
                                        backfaceVisibility: 'hidden',
                                        transform: 'rotateY(180deg)'
                                    }}
                                >
                                    <CircleX 
                                        className="absolute top-2 right-2 w-4 h-4 cursor-pointer hover:text-gray-700"
                                        onClick={(e) => handleCloseClick(index, e)}
                                    />
                                    <div className="h-full overflow-y-auto mt-6">
                                        <div className="flex flex-col gap-2">
                                            {card.molecules.map((molecule, i) => (
                                                <button
                                                    key={i}
                                                    className="bg-[#c98b27]/90 text-white px-4 py-2 rounded-md shadow-md hover:bg-[#c98b27] transition"
                                                    onClick={() => handleMoleculeClick(molecule)}
                                                    style={{ fontSize: '14px', fontWeight:500 }}
                                                >
                                                    {molecule}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500 text-lg"></div>
            )}
        </div>
    );
};

export default TherapeuticArea;
