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
            <Routes>
                <Route path="/" element={<TherapeuticArea />} />
                <Route path="/competitors_page" element={<CompSelect />} />

                <Route path="/header" element={<Header/>} />
                <Route path="/newsletter" element={<NewsLetter />} />
               
                
            </Routes>
        </Router>
    );
}

export default App;
