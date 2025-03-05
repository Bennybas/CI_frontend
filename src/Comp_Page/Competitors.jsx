import React, { useEffect, useState } from "react";
import { Info } from "lucide-react";
import NewsCard from "./NewsCard";
import { useNavigate } from "react-router-dom";

const Competitors = ({passedCompetitors,switchPage}) => {
  const [competitors, setCompetitors] = useState([]);
  const [selectedCompetitors, setSelectedCompetitors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("https://ci-backend-1.onrender.com/api/daily_newsletters")
      .then((response) => response.json())
      .then((data) => {
        const competitorList = data
          .map((item) => item.competitor)
          .filter(
            (competitor) =>
              competitor &&
              competitor.trim() !== "" &&
              passedCompetitors.includes(competitor)
          );

        setCompetitors(competitorList);
        setSelectedCompetitors(competitorList); // Select all competitors by default
      })
      .catch((error) => console.error("Error fetching competitors:", error));
  }, [passedCompetitors]);

  const handleCompetitorClick = (competitor) => {
    setSelectedCompetitors((prev) =>
      prev.includes(competitor)
        ? prev.filter((comp) => comp !== competitor)
        : [...prev, competitor]
    );
  };

  return (
    <div className="p-4 mt-[4rem] ">
      <div className="flex justify-end px-4 py-1 mr-[2rem]">
          <button 
          onClick={()=>navigate('/compselect')}
          className="px-4 py-2 bg-[#004567]/90 text-white rounded-lg hover:bg-[#004567]">
            Setting
          </button>
      </div>

      <div className="flex w-full h-screen gap-4 overflow-y-hidden">
      
        {/* Competitors Section */}
        <div className="w-[20%] bg-[#ebf5ff] border border-gray-200 rounded-lg p-2">
          <div className="flex justify-between w-full">
            <span className="text-gray-700 text-md">Competitors</span>
            <Info className="w-3 h-3" />
          </div>
          <div className="py-2" />
          {competitors.length > 0 ? (
            competitors.map((competitor, index) => (
              <div key={index} className="p-1">
                <div
                  onClick={() => handleCompetitorClick(competitor)}
                  className={`flex items-center border border-gray-400 rounded-lg w-full h-8 cursor-pointer transition overflow-y-auto py-1 ${
                    selectedCompetitors.includes(competitor)
                      ? "bg-[#004567]/90 text-white hover:bg-[#004567]"
                      : "text-gray-600 hover:text-white hover:bg-[#004567]/90 transition overflow-y-auto py-1"
                  }`}
                >
                  <span className="text-[13px] font-medium pl-4">
                    {competitor}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm pl-4">
              No competitors available
            </p>
          )}
        </div>

        <div className="w-[75%] h-full bg-white p-2 overflow-y-auto">
          <NewsCard selectedCompetitors={selectedCompetitors} switchPage={switchPage} />
        </div>
      </div>
    </div>
  );
};

export default Competitors;
