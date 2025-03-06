import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TherapeuticArea from './Landing/TherapeuticArea';
import Competitors from './Comp_Page/Competitors';
import Header from './Comp_Page/Header';
import CompSelect from './Landing/CompSelect';
import NewsLetter from './Comp_Page/NewsLetter';
import LoadingSpinner from './LoadingSpinner';
import {useState} from  "react";

function App() {
    const [isLoading, setIsLoading] = useState(false); 
    return (
        <Router>
             {isLoading && <LoadingSpinner />} 
            <Routes>
                <Route path="/" element={<TherapeuticArea setIsLoading={setIsLoading}  />} />
                <Route path="/competitors_page" element={<CompSelect setIsLoading={setIsLoading} />} />
                <Route path="/header" element={<Header setIsLoading={setIsLoading} />} />
                <Route path="/newsletter" element={<NewsLetter setIsLoading={setIsLoading} />} />
            </Routes>
        </Router>
    );
}

export default App;
