import React, { useState, useEffect } from 'react';
import { House, Newspaper, BrainCog } from 'lucide-react';
import { FcManager } from "react-icons/fc";
import Competitors from './Competitors';
import NewsLetter from './NewsLetter';
import { useLocation } from 'react-router-dom';
import AIVY from './AIVY';
import { useNavigate } from 'react-router-dom';
import NewsPage from './NewsPage';
import NewsCard from './NewsCard';
import NewsPage2 from './NewsPage2';
import NewsPage3 from './NewsPage3';
import NewsPage4 from './NewsPage4';

const Header = ({setIsLoading}) => {
  const navigate = useNavigate();

  const [getCount, setGetCount] = useState(0);

  const location = useLocation();
  const selectedCompetitors = location.state?.selectedCompetitors || [];

  console.log(`passes comp ${selectedCompetitors}`)

  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem("activePage") || "home";
  });

  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    localStorage.setItem("activePage", activePage);
  }, [activePage]);

  // Effect to load newsletter count from localStorage
  useEffect(() => {
    const loadNewsletterCount = () => {
      const newsletterItems = JSON.parse(localStorage.getItem('newsletterItems') || '[]');
      setGetCount(newsletterItems.length);
    };
    
    // Load initially
    loadNewsletterCount();
    
    // Set up event listener for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'newsletterItems') {
        loadNewsletterCount();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event listener for when NewsPage4 updates the count
    const handleNewsletterUpdate = () => {
      loadNewsletterCount();
    };
    
    window.addEventListener('newsletterUpdated', handleNewsletterUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('newsletterUpdated', handleNewsletterUpdate);
    };
  }, []);

  const switchPage = (page, data = null) => {
    setActivePage(page);
    setPageData(data); 
  };

  const cards = [
    {
      title: "Home",
      Icon: House,
      path: "home",
      count: false
    },
    {
      title: "NewsLetter",
      Icon: Newspaper,
      path: "newsletter",
      count: true
    },
    {
      title: "AIVY",
      Icon: BrainCog,
      path: "aivy",
      count: false
    },
  ]

  const renderContent = () => {
    switch (activePage) {
      case "home":
        // return <Competitors passedCompetitors={selectedCompetitors} switchPage={switchPage} />
        // return <NewsPage passedCompetitors={selectedCompetitors} switchPage={switchPage}/>
        // return <NewsPage2 passedCompetitors={selectedCompetitors} switchPage={switchPage} setIsLoading={setIsLoading}/>
        return <NewsPage4 
          passedCompetitors={selectedCompetitors} 
          switchPage={switchPage} 
          setIsLoading={setIsLoading} 
          SetgetCount={setGetCount}
        />
      case "newsletter":
        return <NewsLetter />
      case "aivy":
        return <AIVY />
      default:
        return null;
    }
  }
  
  return (
    <div>
      <div className="bg-gray-50 fixed top-0 left-0 w-full z-10">
        <header className="bg-white text-gray-600 flex items-center justify-between px-6 py-3 border-b border-gray-200 ">
          {/* Logo Section */}
          <img
            src="/chryselys.png"
            alt="Logo"
            className="h-12 w-auto cursor-pointer"
            onClick={() => navigate('/')}
          />

          <div className="flex justify-end w-full px-6">
            <div className="flex flex-row justify-end items-center w-84 gap-1 rounded-3xl bg-white px-1 py-1">
              {cards.map((card, index) => (
                <button
                  key={index}
                  onClick={() => setActivePage(card.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-3xl transition-all duration-200 ease-in-out border border-gray-300 
                    ${activePage === card.path
                      ? "bg-[#004567] text-[#f0f3f7] text-md"
                      : "text-[#697280] hover:bg-[#004567]/80 hover:text-[#f0f3f7]"
                    } relative`}
                >
                  <card.Icon className="text-sm w-4 h-4" />
                  <span className="text-sm" style={{ fontSize: '11px' }}>{card.title}</span>
                  
                  {/* Count indicator for NewsLetter */}
                  {card.count && getCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {getCount > 99 ? '99+' : getCount}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right Side Section with User Info */}
          <div className="flex items-center space-x-4">
            <div className='flex items-center'>
              <span className="text-md font-light">Hello,</span>
              <span className="text-md font-medium ml-1">User</span>
            </div>

            <button className="p-1 bg-gray-200 rounded-full">
              <FcManager className="text-3xl" />
            </button>
          </div>
        </header>
      </div>
   
      <main className='mt-[4.3rem]'>{renderContent()}</main>
    </div>
  );
}

export default Header;