import React, { useState, useEffect } from 'react';
import { Share2, MessageSquareMore, Plus, Check } from 'lucide-react';

const NewsCard = ({ selectedCompetitors = [], switchPage }) => {
  const [activeTabsByCompany, setActiveTabsByCompany] = useState({});
  const [companyData, setCompanyData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newsletterItems, setNewsletterItems] = useState([]);
  
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

  // Fetch data from MongoDB
  useEffect(() => {
    if (selectedCompetitors.length > 0) {
      setLoading(true);
      fetch('https://ci-backend-1.onrender.com/api/daily_newsletters')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          // Process the data to match our component's format
          const processedData = {};
          
          data.forEach(item => {
            if (selectedCompetitors.includes(item.competitor)) {
              // Initialize company with empty data structure for all tabs
              processedData[item.competitor] = {
                'Latest News': {},
                'Website Content': {},
                'Additional Sources': {},
                'Regulatory': {}
              };
              
              // Only add data if it exists for each category
              if (item.latest_news) {
                processedData[item.competitor]['Latest News'] = {
                  id: `latest-news-${item.competitor}`,
                  title: item.latest_news.topic,
                  date: item.latest_news.date,
                  source: item.latest_news.source,
                  content: item.latest_news.content
                };
              }
              
              if (item.website_content) {
                processedData[item.competitor]['Website Content'] = {
                  id: `website-content-${item.competitor}`,
                  title: item.website_content.topic,
                  date: item.website_content.date,
                  source: item.website_content.source,
                  content: item.website_content.content
                };
              }
              
              // Process additional sources (take the first one if it exists)
              if (item.additional_sources && item.additional_sources.length > 0) {
                processedData[item.competitor]['Additional Sources'] = {
                  id: `additional-sources-${item.competitor}`,
                  title: item.additional_sources[0].topic,
                  date: item.additional_sources[0].date,
                  source: item.additional_sources[0].source,
                  content: item.additional_sources[0].content
                };
              }
              
              // Process regulatory (take the first one if it exists)
              if (item.regulatory && item.regulatory.length > 0) {
                processedData[item.competitor]['Regulatory'] = {
                  id: `regulatory-${item.competitor}`,
                  title: item.regulatory[0].topic,
                  date: item.regulatory[0].date,
                  source: item.regulatory[0].source,
                  content: item.regulatory[0].content
                };
              }
            }
          });
          
          setCompanyData(processedData);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          setError(error.message);
          setLoading(false);
        });
    }
  }, [selectedCompetitors]);

  const getActiveTab = (company) => {
    return activeTabsByCompany[company] || 'Latest News'; 
  };

  const handleTabChange = (company, tab) => {
    setActiveTabsByCompany(prev => ({
      ...prev,
      [company]: tab
    }));
  };

  const handleAddToNewsletter = (company, tab) => {
    const itemData = companyData[company][tab];
    
    // Check if item is already in newsletter
    const isAlreadyAdded = newsletterItems.some(item => item.id === itemData.id);
    if (isAlreadyAdded) return;

    // Create a newsletter item
    const newsletterItem = {
      id: itemData.id,
      company,
      title: itemData.title,
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

  if (!selectedCompetitors || selectedCompetitors.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Select a competitor to view information</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading competitor data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error loading data: {error}</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-auto relative">
      {selectedCompetitors.map((company) => (
        companyData[company] ? (
          <div key={company} className="mb-8 border border-gray-200 rounded-lg">
            {/* Header */}
            <div className="bg-[#ebf5ff] p-2 flex justify-between items-center mb-2 rounded">
              <h1 className="text-lg font-bold text-amber-900">{company}</h1>
              <div className="flex space-x-2">
              <button 
                  onClick={() => switchPage("aivy")}
                  className="focus:outline-none"
                >
                <MessageSquareMore className="text-amber-600 w-6 h-6"/>
                </button>
                <button 
                  onClick={() => switchPage("newsletter")}
                  className="focus:outline-none"
                >
                  <Share2 className="text-amber-600 w-6 h-6"/>
                </button>
              </div>
            </div>
            
            {/* Tabs - Independent for each company */}
            <div className="flex border-b overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={`${company}-${tab}`}
                  className={`px-4 py-2 text-sm font-medium ${
                    getActiveTab(company) === tab
                      ? 'text-amber-600 border-b-2 border-amber-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => handleTabChange(company, tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            {/* Content Area - Fixed Height for each company */}
            <div className="h-48 overflow-auto">
              {companyData[company] && 
               companyData[company][getActiveTab(company)] && 
               Object.keys(companyData[company][getActiveTab(company)]).length > 0 && 
               companyData[company][getActiveTab(company)].title ? (
                <div className="p-2">
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-bold text-gray-900">
                      {companyData[company][getActiveTab(company)].title}
                    </h2>
                    {newsletterItems.some(
                      item => item.id === companyData[company][getActiveTab(company)].id
                    ) ? (
                      <Check className="text-green-600 w-5 h-5"/>
                    ) : (
                      <button 
                        onClick={() => handleAddToNewsletter(company, getActiveTab(company))}
                        className="focus:outline-none"
                      >
                        <Plus className="text-gray-600 w-5 h-5 hover:text-amber-600"/>
                      </button>
                    )}
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-600">
                    <span>{companyData[company][getActiveTab(company)].date}</span>
                    <span className="mx-1">•</span>
                    <span>{companyData[company][getActiveTab(company)].source}</span>
                  </div>
                  
                  <p className="mt-3 text-sm text-gray-700">
                    {companyData[company][getActiveTab(company)].content}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No {getActiveTab(company).toLowerCase()} data available</p>
                </div>
              )}
            </div>
          </div>
        ) : null
      ))}
    </div>
  );
};

export default NewsCard;