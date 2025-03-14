import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

const NewsPage4 = ({ passedCompetitors = [], switchPage, setIsLoading, SetgetCount }) => {
    const [companiesData, setCompaniesData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newsletterItems, setNewsletterItems] = useState([]);
    const [activeTabsByCompany, setActiveTabsByCompany] = useState({});
    const [selectedItems, setSelectedItems] = useState({});
    const [showConfirmation, setShowConfirmation] = useState(false);
    
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
        
        // Update count in Header component
        if (SetgetCount) {
            SetgetCount(storedItems.length);
        }
    }, [SetgetCount]);

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

    // Handle adding item to selected items
    const handleSelectItem = (company, tab) => {
        const itemData = companiesData[company][tab];
        const itemId = itemData.id;
        
        setSelectedItems(prev => {
            // If already selected, remove it
            if (prev[itemId]) {
                const newSelected = {...prev};
                delete newSelected[itemId];
                return newSelected;
            }
            
            // Otherwise add it
            return {
                ...prev,
                [itemId]: {
                    id: itemId,
                    company,
                    title: itemData.topic,
                    date: itemData.date,
                    source: itemData.source,
                    content: itemData.content,
                    category: tab
                }
            };
        });
    };

    // Handle saving selected items to newsletter
    const handleSaveToNewsletter = () => {
        // Convert selected items object to array
        const newItems = Object.values(selectedItems);
        
        // Check if there are any new items to add
        if (newItems.length === 0) {
            setShowConfirmation(false);
            return;
        }
        
        // Filter out items that are already in the newsletter
        const uniqueNewItems = newItems.filter(item => 
            !newsletterItems.some(existing => existing.id === item.id)
        );
        
        // Add new items to newsletter
        const updatedItems = [...newsletterItems, ...uniqueNewItems];
        setNewsletterItems(updatedItems);
        
        // Save to local storage
        localStorage.setItem('newsletterItems', JSON.stringify(updatedItems));
        
        // Print total count to console
        console.log(`Total newsletter items: ${updatedItems.length}`);
        
        // Update count in Header component
        if (SetgetCount) {
            SetgetCount(updatedItems.length);
        }
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('newsletterUpdated'));
        
        // Optionally, send to backend
        uniqueNewItems.forEach(item => {
            fetch('https://ci-backend-1.onrender.com/api/add_newsletter_item', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(item)
            }).catch(error => {
                console.error('Error saving newsletter item:', error);
            });
        });
        
        // Clear selected items and hide confirmation dialog
        setSelectedItems({});
        setShowConfirmation(false);
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
            <div className='p-4'>
                <p className="text-red-500">Error loading data: {error}</p>
            </div>
        );
    }

    // Render when no competitors are selected
    if (!passedCompetitors || passedCompetitors.length === 0) {
        return (
            <div className='p-4'>
                <p className="text-gray-500">Please select a competitor to view news</p>
            </div>
        );
    }

    // Create rows of companies (2 per row)
    const companyPairs = [];
    const companies = Object.keys(companiesData);
    
    for (let i = 0; i < companies.length; i += 2) {
        companyPairs.push(companies.slice(i, i + 2));
    }

    // Count of selected items
    const selectedCount = Object.keys(selectedItems).length;

    return (
        <div className='p-4 relative'>
            {companyPairs.map((pair, rowIndex) => (
                <div key={`row-${rowIndex}`} className='flex gap-4 mb-4'>
                    {pair.map((company) => {
                        const activeTab = getActiveTab(company);
                        const activeTabData = companiesData[company][activeTab];
                        const isAlreadyAdded = newsletterItems.some(item => item.id === (activeTabData?.id || ''));
                        const isSelected = activeTabData?.id ? selectedItems[activeTabData.id] : false;

                        return (
                            <div key={company} className='flex w-[50%] h-[18rem] bg-white rounded-2xl border'>
                                <div className='w-[22%] bg-[#8281db] flex flex-col rounded-l-xl gap-4 py-2 pl-4 justify-between'>
                                    <div className='flex flex-col gap-4'>
                                        <span className='text-[15px] font-[500] text-white pl-2'>
                                            {company}
                                        </span>

                                        <div className='flex flex-col gap-1'>
                                            {tabs.map((tab, index) => (
                                                <div 
                                                    key={index}
                                                    onClick={() => handleTabChange(company, tab)}
                                                    className={`flex text-[12px] items-center py-1 px-2 cursor-pointer
                                                        ${activeTab === tab 
                                                            ? "rounded-l-2xl text-gray-600 bg-[#f6f7f8] " 
                                                            : "text-white"
                                                        }
                                                    `}
                                                >
                                                    {tab}
                                                </div>
                                            ))}
                                        </div>
                                    </div>


                                </div>

                                <div className='flex flex-col w-[78%] bg-gray-50 rounded-r-2xl overflow-y-auto'>
                                    {activeTabData && Object.keys(activeTabData).length > 0 ? (
                                        <div className='flex flex-col bg-[#f6f7f8] rounded-2xl h-full w-full p-2 gap-2 shadow-sm'>
                                            <div className='flex flex-col rounded-2xl bg-white p-2 gap-2 border'>
                                                <div className='flex justify-between w-full'>
                                                    <span className='text-[12px] font-[500]'>
                                                        {activeTabData.topic || "No topic available"}
                                                    </span>

                                                    {isAlreadyAdded ? (
                                                        <div className='flex items-center gap-1'>
                                                            <span className='text-[8px]'>Added</span>
                                                            <Check className="text-green-600 w-4 h-4" />
                                                        </div>
                                                    ) : (
                                                        <div 
                                                            className='cursor-pointer'
                                                            onClick={() => !isAlreadyAdded && handleSelectItem(company, activeTab)}
                                                        >
                                                            <div className={`w-5 h-5 border rounded flex items-center justify-center ${isSelected ? 'bg-[#8281db] border-[#8281db]' : 'bg-white border-gray-300'}`}>
                                                                {isSelected && <Check className="text-white w-4 h-4" />}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className='flex justify-between w-full'>
                                                    <span className='text-[10px] text-gray-700'>
                                                        {activeTabData.content || "No content available"}
                                                    </span>
                                                </div>

                                                <div className='w-full bg-gray-300 h-[0.5px]'></div>
                                                
                                                <div className='flex justify-start items-center gap-2 mt-auto'>
                                                    <span className='text-[9px] text-gray-600'>
                                                        {activeTabData.date || "No date"}
                                                    </span>
                                                    {activeTabData.source && (
                                                        <div className='rounded-full border px-2 py-1 items-center flex'>
                                                            <span className='text-[9px] text-gray-600'>
                                                                {activeTabData.source}
                                                            </span>
                                                        </div>
                                                    )}
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
                        );
                    })}
                    {/* Add placeholders if there's only one company in the row */}
                    {pair.length === 1 && (
                        <div className='w-[50%]'></div>
                    )}
                </div>
            ))}

            {/* Add to Newsletter button - only visible if there are selected items */}
            {selectedCount > 0 && (
                <div className='fixed bottom-6 right-6'>
                    <button 
                        onClick={() => setShowConfirmation(true)}
                        className='bg-[#8281db] text-white px-4 py-2 rounded-lg shadow-md hover:bg-[#6f6ec7] transition-colors'
                    >
                        Add to Newsletter ({selectedCount})
                    </button>
                </div>
            )}

            {/* Confirmation Dialog */}
            {showConfirmation && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                    <div className='bg-white rounded-lg p-6 max-w-md w-full'>
                        <h3 className='text-lg font-medium mb-4'>Add to Newsletter</h3>
                        <p className='mb-6'>Do you want to add {selectedCount} item{selectedCount !== 1 ? 's' : ''} to the newsletter?</p>
                        <div className='flex justify-end gap-4'>
                            <button 
                                onClick={() => setShowConfirmation(false)}
                                className='px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50'
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveToNewsletter}
                                className='px-4 py-2 bg-[#8281db] text-white rounded-md hover:bg-[#6f6ec7]'
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsPage4;