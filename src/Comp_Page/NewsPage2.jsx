import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, Share2, Check, BrainCog } from 'lucide-react';

const NewsPage2 = ({ passedCompetitors = [], switchPage,setIsLoading }) => {
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
        setIsLoading(true);
    
        const timer = setTimeout(() => {
          setIsLoading(false); 
        }, 1000); 
    
        return () => clearTimeout(timer); 
      }, [setIsLoading]);
    
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

    return (
        <div className='bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 mt-[3.8rem]'>
            <div className='flex flex-wrap py-2 gap-4 mt-[0.5rem] '>
                {Object.keys(companiesData).map((company) => {
                    const activeTab = getActiveTab(company);
                    const activeTabData = companiesData[company][activeTab];
                    const isAlreadyAdded = newsletterItems.some(item => item.id === activeTabData.id);

                    return (
                        <div 
                            key={company} 
                            className='w-[calc(50%-1rem)] rounded-lg border-b-[1.5px] border-x border-l-[1.5px] border-gray-200 h-[20rem]  bg-white'
                        >
                            <div className='h-10 bg-gradient-to-r from-[#0f6691] to-[#0b4c6b] w-full rounded-t-lg flex items-center px-3 justify-between'>
                                <div>
                                <span className="text-[#FFFFFF] text-sm font-semibold tracking-wider flex-grow">    
                                    {company}
                                </span>
                                </div>
                                
                                {/* <div className='flex justify-center items-center gap-2 pt-2'> 
                                {tabs.map((tab) => (
                                        <div 
                                            key={tab}
                                            onClick={() => handleTabChange(company, tab)}
                                            className={`flex px-2 py-2 rounded-t-md border-x border-t gap-1 items-center cursor-pointer text-[10px] font-medium
                                                ${activeTab === tab 
                                                    ? "bg-[#d7e4f5]/80 text-gray-700 text-[11px]" 
                                                    : "text-gray-800 bg-white hover:bg-[#d7e4f5]/80"
                                                }`
                                            }
                                        >
                                            {tab}
                                        </div>
                                    ))}
                                </div> */}
                                <div 
                                 onClick={() => switchPage("aivy")}
                                className="flex items-center justify-between rounded-md border py-1 px-1 cursor-pointer">
                                    <span className='text-[8px] text-white pl-1'>ASK AIVY</span>
                                    <button 
                                       
                                        className="relative group focus:outline-none"
                                    >
                                        <img src="/png/aivy.png" alt="AIVY" className="h-4 w-auto ml-2" />
                                    </button>
                                </div>

                            </div>

                           
                   
                            <div className='flex flex-col rounded-xl bg-white'>
                            <div className='flex w-full bg-[#f2f2f0] h-10 justify-start gap-2 pt-1 px-2'>
                                    {tabs.map((tab) => (
                                        <div 
                                            key={tab}
                                            onClick={() => handleTabChange(company, tab)}
                                            className={`flex px-2 py-1 rounded-t-md border-x border-t gap-1 items-center cursor-pointer text-[10px] font-medium
                                                ${activeTab === tab 
                                                    ? "bg-[#d7e4f5]/80 text-gray-700 text-[11px]" 
                                                    : "text-gray-800 bg-white hover:bg-[#d7e4f5]/80"
                                                }`
                                            }
                                        >
                                            {tab}
                                        </div>
                                    ))}
                                </div>

                                <div className='flex flex-col gap-1 p-2 '>
                                    {activeTabData && Object.keys(activeTabData).length > 0 ? (
                                        <div className='flex flex-col bg-[#f0efed] rounded-md w-full p-1 gap-1 h-[10rem] border border-[#f0efed]'>
                                            <div className='flex w-full justify-between p-1'>
                                                <span className='font-semibold text-[#004567] text-[12px]'>
                                                    {activeTabData.topic || "No topic available"}
                                                </span>
                                                {isAlreadyAdded ? (
                                                    <div className='flex items-center gap-1'>

                                                    <span className='text-[8px]'>Added to NewsLetter</span>
                                                    <Check className="text-green-600 w-4 h-4" />
                                                    </div>
                                                ) : (
                                                    <div 
                                                        className='rounded-full border border-gray-700 cursor-pointer'
                                                        onClick={() => handleAddToNewsletter(company, activeTab)}
                                                    >
                                                        <Plus className='w-4 h-4'/>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className='flex w-full justify-between'>
                                                <div className='flex rounded rounded-xl border px-1 items-center border-gray-400 cursor-pointer hover:bg-[#b0b0b0]'>
                                                    <span className='font-md text-gray-700 text-[10px]'>
                                                        {activeTabData.source || "No source"}
                                                    </span>
                                                </div>

                                                <span className='font-md text-gray-700 text-[10px]'>
                                                    {activeTabData.date || "No date"}
                                                </span>
                                            </div>

                                            <div className='flex flex-col gap-1 bg-white w-full p-2 h-[10rem] overflow-y-auto'>
                                                <span className='text-[10px] font-[500] text-gray-700 leading-relaxed'>
                                                    {activeTabData.content || "No content available"}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className='flex items-center justify-center'>
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

export default NewsPage2;