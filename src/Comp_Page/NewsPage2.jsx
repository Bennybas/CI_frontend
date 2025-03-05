import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, Share2, Check, BrainCog } from 'lucide-react';

const NewsPage2 = ({ passedCompetitors = [], switchPage }) => {
    const [activeTab, setActiveTab] = useState('Latest News');
    const [companiesData, setCompaniesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newsletterItems, setNewsletterItems] = useState([]);

    // Buttons for tabs
    const buttons = [
        { title: "Latest News", path: "Latest News" },
        { title: "Website Content", path: "Website Content" },
        { title: "Additional Sources", path: "Additional Sources" },
        { title: "Regulatory", path: "Regulatory" }
    ];

    // Load existing newsletter items on component mount
    useEffect(() => {
        const storedItems = JSON.parse(localStorage.getItem('newsletterItems') || '[]');
        setNewsletterItems(storedItems);
    }, []);

    // Fetch competitor data
    useEffect(() => {
        // If no competitors are passed, set loading to false
        if (passedCompetitors.length === 0) {
            setLoading(false);
            return;
        }

        const fetchCompetitorData = async () => {
            try {
                setLoading(true);
                const response = await fetch("https://ci-backend-1.onrender.com/api/daily_newsletters");
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                
                const data = await response.json();
                
                // Find all matching competitor data
                const matchedCompetitorData = data.filter(item => 
                    passedCompetitors.includes(item.competitor)
                );

                if (matchedCompetitorData.length > 0) {
                    setCompaniesData(matchedCompetitorData);
                } else {
                    // If no matching competitors found, set to empty array
                    setCompaniesData([]);
                }
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching competitor data:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchCompetitorData();
    }, [passedCompetitors]);

    // Handle adding item to newsletter
    const handleAddToNewsletter = (companyData, cardConfig) => {
        let itemData;
        
        // Determine the correct data based on the card configuration
        if (cardConfig.index !== undefined) {
            // For additional sources and regulatory which are arrays
            itemData = companyData[cardConfig.dataKey]?.[cardConfig.index];
        } else {
            // For latest news and website content which are objects
            itemData = companyData[cardConfig.dataKey];
        }

        if (!itemData) return;

        // Create unique ID for the newsletter item
        const itemId = `${companyData.competitor}-${cardConfig.dataKey}`;
        
        // Check if item is already in newsletter
        const isAlreadyAdded = newsletterItems.some(item => item.id === itemId);
        if (isAlreadyAdded) return;

        // Create a newsletter item
        const newsletterItem = {
            id: itemId,
            company: companyData.competitor,
            title: itemData.topic,
            date: itemData.date,
            source: itemData.source,
            content: itemData.content,
            category: cardConfig.title
        };

        // Save to local storage
        const updatedItems = [...newsletterItems, newsletterItem];
        setNewsletterItems(updatedItems);
        localStorage.setItem('newsletterItems', JSON.stringify(updatedItems));

        // Optionally, send to backend
        fetch('https://ci-backend-1.onrender.com/api/add_newsletter_item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newsletterItem)
        }).catch(error => {
            console.error('Error saving newsletter item:', error);
        });
    };

    // Card configurations for different sections
    const createCardConfigs = () => [
        {
            title: "Latest News",
            path: "Latest News",
            dataKey: 'latest_news'
        },
        {
            title: "Website Content",
            path: "Website Content",
            dataKey: 'website_content'
        },
        {
            title: "Additional Sources",
            path: "Additional Sources",
            dataKey: 'additional_sources',
            index: 0
        },
        {
            title: "Regulatory",
            path: "Regulatory",
            dataKey: 'regulatory',
            index: 0
        }
    ];

    // Render loading state
    if (loading) {
        return (
            <div className='bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 mt-[4rem] flex items-center justify-center'>
                <p className="text-gray-500">Loading news data...</p>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className='bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 mt-[4rem] flex items-center justify-center'>
                <p className="text-red-500">Error loading data: {error}</p>
            </div>
        );
    }

    // Render when no competitors are selected
    if (!passedCompetitors || passedCompetitors.length === 0) {
        return (
            <div className='bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 mt-[4rem] flex items-center justify-center'>
                <p className="text-gray-500">Please select a competitor to view news</p>
            </div>
        );
    }

    // Render when no data is found for selected competitors
    if (companiesData.length === 0) {
        return (
            <div className='bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 mt-[4rem] flex items-center justify-center'>
                <p className="text-gray-500">No news data available for selected competitors</p>
            </div>
        );
    }

    // Get the selected data based on active tab
    const getFilteredData = (companyData) => {
        const config = createCardConfigs().find(config => config.path === activeTab);
        if (!config) return null;

        let cardData;
        if (config.index !== undefined) {
            // For additional sources and regulatory which are arrays
            cardData = companyData?.[config.dataKey]?.[config.index];
        } else {
            // For latest news and website content which are objects
            cardData = companyData?.[config.dataKey];
        }

        return { config, cardData };
    };

    return (
        <div className='bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 mt-[3.5rem]'>
            <div className='flex fixed rounded border w-full bg-[#f2f2f0] h-10 justify-center items-center gap-4 p-2 shadow-lg left-0 right-0'>
                {buttons.map((option, i) => (
                    <div 
                        key={i}
                        onClick={() => setActiveTab(option.path)}
                        className={`flex px-3 py-1 rounded-md gap-2 items-center cursor-pointer text-sm text-[12px] font-medium
                            ${activeTab === option.path 
                                ? "bg-[#004567] text-[#f0f3f7]" 
                                : "text-gray-800 bg-white hover:bg-[#004567]/80 hover:text-[#f0f3f7]"
                            }`
                        }
                    >
                        {option.title}
                    </div>
                ))}
            </div>

            <div className='flex flex-wrap py-2 gap-4 mt-[3.5rem]'>
                {companiesData.map((companyData, companyIndex) => {
                    const filteredData = getFilteredData(companyData);
                    if (!filteredData || !filteredData.cardData) return null;

                    const { config, cardData } = filteredData;
                    const itemId = `${companyData.competitor}-${config.dataKey}`;
                    const isAlreadyAdded = newsletterItems.some(item => item.id === itemId);

                    return (
                        <div 
                            key={companyIndex} 
                            className='w-[calc(50%-1rem)] rounded-lg border border-gray-300 h-[18rem] bg-white shadow-lg'
                        >
                            <div className='h-10 bg-[#c98b27] w-full rounded-t-lg flex items-center px-3 justify-between'>
                                <span className="text-[#FFFFFF] text-sm font-semibold tracking-wider flex-grow">    
                                    {companyData.competitor} ({activeTab})
                                </span>
                                <div className='flex gap-2'>
                                    
                                    <Share2 className='w-4 h-4 text-white cursor-pointer'/>
                                    <button 
                                        onClick={() => switchPage("aivy")}
                                        className="focus:outline-none"
                                    >
                                        <BrainCog className='w-4 h-4 text-white cursor-pointer'/>
                                    </button>
                                </div>
                            </div>
                   
                            <div className='flex flex-col gap-1 p-2'>
                                <div className='flex flex-col bg-[#f0efed] rounded-md w-full p-1 gap-1'>
                                    <div className='flex w-full justify-between p-1'>
                                    <span className='font-semibold text-[#004567] text-[12px]'>
                                            {cardData.topic}
                                        </span>
                                        {isAlreadyAdded ? (
                                            <Check className="text-green-600 w-4 h-4" />
                                        ) : (
                                            <div 
                                                className='rounded-full border border-gray-700 cursor-pointer'
                                                onClick={() => handleAddToNewsletter(companyData, config)}
                                            >
                                                <Plus className='w-4 h-4'/>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className='flex w-full justify-between'>
                                        <div className='flex rounded rounded-xl border px-1 items-center border-gray-400 cursor-pointer hover:bg-[#b0b0b0]'>
                                            <span className='font-md text-gray-700 text-[10px]'>
                                                {cardData.source}
                                            </span>
                                        </div>

                                        <span className='font-md text-gray-700 text-[10px]'>
                                            {cardData.date}
                                        </span>
                                    </div>

                                    <div className='flex flex-col gap-1 bg-white w-full p-2'>
                                        <span className='text-[10px] font-[500] text-gray-700 leading-relaxed'>
                                            {cardData.content || "No content available"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default NewsPage2;