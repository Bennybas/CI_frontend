import React, { useState, useEffect } from "react";
import { Newspaper, Plus, Check,BrainCog } from "lucide-react";

const NewsPage = ({ passedCompetitors = [], switchPage }) => {
  const [companiesData, setCompaniesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newsletterItems, setNewsletterItems] = useState([]);

  // Load existing newsletter items on component mount
  useEffect(() => {
    const storedItems = JSON.parse(localStorage.getItem('newsletterItems') || '[]');
    setNewsletterItems(storedItems);
  }, []);

  useEffect(() => {
    // If no competitors are passed, set loading to false
    if (passedCompetitors.length === 0) {
      setLoading(false);
      return;
    }

    // Fetch data when component mounts or competitors change
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

    // Switch to newsletter page
    // switchPage("newsletter");
  };

  // Card configurations for different sections
  const createCardConfigs = (companyData) => [
    {
      title: "Latest News",
      color: "[#c98b27]",
      dataKey: 'latest_news'
    },
    {
      title: "Website Content",
      color: "[#c98b27]",
      dataKey: 'website_content'
    },
    {
      title: "Additional Sources",
      color: "[#c98b27]",
      dataKey: 'additional_sources',
      index: 0
    },
    {
      title: "Regulatory",
      color: "[#c98b27]",
      dataKey: 'regulatory',
      index: 0
    }
  ];

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

  return (
    <div className='bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 mt-[4rem]'>
      {companiesData.map((companyData, companyIndex) => (
        <div key={companyData.competitor} className='flex flex-col w-full mb-8'>
          <div className="p-1 mb-4">
            <div className="flex items-center">
              <Newspaper className="w-6 h-6 mr-3 text-amber-600" />
              <span className="text-lg font-bold text-gray-800">
                {companyData.competitor} <span className="text-amber-600">News</span>
              </span>
            </div>
          </div>
          
          <div className="flex w-full gap-4">
            {createCardConfigs(companyData).map((card, index) => {
              // Determine the data for this card
              let cardData;
              if (card.index !== undefined) {
                // For additional sources and regulatory which are arrays
                cardData = companyData?.[card.dataKey]?.[card.index];
              } else {
                // For latest news and website content which are objects
                cardData = companyData?.[card.dataKey];
              }

              // Unique identifier for this newsletter item
              const itemId = `${companyData.competitor}-${card.dataKey}`;
              const isAlreadyAdded = newsletterItems.some(item => item.id === itemId);

              return (
                <div 
                  key={index} 
                  className="flex flex-col bg-white border-white rounded-xl w-[25%] h-[22rem] shadow-lg hover:shadow-xl transition-all duration-400"
                >
                  <div className={`h-10 bg-${card.color} w-full rounded-t-xl flex items-center px-3`}>
                    <span className="text-[#FFFFFF] text-sm font-semibold tracking-wider flex-grow">
                      {card.title}
                    </span>
                    <button 
                        onClick={() => switchPage("aivy")}
                        className="focus:outline-none">
                    <BrainCog className="w-5 h-5 text-white" />
                    </button>

                  </div>
                  
                  <div className="p-3 overflow-auto">
                    {cardData ? (
                      <div className="border rounded-sm">
                        <div className="flex justify-between items-center p-2 bg-gray-50">
                          <div className="flex flex-col flex-grow">
                            <div className="flex justify-between items-center w-full">
                              <span 
                                className="font-semibold text-[#004567]" 
                                style={{ fontSize: '11px' }}
                              >
                                {cardData.topic}
                              </span>
                              {isAlreadyAdded ? (
                                <Check className="text-green-600 w-4 h-4" />
                              ) : (
                                <button 
                                  onClick={() => handleAddToNewsletter(companyData, card)}
                                  className="focus:outline-none rounded-full"
                                >
                                  <Plus className="text-amber-600 hover:text-amber-700 w-4 h-4 transition-colors" style={{fontSize:'12px'}} />
                                </button>
                              )}
                            </div>

                            <div className="flex justify-between items-center mt-1">
                              <span 
                                className="text-xs text-gray-500" 
                                style={{ fontSize: '10px' }}
                              >
                                ({cardData.date})
                              </span>
                              <div 
                                className="rounded-md border bg-gray-200 text-gray-700 px-2 py-1 text-xs cursor-pointer hover:bg-gray-300 transition-colors"
                                style={{ fontSize: '10px' }}
                              >
                                {cardData.source}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-2">
                          <p 
                            className="text-xs text-gray-700 leading-relaxed" 
                            style={{fontSize:'10px'}}
                          >
                            {cardData.content || "No content available"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 text-sm">No data available</p>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default NewsPage;