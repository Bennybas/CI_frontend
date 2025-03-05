import React, { useState, useEffect } from 'react';
import { House,Newspaper,BrainCog } from 'lucide-react';
import { FcManager } from "react-icons/fc";
import Competitors from './Competitors';
import NewsLetter from './NewsLetter';
import { useLocation } from 'react-router-dom';
import AIVY from './AIVY';
import { useNavigate } from 'react-router-dom';
import NewsPage from './NewsPage';
import NewsCard from './NewsCard';
import NewsPage2 from './NewsPage2';



const Header = () => {

  const navigate = useNavigate();

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

  const switchPage = (page, data = null) => {
    setActivePage(page);
    setPageData(data); 
  };

  const cards = [
    {
      title: "Home",
      Icon: House,
      path: "home",
    },
    {
      title: "NewsLetter",
      Icon: Newspaper,
      path: "newsletter",
    },
    {
      title: "AIVY",
      Icon: BrainCog,
      path: "aivy",
    },
  ]

  const renderContent = () => {
    switch (activePage) {
      case "home":
        // return <Competitors passedCompetitors={selectedCompetitors} switchPage={switchPage} />
        // return <NewsPage passedCompetitors={selectedCompetitors} switchPage={switchPage}/>
        return <NewsPage2 passedCompetitors={selectedCompetitors} switchPage={switchPage}/>

      case "newsletter":
        return <NewsLetter />
        case "aivy":
        return <AIVY />
    }
  }
  return (
    <div>
    
    <div className="bg-gray-50 fixed top-0 left-0 w-full z-10">
      <header className="bg-white text-gray-600 flex items-center justify-between px-6 py-3 border-b border-gray-200 shadow-sm">
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
                    }`}
                >
                  <card.Icon className="text-sm w-4 h-4" />
                  <span className="text-sm" style={{ fontSize: '11px' }}>{card.title}</span>
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

   
     
      <main >{renderContent()}</main>
    </div>
  );
}

export default Header;
