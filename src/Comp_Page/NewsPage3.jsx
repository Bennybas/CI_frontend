import React, { useState, useEffect } from 'react';
import { Plus, Share2, Check, BrainCog } from 'lucide-react';

const NewsPage3 = ({ passedCompetitors = [], switchPage, setIsLoading }) => {
    const [companiesData, setCompaniesData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newsletterItems, setNewsletterItems] = useState([]);
    const [activeTabsByCompany, setActiveTabsByCompany] = useState({});
    
    // Tabs configuration
    const tabs = [
        'Latest News',
        'Website Content', 
        'Additional Sources', 
        'Regulatory'
    ];

    // Load existing newsletter items on component mount
    useEffect(() => {
        const storedItems = JSON.parse(localStorage.getItem('newsletterItems') || '[]');
        setNewsletterItems(storedItems);
    }, []);

    // Fetch competitor data
    useEffect(() => {
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
                
                // Process the data to match our component's format
                const processedData = {};
                const initialTabs = {};
                
                data.forEach(item => {
                    if (passedCompetitors.includes(item.competitor)) {
                        // Initialize company with empty data structure for all tabs
                        processedData[item.competitor] = {
                            'Latest News': {},
                            'Website Content': {},
                            'Additional Sources': {},
                            'Regulatory': {}
                        };
                        
                        // Initialize default active tab
                        initialTabs[item.competitor] = 'Latest News';
                        
                        // Populate Latest News
                        if (item.latest_news) {
                            processedData[item.competitor]['Latest News'] = {
                                id: `latest-news-${item.competitor}`,
                                topic: item.latest_news.topic,
                                date: item.latest_news.date,
                                source: item.latest_news.source,
                                content: item.latest_news.content
                            };
                        }
                        
                        // Populate Website Content
                        if (item.website_content) {
                            processedData[item.competitor]['Website Content'] = {
                                id: `website-content-${item.competitor}`,
                                topic: item.website_content.topic,
                                date: item.website_content.date,
                                source: item.website_content.source,
                                content: item.website_content.content
                            };
                        }
                        
                        // Populate Additional Sources (first item)
                        if (item.additional_sources && item.additional_sources.length > 0) {
                            processedData[item.competitor]['Additional Sources'] = {
                                id: `additional-sources-${item.competitor}`,
                                topic: item.additional_sources[0].topic,
                                date: item.additional_sources[0].date,
                                source: item.additional_sources[0].source,
                                content: item.additional_sources[0].content
                            };
                        }
                        
                        // Populate Regulatory (first item)
                        if (item.regulatory && item.regulatory.length > 0) {
                            processedData[item.competitor]['Regulatory'] = {
                                id: `regulatory-${item.competitor}`,
                                topic: item.regulatory[0].topic,
                                date: item.regulatory[0].date,
                                source: item.regulatory[0].source,
                                content: item.regulatory[0].content
                            };
                        }
                    }
                });
                
                setCompaniesData(processedData);
                setActiveTabsByCompany(initialTabs);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching competitor data:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchCompetitorData();
    }, [passedCompetitors]);

    // Handle tab change for a specific company
    const handleTabChange = (company, tab) => {
        setActiveTabsByCompany(prev => ({
            ...prev,
            [company]: tab
        }));
    };

    // Handle adding item to newsletter
    const handleAddToNewsletter = (company, tab) => {
        const itemData = companiesData[company][tab];
        
        // Check if item is already in newsletter
        const isAlreadyAdded = newsletterItems.some(item => item.id === itemData.id);
        if (isAlreadyAdded) return;

        // Create a newsletter item
        const newsletterItem = {
            id: itemData.id,
            company,
            title: itemData.topic,
            date: itemData.date,
            source: itemData.source,
            content: itemData.content,
            category: tab
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

    // Get active tab for a specific company
    const getActiveTab = (company) => {
        return activeTabsByCompany[company] || 'Latest News';
    };

    // Render loading state
    useEffect(() => {
        setIsLoading && setIsLoading(true);
    
        const timer = setTimeout(() => {
          setIsLoading && setIsLoading(false); 
        }, 1000); 
    
        return () => clearTimeout(timer); 
    }, [setIsLoading]);
    
    // Render error state
    if (error) {
        return (
            <div className='px-2 py-4'>
                <div className='p-2 border rounded-2xl w-full min-h-screen bg-white'>
                    <p className="text-red-500">Error loading data: {error}</p>
                </div>
            </div>
        );
    }

    // Render when no competitors are selected
    if (!passedCompetitors || passedCompetitors.length === 0) {
        return (
            <div className='px-2 py-4'>
                <div className='p-2 border rounded-2xl w-full min-h-screen bg-white'>
                    <p className="text-gray-500">Please select a competitor to view news</p>
                </div>
            </div>
        );
    }

    return (
        <div className='px-2 py-4'>
           
                <div className='p-2 rounded-2xl w-full min-h-screen bg-[#f6f7f8]/50 border flex flex-wrap gap-4'>
                    {Object.keys(companiesData).map((company, index) => {
                        const activeTab = getActiveTab(company);
                        const activeTabData = companiesData[company][activeTab];
                        const isAlreadyAdded = newsletterItems.some(item => item.id === (activeTabData?.id || ''));

                        return (
                            <div key={company} className='flex flex-col justify-start w-[calc(50%-0.5rem)] gap-2 pb-4'>
                                <div className='flex justify-between px-2'>
                                    <span className='text-[15px] font-[500]'>
                                        {company}
                                    </span>

                                    <div 
                                        onClick={() => switchPage && switchPage("aivy")}
                                        className="flex items-center justify-between rounded-full border py-1 px-1 cursor-pointer"
                                    >
                                        <button className="relative group focus:outline-none">
                                            <img src="/png/aivy.png" alt="AIVY" className="h-5 w-auto ml-2" />
                                        </button>
                                    </div>
                                </div>

                                <div className='flex flex-col rounded-xl w-full h-[20rem] bg-[#EDEFF2] p-2 gap-2'>
                                    <div className='flex justify-between items-center bg-white rounded-2xl h-10 w-[75%] py-1 px-2'>
                                        {tabs.map((tab) => (
                                            <div 
                                                key={tab}
                                                onClick={() => handleTabChange(company, tab)}
                                                className={`flex text-[12px] items-center text-gray-700 py-1 px-2 cursor-pointer
                                                    ${activeTab === tab 
                                                        ? "rounded-2xl bg-black text-white" 
                                                        : ""
                                                    }`
                                                }
                                            >
                                                {tab}
                                            </div>
                                        ))}     
                                    </div>

                                    <div className='flex flex-col bg-[#f6f7f8] rounded-2xl h-full w-full p-2 gap-2'>
                                        {activeTabData && Object.keys(activeTabData).length > 0 ? (
                                            <div className='flex flex-col rounded-2xl bg-white p-2 gap-2'>
                                                <div className='flex justify-between w-full'>
                                                    <span className='text-[12px] font-[500]'>
                                                        {activeTabData.topic || "No topic available"}
                                                    </span>

                                                    {isAlreadyAdded ? (
                                                        <div className='flex items-center gap-1'>
                                                            <span className='text-[8px]'>Added to NewsLetter</span>
                                                            <Check className="text-green-600 w-4 h-4" />
                                                        </div>
                                                    ) : (
                                                        <div 
                                                            className='rounded-full bg-white p-1 border cursor-pointer'
                                                            onClick={() => handleAddToNewsletter(company, activeTab)}
                                                        >
                                                            <Plus className='text-gray-700 w-4 h-4'/>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className='flex justify-between w-full'>
                                                    <span className='text-[10px] text-gray-700'>
                                                        {activeTabData.content || "No content available"}
                                                    </span>
                                                </div>
                                                <div className='w-full bg-gray-300 h-[0.5px]'></div>
                                                
                                                <div className='flex justify-start items-center gap-2'>
                                                    <span className='text-[9px] text-gray-600'>
                                                        {activeTabData.date || "No date"}
                                                    </span>
                                                    <div className='rounded-full border px-2 py-1 items-center flex'>
                                                        <span className='text-[9px] text-gray-600'>
                                                            {activeTabData.source || "source"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className='flex items-center justify-center h-full'>
                                                <p className="text-gray-500">No {activeTab.toLowerCase()} data available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

        </div>
    );
};

export default NewsPage3;