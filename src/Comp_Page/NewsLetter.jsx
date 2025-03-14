import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Eye, Save, X, Mail } from 'lucide-react';
import jsPDF from 'jspdf';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://ci-backend-1.onrender.com';

const NewsLetter = ({setIsLoading}) => {
  const [newsletterItems, setNewsletterItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState(null);
  const [sendingStatus, setSendingStatus] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    // Load newsletter items from local storage
    const storedItems = JSON.parse(localStorage.getItem('newsletterItems') || '[]');
    setNewsletterItems(storedItems);
  }, []);

  const generatePDF = async () => {
    const doc = new jsPDF();
    
    try {
      // Load the background image
      const imgPath = '/png/pdfheader.png';
      const response = await fetch(imgPath);
      const blob = await response.blob();
      const imgData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });

      // Add image only to the first page
      doc.addImage(imgData, 'PNG', 10, 10, 190, 50);

      // Set initial y-position after the image
      let yPosition = 70;
      
      // Title after image
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text('Newsletter Items', 14, yPosition);
      yPosition += 15;
      
      // Maximum y-position before we need a new page (with some margin)
      const maxYPosition = 280;
      
      for (let i = 0; i < newsletterItems.length; i++) {
        const item = newsletterItems[i];
        
        // Calculate height needed for this item
        let itemHeight = 0;
        
        // Title height
        itemHeight += 10; // Title + spacing
        
        // Metadata height
        itemHeight += 6 + 8; // Two rows of metadata + spacing
        
        // Content height
        const splitContent = doc.splitTextToSize(item.content, 180);
        itemHeight += splitContent.length * 7 + 10; // Content + spacing
        
        // Check if we need a new page
        if (yPosition + itemHeight > maxYPosition) {
          doc.addPage();
          yPosition = 20; // Reset position at top of new page (no header image)
        }
        
        // Title
        doc.setFontSize(14);
        doc.setTextColor(139, 69, 19);
        doc.text(item.title, 14, yPosition);
        yPosition += 10;
        
        // Metadata
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Company: ${item.company} | Date: ${item.date}`, 14, yPosition);
        yPosition += 6;
        doc.text(`Source: ${item.source} | Category: ${item.category}`, 14, yPosition);
        yPosition += 8;
        
        // Content
        doc.setFontSize(12);
        doc.text(splitContent, 14, yPosition);
        yPosition += splitContent.length * 7 + 15; // Extra spacing between items
      }
      
      const pdfDataUri = doc.output('datauristring');
      setGeneratedPdfUrl(pdfDataUri);
      handleOpenShareModal();

    } catch (error) {
      console.error('Error generating PDF:', error);
      setSendingStatus('Failed to generate PDF. Please try again.');
    }
  };

  const handleOpenShareModal = () => {
    setSendingStatus('');
    setIsShareModalOpen(true);
    setShowEmailForm(false);
  };

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
    setEmailAddress('');
    setEmailMessage('');
    setGeneratedPdfUrl(null);
    setSendingStatus('');
    setShowEmailForm(false);
  };

  const handleShowEmailForm = () => {
    setShowEmailForm(true);
  };

  const handleSendEmail = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      setSendingStatus('Please enter a valid email address');
      return;
    }
    
    if (setIsLoading) setIsLoading(true);
    setSendingStatus('Sending...');

    try {
      const response = await axios.post(`${API_URL}/api/send_newsletter_email`, {
        email: emailAddress,
        subject: 'Newsletter Items',
        message: emailMessage,
        pdfDataUri: generatedPdfUrl
      });

      if (response.data.success) {
        setSendingStatus('Email sent successfully!');
        setTimeout(() => {
          handleCloseShareModal();
        }, 2000);
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setSendingStatus('Failed to send email. Please try again.');
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  };

  const handleRemoveItem = (id) => {
    const updatedItems = newsletterItems.filter(item => item.id !== id);
    setNewsletterItems(updatedItems);
    localStorage.setItem('newsletterItems', JSON.stringify(updatedItems));
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setEditedContent(item.content);
  };

  const handleSaveEdit = () => {
    if (editingItem) {
      const updatedItems = newsletterItems.map(item => 
        item.id === editingItem.id 
          ? { ...item, content: editedContent } 
          : item
      );
      
      setNewsletterItems(updatedItems);
      localStorage.setItem('newsletterItems', JSON.stringify(updatedItems));
      setEditingItem(null);
    }
  };

  return (
    <div className="container mx-auto p-4 mt-[4rem]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-amber-900">Newsletter</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Total Items: {newsletterItems.length}
          </div>
          {newsletterItems.length > 0 && (
            <button 
              onClick={generatePDF}
              className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-lg flex items-center text-sm"
            >
             <Eye className="w-4 h-4 mr-2"/> Preview
            </button>
          )}
        </div>
      </div>
      
      {newsletterItems.length === 0 ? (
        <div className="text-center text-gray-500 bg-gray-50 p-8 rounded-lg border border-gray-200">
          <p className="text-lg mb-4">No newsletter items available</p>
          <p className="text-sm text-gray-400">Add items from the News page</p>
        </div>
      ) : (
        <div className="space-y-4">
          {newsletterItems.map((item) => (
            <div 
              key={item.id} 
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {editingItem && editingItem.id === item.id ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-bold text-gray-900">{item.title}</h2>
                    <div className="flex space-x-2">
                      <button 
                        onClick={handleSaveEdit}
                        className="text-green-600 hover:text-green-800 flex items-center"
                      >
                        <Save className="w-5 h-5 mr-1"/> Save
                      </button>
                      <button 
                        onClick={() => setEditingItem(null)}
                        className="text-red-600 hover:text-red-800 flex items-center"
                      >
                        <X className="w-5 h-5 mr-1"/> Cancel
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600 mb-2">
                    <span>{item.company}</span>
                    <span className="mx-1">•</span>
                    <span>{item.date}</span>
                    <span className="mx-1">•</span>
                    <span>{item.source}</span>
                    <span className="mx-1">•</span>
                    <span>{item.category}</span>
                  </div>
                  
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2 text-sm min-h-[100px]"
                  />
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-md font-bold text-gray-900">{item.title}</h2>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditItem(item)}
                        className="text-gray-500 hover:text-amber-600 focus:outline-none"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 focus:outline-none"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600 mb-2">
                    <span>{item.company}</span>
                    <span className="mx-1">•</span>
                    <span>{item.date}</span>
                    <span className="mx-1">•</span>
                    <span>{item.source}</span>
                    <span className="mx-1">•</span>
                    <span>{item.category}</span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">{item.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-amber-900">Newsletter Preview</h2>
              <button 
                onClick={handleCloseShareModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Larger PDF Preview */}
            {generatedPdfUrl && (
              <div className="my-4">
                <iframe 
                  src={generatedPdfUrl} 
                  width="100%" 
                  height="400" 
                  className="border rounded-lg"
                />
              </div>
            )}
            
            {!showEmailForm ? (
              <button
                onClick={handleShowEmailForm}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg font-medium flex items-center justify-center"
              >
                <Mail className="w-5 h-5 mr-2"/> Share Newsletter
              </button>
            ) : (
              <div className="space-y-4 mt-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <textarea
                    placeholder="Add a message (optional)"
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[100px]"
                  />
                </div>

                <button
                  onClick={handleSendEmail}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg font-medium mb-4"
                  disabled={!emailAddress}
                >
                  Send Newsletter
                </button>
                
                {sendingStatus && (
                  <div className={`text-center p-2 rounded-lg ${
                    sendingStatus.includes('successfully') 
                      ? 'bg-green-100 text-green-700' 
                      : sendingStatus === 'Sending...'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {sendingStatus}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsLetter;