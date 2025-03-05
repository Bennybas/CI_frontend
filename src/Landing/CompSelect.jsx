import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { AlignJustify,Check,CircleX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CompSelect = () => {
  const [availableCompetitors, setAvailableCompetitors] = useState([]);
  const [selectedCompetitors, setSelectedCompetitors] = useState([]);
  const [newCompetitor, setNewCompetitor] = useState('');
  const [urls, setUrls] = useState({});

const navigate = useNavigate(); 

  useEffect(() => {
    fetch("https://ci-backend-1.onrender.com/api/daily_newsletters")
      .then((response) => response.json())
      .then((data) => {
        const competitorList = data
          .map((item) => item.competitor)
          .filter((competitor) => competitor && competitor.trim() !== "")
          .filter((value, index, self) => self.indexOf(value) === index);
        setAvailableCompetitors(competitorList);
      })
      .catch((error) => {
        console.error("Error fetching competitors:", error);
        setAvailableCompetitors(["Bausch Health", "Novartis", "Vyluma"]);
      });
  }, []);

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceList = source.droppableId === 'available-list' ? [...availableCompetitors] : [...selectedCompetitors];
    const destList = destination.droppableId === 'available-list' ? [...availableCompetitors] : [...selectedCompetitors];

    const [movedItem] = sourceList.splice(source.index, 1);
    destList.splice(destination.index, 0, movedItem);

    if (source.droppableId === 'available-list') {
      setAvailableCompetitors(sourceList);
      setSelectedCompetitors(destList);
    } else {
      setSelectedCompetitors(sourceList);
      setAvailableCompetitors(destList);
    }
  };

  const handleUrlChange = (competitor, url) => {
    setUrls(prevUrls => ({
      ...prevUrls,
      [competitor]: url
    }));
  };

  const addNewCompetitor = () => {
    if (newCompetitor.trim() && !availableCompetitors.includes(newCompetitor) && !selectedCompetitors.includes(newCompetitor)) {
      setAvailableCompetitors([...availableCompetitors, newCompetitor]);
      setNewCompetitor('');
    }
  };

  const removeCompetitor = (competitor) => {
    setSelectedCompetitors(selectedCompetitors.filter(item => item !== competitor));
    if (!availableCompetitors.includes(competitor)) {
      setAvailableCompetitors([...availableCompetitors, competitor]);
    }
    const newUrls = { ...urls };
    delete newUrls[competitor];
    setUrls(newUrls);
  };

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  console.log(`selected Compss ${selectedCompetitors}`)

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen mt-[4rem]">
      <div className="mb-8">
        <h1 className="text-lg font-bold text-gray-900 mb-2">Competitor Tracking</h1>
        <p className="text-gray-600 text-sm">Drag and drop competitors between lists and add source URLs for personalized monitoring.</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Available Competitors */}
          <div className="flex-1">
            <h2 className="text-md font-semibold text-gray-700 mb-4">Available Competitors ({availableCompetitors.length})</h2>
            <Droppable droppableId="available-list">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`rounded-lg border-2 border-dashed ${
                    snapshot.isDraggingOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                  } p-4 min-h-[300px] transition-colors duration-200`}
                >
                  {availableCompetitors.map((competitor, index) => (
                    <Draggable key={competitor} draggableId={competitor} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-3 mb-2 rounded-md border border-gray-200 shadow-xs hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-grab active:cursor-grabbing"
                        >
                          <div className="flex items-center gap-2">
                            <AlignJustify className="text-gray-600 w-4 h-4" />
                            <span className="text-gray-900" style={{fontSize:'12px', fontWeight:500}}>{competitor}</span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* Selected Competitors */}
          <div className="flex-1">
            <h2 className="text-md font-semibold text-gray-700 mb-4">Selected Competitors ({selectedCompetitors.length})</h2>
            <Droppable droppableId="selected-list">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`rounded-lg border-2 border-dashed ${
                    snapshot.isDraggingOver ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                  } p-4 min-h-[300px] transition-colors duration-200`}
                >
                  {selectedCompetitors.map((competitor, index) => (
                    <Draggable key={competitor} draggableId={competitor} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-4 mb-3 rounded-md border border-gray-200 shadow-xs hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                                <AlignJustify className="text-gray-600 w-4 h-4" />
                              <span className="text-gray-900" style={{fontSize:'12px', fontWeight:500}}>{competitor}</span>
                            </div>
                            <button
                              onClick={() => removeCompetitor(competitor)}
                              className="text-gray-400 hover:text-red-600 transition-colors duration-200 p-1 -mt-1 -mr-1"
                            >
                              <CircleX className='w-4 h-4'/>
                            </button>
                          </div>
                          <div className="pl-7">
                            <label className="block text-sm font-sm text-gray-700 mb-1" style={{fontSize:'10px'}}>
                              Source URL
                              <span className="text-gray-400 font-normal ml-1">(optional)</span>
                            </label>
                            <input
                              type="text"
                              value={urls[competitor] || ''}
                              onChange={(e) => handleUrlChange(competitor, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"style={{fontSize:'12px', fontWeight:500}}
                              placeholder="https://example.com/news"
                            />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>

      <div className="mt-8 flex justify-end">
        <button
         onClick={() => navigate('/header', { state: { selectedCompetitors } })}

          className="bg-blue-600 text-white px-6 py-3 rounded-md font-sm hover:bg-blue-700 transition-colors duration-200 flex items-center"
        >
          <Check className='w-6 h-6 px-1'/>
          Save Configuration
        </button>
      </div>
    </div>
  );
};

export default CompSelect;
