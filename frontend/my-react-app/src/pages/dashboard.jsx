import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);

  const [userInitial, setUserInitial] = useState("C");
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [activeNav, setActiveNav] = useState("upload");
  const [particles, setParticles] = useState([]);
  const [showTextModal, setShowTextModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const itemsPerPage = 5;

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
      return;
    }
    const userData = JSON.parse(user);
    setUserInitial(userData.name?.charAt(0) || "C");

    const savedHistory = localStorage.getItem("recipeHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      showParticles();
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [navigate, location]);

  useEffect(() => {
    if (showPreview && previewRef.current) {
      setTimeout(() => {
        previewRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 300);
    }
  }, [showPreview]);

  const showParticles = () => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 1,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2000);
  };

  const saveToHistory = (item) => {
    const newItem = {
      id: Date.now(),
      ...item,
      timestamp: new Date().toISOString(),
    };
    
    const updatedHistory = [newItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem("recipeHistory", JSON.stringify(updatedHistory));
    
    return newItem;
  };

  const handleFileSelect = (file) => {
    if (file) {
      setSelectedFile(file);
      setPastedText("");
      setShowPreview(true);
      setShowTextModal(false);
    }
  };

  const pasteText = () => {
    setShowTextModal(true);
    setShowPreview(false);
  };

  const handleTextSubmit = () => {
    if (pastedText.trim()) {
      setShowPreview(true);
      setShowTextModal(false);
      setSelectedFile(null);
    } else {
      alert("Please enter some text first");
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPastedText("");
    setShowPreview(false);
    setIsDragging(false);
    setShowTextModal(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadFile = () => {
    if (selectedFile) {
      const historyItem = saveToHistory({
        type: 'file',
        name: selectedFile.name,
        size: selectedFile.size,
        content: null,
        preview: null,
        fullContent: null,
        status: 'processed'
      });
      
      alert(`Uploading ${selectedFile.name}`);
      showParticles();
      setSuccessMessage(`Successfully uploaded "${selectedFile.name}"`);
      
      setTimeout(() => {
        setSelectedFile(null);
        setShowPreview(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 1500);
      
    } else if (pastedText.trim()) {
      const historyItem = saveToHistory({
        type: 'text',
        name: `Text Recipe - ${new Date().toLocaleDateString()}`,
        size: pastedText.length,
        content: pastedText.substring(0, 200) + (pastedText.length > 200 ? '...' : ''),
        preview: pastedText.substring(0, 200) + (pastedText.length > 200 ? '...' : ''),
        fullContent: pastedText,
        status: 'processed'
      });
      
      alert("Uploading pasted recipe text");
      showParticles();
      setSuccessMessage("Successfully uploaded text recipe!");
      
      setTimeout(() => {
        setPastedText("");
        setShowPreview(false);
      }, 1500);
      
    } else {
      alert("Please select a file or enter text first");
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const viewItem = (item) => {
    setSelectedHistoryItem(item);
    setShowViewModal(true);
  };

  const confirmDeleteItem = (item) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const deleteFromHistory = (id) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem("recipeHistory", JSON.stringify(updatedHistory));
    setSuccessMessage("Item removed from history");
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  const confirmClearHistory = () => {
    setShowClearConfirm(true);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("recipeHistory");
    setSuccessMessage("History cleared successfully");
    setShowClearConfirm(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const renderUploadView = () => (
    <>
      <div className="admin-content-header">
        <div>
          <h1 className="admin-page-title">
            <span className="admin-title-gradient">Upload Recipe</span>
          </h1>
          <p className="admin-page-subtitle">Upload files or paste text to extract recipes with AI</p>
        </div>
        <div className="admin-quick-actions">
          <button 
            className="admin-quick-action-btn" 
            onClick={() => fileInputRef.current.click()}
          >
            <i className="fas fa-plus"></i>
            Quick Upload
          </button>
        </div>
      </div>

      <div className="admin-upload-container">
        <div className={`admin-upload-card ${isDragging ? "admin-dragging" : ""}`}>
          <div className="admin-card-header">
            <h3>Choose Upload Method</h3>
            <div className="admin-file-type-badge">
              <i className="fas fa-info-circle"></i>
            </div>
          </div>

          <div className="admin-upload-zone">
            <div 
              className={`admin-drop-zone ${isDragging ? "admin-active" : ""}`}
              onClick={() => fileInputRef.current.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="admin-upload-visual">
                <div className="admin-visual-icon">
                  <i className="fas fa-cloud-upload-alt"></i>
                </div>
                <div className="admin-visual-wave"></div>
                <div className="admin-visual-wave admin-wave-delay"></div>
              </div>
              <h3>Drag & Drop Here</h3>
              <p>or click to browse files from your device</p>
              <div className="admin-upload-hint">
                <i className="fas fa-arrow-up"></i>
                Drop files anywhere to upload
              </div>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                onChange={(e) => handleFileSelect(e.target.files[0])}
                accept=".pdf,.txt,.doc,.docx"
              />
            </div>
          </div>

          <div className="admin-upload-methods">
            <div className="admin-method-card" onClick={() => fileInputRef.current.click()}>
              <div className="admin-method-icon admin-pdf">
                <i className="fas fa-file-pdf"></i>
              </div>
              <h4>PDF File</h4>
              <p>Upload and scan PDF recipes</p>
            </div>

            <div className="admin-method-card" onClick={() => fileInputRef.current.click()}>
              <div className="admin-method-icon admin-text">
                <i className="fas fa-file-alt"></i>
              </div>
              <h4>Text File</h4>
              <p>Upload .txt, .doc, .docx files</p>
            </div>

            <div className="admin-method-card" onClick={pasteText}>
              <div className="admin-method-icon admin-paste">
                <i className="fas fa-paste"></i>
              </div>
              <h4>Paste Text</h4>
              <p>Copy & paste recipe directly</p>
            </div>
          </div>
        </div>

        {showPreview && (
          <div className="admin-preview-panel" ref={previewRef}>
            <div className="admin-panel-header">
              <h3>File Preview</h3>
              <button className="admin-close-preview" onClick={removeFile}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="admin-file-card">
              <div className="admin-file-header">
                <div className="admin-file-icon-large">
                  <i className={`fas ${selectedFile ? "fa-file-pdf" : "fa-file-alt"}`}></i>
                </div>
                <div className="admin-file-info">
                  <h4>{selectedFile ? selectedFile.name : "Pasted Text Recipe"}</h4>
                  {selectedFile && (
                    <div className="admin-file-meta">
                      <span className="admin-meta-item">
                        <i className="fas fa-weight"></i>
                        {formatFileSize(selectedFile.size)}
                      </span>
                      <span className="admin-meta-item">
                        <i className="fas fa-clock"></i>
                        Just now
                      </span>
                    </div>
                  )}
                  {!selectedFile && pastedText && (
                    <div className="admin-file-meta">
                      <span className="admin-meta-item">
                        <i className="fas fa-text-height"></i>
                        {pastedText.length} characters
                      </span>
                      <span className="admin-meta-item">
                        <i className="fas fa-clock"></i>
                        Just now
                      </span>
                    </div>
                  )}
                </div>
                <button className="admin-remove-btn" onClick={removeFile}>
                  <i className="fas fa-trash"></i>
                </button>
              </div>

              {!selectedFile && pastedText && (
                <div className="admin-text-preview">
                  <div className="admin-preview-header">
                    <h5>Content Preview</h5>
                    <span className="admin-char-count">
                      {pastedText.length} characters
                    </span>
                  </div>
                  <div className="admin-text-preview-content">
                    {pastedText.length > 300 
                      ? `${pastedText.substring(0, 300)}...` 
                      : pastedText}
                    {pastedText.length > 300 && (
                      <div className="admin-preview-note">
                        (showing first 300 characters)
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="admin-upload-actions">
                <button className="admin-cancel-btn" onClick={removeFile}>
                  Cancel
                </button>
                <button className="admin-upload-action-btn" onClick={uploadFile}>
                  <i className="fas fa-upload"></i>
                  Process Recipe
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );

  const renderHistoryView = () => {
    const totalPages = Math.ceil(history.length / itemsPerPage);
    const startIndex = (historyPage - 1) * itemsPerPage;
    const paginatedHistory = history.slice(startIndex, startIndex + itemsPerPage);

    return (
      <>
        <div className="admin-content-header">
          <div>
            <h1 className="admin-page-title">
              <span className="admin-title-gradient">History</span>
            </h1>
            <p className="admin-page-subtitle">Your previously uploaded recipes and files</p>
          </div>
          <div className="admin-quick-actions">
            {history.length > 0 && (
              <button 
                className="admin-clear-history-btn" 
                onClick={confirmClearHistory}
              >
                <i className="fas fa-trash-alt"></i>
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="admin-history-container">
          {history.length === 0 ? (
            <div className="admin-empty-history">
              <div className="admin-empty-icon">
                <i className="fas fa-history"></i>
              </div>
              <h3>No History Yet</h3>
              <p>Your uploaded files and recipes will appear here</p>
              <button 
                className="admin-browse-files-btn"
                onClick={() => setActiveNav("upload")}
              >
                <i className="fas fa-upload"></i>
                Upload Files
              </button>
            </div>
          ) : (
            <>
              <div className="admin-history-stats">
                <div className="admin-stat-card">
                  <div className="admin-stat-icon admin-total">
                    <i className="fas fa-layer-group"></i>
                  </div>
                  <div className="admin-stat-info">
                    <h4>{history.length}</h4>
                    <p>Total Items</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-icon admin-files">
                    <i className="fas fa-file"></i>
                  </div>
                  <div className="admin-stat-info">
                    <h4>{history.filter(item => item.type === 'file').length}</h4>
                    <p>Files</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-icon admin-texts">
                    <i className="fas fa-font"></i>
                  </div>
                  <div className="admin-stat-info">
                    <h4>{history.filter(item => item.type === 'text').length}</h4>
                    <p>Text Recipes</p>
                  </div>
                </div>
              </div>

              <div className="admin-history-list">
                {paginatedHistory.map((item) => (
                  <div key={item.id} className="admin-history-item">
                    <div className="admin-history-item-icon">
                      <div className={`admin-item-icon ${item.type}`}>
                        <i className={`fas ${item.type === 'file' ? 'fa-file-pdf' : 'fa-file-alt'}`}></i>
                      </div>
                      <div className={`admin-status-dot ${item.status}`}></div>
                    </div>
                    
                    <div className="admin-history-item-content">
                      <div className="admin-item-header">
                        <h4>{item.name}</h4>
                        <div className="admin-item-meta">
                          <span className="admin-meta-item">
                            <i className="fas fa-calendar"></i>
                            {formatDate(item.timestamp)}
                          </span>
                          <span className="admin-meta-item">
                            <i className="fas fa-weight"></i>
                            {item.type === 'file' 
                              ? formatFileSize(item.size) 
                              : `${item.size} chars`
                            }
                          </span>
                          <span className={`admin-status-badge ${item.status}`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                      
                      {item.preview && (
                        <div className="admin-item-preview">
                          <p>{item.preview}</p>
                        </div>
                      )}
                      
                      <div className="admin-item-actions">
                        <button 
                          className="admin-view-btn"
                          onClick={() => viewItem(item)}
                        >
                          <i className="fas fa-eye"></i>
                          View
                        </button>
                        <button 
                          className="admin-download-btn"
                          onClick={() => alert(`Downloading ${item.name}`)}
                        >
                          <i className="fas fa-download"></i>
                          Download
                        </button>
                        <button 
                          className="admin-delete-btn"
                          onClick={() => confirmDeleteItem(item)}
                        >
                          <i className="fas fa-trash"></i>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="admin-pagination">
                  <button 
                    className="admin-page-btn"
                    onClick={() => setHistoryPage(prev => Math.max(1, prev - 1))}
                    disabled={historyPage === 1}
                  >
                    <i className="fas fa-chevron-left"></i>
                    Previous
                  </button>
                  
                  <div className="admin-page-numbers">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (historyPage <= 3) {
                        pageNum = i + 1;
                      } else if (historyPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = historyPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          className={`admin-page-number ${historyPage === pageNum ? 'admin-active' : ''}`}
                          onClick={() => setHistoryPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button 
                    className="admin-page-btn"
                    onClick={() => setHistoryPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={historyPage === totalPages}
                  >
                    Next
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="admin-dashboard-page">
      {/* Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="admin-particle"
          style={{
            left: particle.x,
            top: particle.y,
            transform: `translate(${particle.vx * 100}px, ${particle.vy * 100}px)`,
            opacity: particle.life,
            background: `hsl(${Math.random() * 60 + 190}, 70%, 60%)`,
          }}
        />
      ))}

      {/* Success Message */}
      {successMessage && (
        <div className="admin-global-success-message">
          <div className="admin-success-content-wrapper">
            <div className="admin-success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="admin-success-text">
              <h4>Success!</h4>
              <p>{successMessage}</p>
            </div>
            <button className="admin-close-success" onClick={() => setSuccessMessage("")}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

      {/* Background */}
      <div className="admin-bg-blob admin-blob-1"></div>
      <div className="admin-bg-blob admin-blob-2"></div>

      {/* Header */}
      <header className="admin-dashboard-header">
        <div className="admin-logo-container">
          <div className="admin-logo-icon">
            <i className="fas fa-mortar-pestle"></i>
          </div>
          <div className="admin-logo-text">
            <h1 className="admin-title-gradient">learnsphere</h1>
            {/* <p className="admin-logo-subtitle">AI Processor</p> */}
          </div>
        </div>

        <div className="admin-user-menu">
          <div className="admin-user-avatar-container">
            <div className="admin-user-avatar-ring">
              <div className="admin-user-avatar">{userInitial}</div>
            </div>
            <div className="admin-user-status"></div>
          </div>
          <button className="admin-logout-btn" onClick={logout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Text Input Modal */}
      {showTextModal && (
        <div className="admin-text-input-modal-overlay">
          <div className="admin-text-input-modal">
            <div className="admin-modal-header">
              <h3>Paste Text</h3>
              <button className="admin-close-modal" onClick={() => setShowTextModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <textarea
                className="admin-recipe-textarea-modal"
                placeholder="Paste your recipe here... (Ingredients, instructions, cooking time, etc.)"
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={8}
                autoFocus
              />
              <div className="admin-modal-footer">
                <button 
                  className="admin-cancel-btn" 
                  onClick={() => {
                    setPastedText("");
                    setShowTextModal(false);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="admin-submit-text-btn" 
                  onClick={handleTextSubmit}
                  disabled={!pastedText.trim()}
                >
                  <i className="fas fa-check"></i>
                  Submit Text
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="admin-confirmation-modal-overlay">
          <div className="admin-confirmation-modal">
            <div className="admin-confirmation-header admin-warning">
              <i className="fas fa-exclamation-triangle"></i>
              <h3>Clear All History</h3>
            </div>
            <div className="admin-confirmation-body">
              <p>Are you sure you want to clear all history? This action cannot be undone.</p>
              <div className="admin-confirmation-stats">
                <div className="admin-stat-warning">
                  <i className="fas fa-layer-group"></i>
                  <span>{history.length} items will be removed</span>
                </div>
              </div>
            </div>
            <div className="admin-confirmation-footer">
              <button 
                className="admin-cancel-confirm-btn"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="admin-confirm-delete-all-btn"
                onClick={clearHistory}
              >
                <i className="fas fa-trash-alt"></i>
                Clear All History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      {showDeleteConfirm && itemToDelete && (
        <div className="admin-confirmation-modal-overlay">
          <div className="admin-confirmation-modal">
            <div className="admin-confirmation-header admin-warning">
              <i className="fas fa-exclamation-triangle"></i>
              <h3>Delete Item</h3>
            </div>
            <div className="admin-confirmation-body">
              <p>Are you sure you want to delete this item?</p>
              <div className="admin-item-to-delete">
                <div className="admin-item-icon-small">
                  <i className={`fas ${itemToDelete.type === 'file' ? 'fa-file-pdf' : 'fa-file-alt'}`}></i>
                </div>
                <div className="admin-item-details">
                  <h4>{itemToDelete.name}</h4>
                  <div className="admin-item-meta-small">
                    <span>
                      <i className="fas fa-calendar"></i>
                      {formatDate(itemToDelete.timestamp)}
                    </span>
                    <span>
                      <i className="fas fa-weight"></i>
                      {itemToDelete.type === 'file' 
                        ? formatFileSize(itemToDelete.size) 
                        : `${itemToDelete.size} chars`
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-confirmation-footer">
              <button 
                className="admin-cancel-confirm-btn"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setItemToDelete(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="admin-confirm-delete-btn"
                onClick={() => deleteFromHistory(itemToDelete.id)}
              >
                <i className="fas fa-trash"></i>
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Item Modal */}
      {showViewModal && selectedHistoryItem && (
        <div className="admin-view-modal-overlay">
          <div className="admin-view-modal">
            <div className="admin-view-modal-header">
              <div className="admin-view-header-left">
                <div className={`admin-view-item-icon ${selectedHistoryItem.type}`}>
                  <i className={`fas ${selectedHistoryItem.type === 'file' ? 'fa-file-pdf' : 'fa-file-alt'}`}></i>
                </div>
                <div>
                  <h3>{selectedHistoryItem.name}</h3>
                  <div className="admin-view-item-meta">
                    <span>
                      <i className="fas fa-calendar"></i>
                      {formatDate(selectedHistoryItem.timestamp)}
                    </span>
                    <span>
                      <i className="fas fa-weight"></i>
                      {selectedHistoryItem.type === 'file' 
                        ? formatFileSize(selectedHistoryItem.size) 
                        : `${selectedHistoryItem.size} characters`
                      }
                    </span>
                    <span className={`admin-view-status-badge ${selectedHistoryItem.status}`}>
                      {selectedHistoryItem.status}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                className="admin-close-view-modal"
                onClick={() => setShowViewModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="admin-view-modal-content">
              {selectedHistoryItem.type === 'text' && selectedHistoryItem.fullContent ? (
                <div className="admin-text-content-view">
                  <div className="admin-content-header-view">
                    <h4>Content</h4>
                    <span className="admin-char-count-view">
                      {selectedHistoryItem.fullContent.length} characters
                    </span>
                  </div>
                  <div className="admin-text-content-display">
                    {selectedHistoryItem.fullContent}
                  </div>
                </div>
              ) : selectedHistoryItem.type === 'file' ? (
                <div className="admin-file-content-view">
                  <div className="admin-file-preview-placeholder">
                    <i className="fas fa-file-pdf fa-4x"></i>
                    <p>File: {selectedHistoryItem.name}</p>
                    <p className="admin-file-info">This is a file upload. Original file content cannot be displayed here.</p>
                    <button 
                      className="admin-download-full-btn"
                      onClick={() => alert(`Downloading ${selectedHistoryItem.name}`)}
                    >
                      <i className="fas fa-download"></i>
                      Download Original File
                    </button>
                  </div>
                </div>
              ) : (
                <div className="admin-no-content-view">
                  <i className="fas fa-info-circle"></i>
                  <p>No content available for this item.</p>
                </div>
              )}
            </div>
            
            <div className="admin-view-modal-footer">
              <button 
                className="admin-close-view-btn"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
              <button 
                className="admin-download-view-btn"
                onClick={() => alert(`Downloading ${selectedHistoryItem.name}`)}
              >
                <i className="fas fa-download"></i>
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="admin-dashboard-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-header">
            <h3>Navigation</h3>
          </div>
          <div className="admin-sidebar-nav">
            <div 
              className={`admin-nav-item ${activeNav === "upload" ? "admin-active" : ""}`}
              onClick={() => setActiveNav("upload")}
            >
              <div className="admin-nav-icon">
                <i className="fas fa-upload"></i>
              </div>
              <span>Upload</span>
              {activeNav === "upload" && <div className="admin-nav-indicator"></div>}
            </div>
            
            <div 
              className={`admin-nav-item ${activeNav === "history" ? "admin-active" : ""}`}
              onClick={() => setActiveNav("history")}
            >
              <div className="admin-nav-icon">
                <i className="fas fa-history"></i>
              </div>
              <span>History</span>
              {activeNav === "history" && <div className="admin-nav-indicator"></div>}
            </div>
            
            <div 
              className={`admin-nav-item ${activeNav === "recipes" ? "admin-active" : ""}`}
              onClick={() => setActiveNav("recipes")}
            >
              <div className="admin-nav-icon">
                <i className="fas fa-book"></i>
              </div>
              <span>My Recipes</span>
              {activeNav === "recipes" && <div className="admin-nav-indicator"></div>}
            </div>
            
            <div 
              className={`admin-nav-item ${activeNav === "settings" ? "admin-active" : ""}`}
              onClick={() => setActiveNav("settings")}
            >
              <div className="admin-nav-icon">
                <i className="fas fa-cog"></i>
              </div>
              <span>Settings</span>
              {activeNav === "settings" && <div className="admin-nav-indicator"></div>}
            </div>
          </div>
        </aside>

        <main className="admin-main-content-scroll">
          {activeNav === "upload" && renderUploadView()}
          {activeNav === "history" && renderHistoryView()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;


// import { useEffect, useRef, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import "../styles/dashboard.css";
// import { 
//   Upload as UploadIcon, 
//   History as HistoryIcon, 
//   BookOpen as BookOpenIcon, 
//   Settings as SettingsIcon, 
//   UserCircle as UserCircleIcon, 
//   LogOut as LogOutIcon,
//   FileText as FileTextIcon,
//   File as FileIcon,
//   Clipboard as ClipboardIcon,
//   Eye as EyeIcon,
//   Download as DownloadIcon,
//   Trash2 as Trash2Icon,
//   ChevronLeft as ChevronLeftIcon,
//   ChevronRight as ChevronRightIcon,
//   CheckCircle as CheckCircleIcon,
//   X as XIcon,
//   AlertTriangle as AlertTriangleIcon,
//   Plus as PlusIcon,
//   Clock as ClockIcon,
//   Calendar as CalendarIcon,
//   BarChart3 as BarChart3Icon,
//   CloudUpload as CloudUploadIcon,
//   Search as SearchIcon,
//   Filter as FilterIcon,
//   Layers as LayersIcon,
//   Check as CheckIcon,
//   Info as InfoIcon,
//   ExternalLink as ExternalLinkIcon,
//   MoreVertical as MoreVerticalIcon,
//   Sparkles as SparklesIcon,
//   Home as HomeIcon,
//   Users as UsersIcon,
//   FileCheck as FileCheckIcon,
//   TrendingUp as TrendingUpIcon,
//   Bell as BellIcon,
//   HelpCircle as HelpCircleIcon,
//   Grid as GridIcon,
//   Menu as MenuIcon,
//   MessageSquare as MessageSquareIcon,
//   Shield as ShieldIcon,
//   Target as TargetIcon
// } from "lucide-react";

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const fileInputRef = useRef(null);
//   const previewRef = useRef(null);

//   const [user, setUser] = useState({ 
//     name: "Alex Johnson", 
//     role: "Senior Educator",
//     email: "alex.j@learnsphere.edu",
//     initials: "AJ"
//   });
  
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [pastedText, setPastedText] = useState("");
//   const [showPreview, setShowPreview] = useState(false);
//   const [successMessage, setSuccessMessage] = useState("");
//   const [isDragging, setIsDragging] = useState(false);
//   const [activeNav, setActiveNav] = useState("dashboard");
//   const [showTextModal, setShowTextModal] = useState(false);
//   const [history, setHistory] = useState([]);
//   const [historyPage, setHistoryPage] = useState(1);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filterType, setFilterType] = useState("all");
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const itemsPerPage = 8;

//   const [showClearConfirm, setShowClearConfirm] = useState(false);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [itemToDelete, setItemToDelete] = useState(null);
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

//   // Enhanced dashboard stats
//   const [dashboardStats] = useState({
//     totalCourses: 12,
//     activeStudents: 342,
//     completedAssignments: "89%",
//     averageScore: "87%",
//     pendingReviews: 3,
//     studentEngagement: "92%"
//   });

//   // Enhanced recent activities
//   const [recentActivities] = useState([
//     { 
//       id: 1, 
//       type: 'assignment', 
//       title: 'Algebra Quiz Results Published', 
//       description: 'Average score: 85% across 45 students', 
//       time: '2 hours ago', 
//       status: 'completed',
//       icon: <FileCheckIcon size={20} />
//     },
//     { 
//       id: 2, 
//       type: 'upload', 
//       title: 'Lesson Plan Uploaded', 
//       description: 'Calculus - Chapter 3: Derivatives', 
//       time: 'Yesterday', 
//       status: 'completed',
//       icon: <UploadIcon size={20} />
//     },
//     { 
//       id: 3, 
//       type: 'student', 
//       title: 'New Student Enrollment', 
//       description: 'Sarah Johnson joined Calculus 101', 
//       time: '2 days ago', 
//       status: 'active',
//       icon: <UsersIcon size={20} />
//     },
//     { 
//       id: 4, 
//       type: 'resource', 
//       title: 'Resource Shared', 
//       description: 'Physics Lab Manual shared with class', 
//       time: '3 days ago', 
//       status: 'shared',
//       icon: <BookOpenIcon size={20} />
//     }
//   ]);

//   useEffect(() => {
//     const userData = localStorage.getItem("user");
//     if (!userData) {
//       navigate("/login");
//       return;
//     }
    
//     try {
//       const parsedUser = JSON.parse(userData);
//       setUser(prev => ({ ...prev, ...parsedUser }));
//     } catch (error) {
//       console.error("Error parsing user data:", error);
//     }

//     const savedHistory = localStorage.getItem("recipeHistory");
//     if (savedHistory) {
//       try {
//         setHistory(JSON.parse(savedHistory));
//       } catch (error) {
//         console.error("Error parsing history:", error);
//       }
//     }

//     if (location.state?.message) {
//       setSuccessMessage(location.state.message);
//       window.history.replaceState({}, document.title);
//       const timer = setTimeout(() => {
//         setSuccessMessage("");
//       }, 3003);
//       return () => clearTimeout(timer);
//     }
//   }, [navigate, location]);

//   useEffect(() => {
//     if (showPreview && previewRef.current) {
//       setTimeout(() => {
//         previewRef.current.scrollIntoView({ 
//           behavior: 'smooth', 
//           block: 'center' 
//         });
//       }, 300);
//     }
//   }, [showPreview]);

//   const saveToHistory = (item) => {
//     const newItem = {
//       id: Date.now(),
//       ...item,
//       timestamp: new Date().toISOString(),
//     };
    
//     const updatedHistory = [newItem, ...history];
//     setHistory(updatedHistory);
//     localStorage.setItem("recipeHistory", JSON.stringify(updatedHistory));
    
//     return newItem;
//   };

//   const handleFileSelect = (file) => {
//     if (file) {
//       setSelectedFile(file);
//       setPastedText("");
//       setShowPreview(true);
//       setShowTextModal(false);
//     }
//   };

//   const pasteText = () => {
//     setShowTextModal(true);
//     setShowPreview(false);
//   };

//   const handleTextSubmit = () => {
//     if (pastedText.trim()) {
//       const historyItem = saveToHistory({
//         type: 'text',
//         name: `Lesson Material - ${new Date().toLocaleDateString()}`,
//         size: pastedText.length,
//         content: pastedText.substring(0, 200) + (pastedText.length > 200 ? '...' : ''),
//         preview: pastedText.substring(0, 200) + (pastedText.length > 200 ? '...' : ''),
//         fullContent: pastedText,
//         status: 'processed'
//       });
      
//       setSuccessMessage("Educational material saved successfully!");
//       setPastedText("");
//       setShowTextModal(false);
//       setShowPreview(false);
//     } else {
//       alert("Please enter some educational content first");
//     }
//   };

//   const removeFile = () => {
//     setSelectedFile(null);
//     setPastedText("");
//     setShowPreview(false);
//     setIsDragging(false);
//     setShowTextModal(false);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   const uploadFile = () => {
//     if (selectedFile) {
//       const historyItem = saveToHistory({
//         type: 'file',
//         name: selectedFile.name,
//         size: selectedFile.size,
//         content: null,
//         preview: null,
//         fullContent: null,
//         status: 'processed'
//       });
      
//       setSuccessMessage(`Successfully uploaded "${selectedFile.name}" for processing`);
      
//       setTimeout(() => {
//         setSelectedFile(null);
//         setShowPreview(false);
//         if (fileInputRef.current) fileInputRef.current.value = "";
//       }, 1500);
      
//     } else if (pastedText.trim()) {
//       handleTextSubmit();
//     } else {
//       alert("Please select a file or enter content first");
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem("authToken");
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const handleDragLeave = (e) => {
//     e.preventDefault();
//     setIsDragging(false);
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDragging(false);
//     if (e.dataTransfer.files.length) {
//       handleFileSelect(e.dataTransfer.files[0]);
//     }
//   };

//   const viewItem = (item) => {
//     setSelectedHistoryItem(item);
//     setShowViewModal(true);
//   };

//   const confirmDeleteItem = (item) => {
//     setItemToDelete(item);
//     setShowDeleteConfirm(true);
//   };

//   const deleteFromHistory = (id) => {
//     const updatedHistory = history.filter(item => item.id !== id);
//     setHistory(updatedHistory);
//     localStorage.setItem("recipeHistory", JSON.stringify(updatedHistory));
//     setSuccessMessage("Item removed from history");
//     setShowDeleteConfirm(false);
//     setItemToDelete(null);
//   };

//   const confirmClearHistory = () => {
//     setShowClearConfirm(true);
//   };

//   const clearHistory = () => {
//     setHistory([]);
//     localStorage.removeItem("recipeHistory");
//     setSuccessMessage("History cleared successfully");
//     setShowClearConfirm(false);
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffMs = now - date;
//     const diffMins = Math.floor(diffMs / 60000);
//     const diffHours = Math.floor(diffMs / 3600000);
//     const diffDays = Math.floor(diffMs / 86400000);

//     if (diffMins < 1) return "Just now";
//     if (diffMins < 60) return `${diffMins} min ago`;
//     if (diffHours < 24) return `${diffHours} hours ago`;
//     if (diffDays < 7) return `${diffDays} days ago`;
    
//     // Return formatted date for older items
//     return date.toLocaleDateString('en-US', { 
//       month: 'short', 
//       day: 'numeric',
//       year: diffDays > 365 ? 'numeric' : undefined
//     });
//   };

//   const formatFileSize = (bytes) => {
//     if (bytes < 1024) return bytes + " B";
//     if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
//     return (bytes / (1024 * 1024)).toFixed(1) + " MB";
//   };

//   // Filter history based on search and filter type
//   const filteredHistory = history.filter(item => {
//     const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()));
    
//     const matchesType = filterType === "all" || item.type === filterType;
    
//     return matchesSearch && matchesType;
//   });

//   const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
//   const startIndex = (historyPage - 1) * itemsPerPage;
//   const paginatedHistory = filteredHistory.slice(startIndex, startIndex + itemsPerPage);

//   const renderDashboardView = () => (
//     <>
//       <div className="admin-content-header">
//         <div>
//           <h1 className="admin-page-title">
//             <span className="admin-title-gradient">Welcome back, {user.name}!</span>
//           </h1>
//           <p className="admin-page-subtitle">Here's your teaching dashboard overview</p>
//         </div>
//         <div className="admin-quick-actions">
//           <button 
//             className="admin-quick-action-btn admin-primary-btn" 
//             onClick={() => fileInputRef.current.click()}
//           >
//             <PlusIcon size={18} />
//             New Content
//           </button>
//           <button className="admin-header-btn">
//             <BellIcon size={20} />
//           </button>
//         </div>
//       </div>

//       <div className="admin-stats-grid">
//         <div className="admin-stat-card admin-stat-card-enhanced">
//           <div className="admin-stat-header">
//             <div className={`admin-stat-icon admin-stat-icon-blue`}>
//               <BookOpenIcon size={24} />
//             </div>
//             <div className="admin-stat-trend positive">
//               <TrendingUpIcon size={14} />
//               <span>+12%</span>
//             </div>
//           </div>
//           <div className="admin-stat-info">
//             <h3>{dashboardStats.totalCourses}</h3>
//             <p>Active Courses</p>
//           </div>
//         </div>

//         <div className="admin-stat-card admin-stat-card-enhanced">
//           <div className="admin-stat-header">
//             <div className={`admin-stat-icon admin-stat-icon-green`}>
//               <UsersIcon size={24} />
//             </div>
//             <div className="admin-stat-trend positive">
//               <TrendingUpIcon size={14} />
//               <span>+8%</span>
//             </div>
//           </div>
//           <div className="admin-stat-info">
//             <h3>{dashboardStats.activeStudents}</h3>
//             <p>Total Students</p>
//           </div>
//         </div>

//         <div className="admin-stat-card admin-stat-card-enhanced">
//           <div className="admin-stat-header">
//             <div className={`admin-stat-icon admin-stat-icon-purple`}>
//               <FileCheckIcon size={24} />
//             </div>
//             <div className="admin-stat-trend">
//               <span>Today</span>
//             </div>
//           </div>
//           <div className="admin-stat-info">
//             <h3>{dashboardStats.completedAssignments}</h3>
//             <p>Assignments Graded</p>
//           </div>
//         </div>

//         <div className="admin-stat-card admin-stat-card-enhanced">
//           <div className="admin-stat-header">
//             <div className={`admin-stat-icon admin-stat-icon-orange`}>
//               <TrendingUpIcon size={24} />
//             </div>
//             <div className="admin-stat-trend positive">
//               <TrendingUpIcon size={14} />
//               <span>+5%</span>
//             </div>
//           </div>
//           <div className="admin-stat-info">
//             <h3>{dashboardStats.averageScore}</h3>
//             <p>Average Score</p>
//           </div>
//         </div>
//       </div>

//       <div className="admin-content-grid">
//         <div className="admin-recent-activities admin-card">
//           <div className="admin-section-header">
//             <h3>Recent Activities</h3>
//             <button className="admin-btn-text">View All</button>
//           </div>
//           <div className="admin-activities-list">
//             {recentActivities.map((activity) => (
//               <div key={activity.id} className="admin-activity-item admin-activity-item-enhanced">
//                 <div className={`admin-activity-icon admin-activity-icon-${activity.type}`}>
//                   {activity.icon}
//                 </div>
//                 <div className="admin-activity-content">
//                   <h4>{activity.title}</h4>
//                   <p className="admin-activity-description">{activity.description}</p>
//                   <span className="admin-activity-time">{activity.time}</span>
//                 </div>
//                 <div className={`admin-activity-status admin-activity-status-${activity.status}`}>
//                   <div className="admin-status-dot"></div>
//                   {activity.status}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="admin-quick-actions-section admin-card">
//           <div className="admin-section-header">
//             <h3>Quick Actions</h3>
//           </div>
//           <div className="admin-actions-grid">
//             <button className="admin-action-card admin-action-card-enhanced" onClick={() => fileInputRef.current.click()}>
//               <div className="admin-action-icon admin-action-icon-upload">
//                 <CloudUploadIcon size={24} />
//               </div>
//               <h4>Upload Material</h4>
//               <p>Share files with students</p>
//             </button>
            
//             <button className="admin-action-card admin-action-card-enhanced" onClick={pasteText}>
//               <div className="admin-action-icon admin-action-icon-text">
//                 <ClipboardIcon size={24} />
//               </div>
//               <h4>Create Content</h4>
//               <p>Write lesson notes</p>
//             </button>
            
//             <button className="admin-action-card admin-action-card-enhanced" onClick={() => setActiveNav("history")}>
//               <div className="admin-action-icon admin-action-icon-history">
//                 <HistoryIcon size={24} />
//               </div>
//               <h4>View History</h4>
//               <p>Past materials</p>
//             </button>
            
//             <button className="admin-action-card admin-action-card-enhanced">
//               <div className="admin-action-icon admin-action-icon-ai">
//                 <SparklesIcon size={24} />
//               </div>
//               <h4>AI Analysis</h4>
//               <p>Smart insights</p>
//             </button>
//           </div>
//         </div>
//       </div>
//     </>
//   );

//   const renderUploadView = () => (
//     <>
//       <div className="admin-content-header">
//         <div>
//           <h1 className="admin-page-title">
//             <span className="admin-title-gradient">Upload Educational Content</span>
//           </h1>
//           <p className="admin-page-subtitle">Share files, lessons, or create new content for your students</p>
//         </div>
//         <div className="admin-quick-actions">
//           <button 
//             className="admin-quick-action-btn admin-primary-btn" 
//             onClick={() => fileInputRef.current.click()}
//           >
//             <UploadIcon size={18} />
//             Quick Upload
//           </button>
//         </div>
//       </div>

//       <div className="admin-upload-container">
//         <div className={`admin-upload-card ${isDragging ? "admin-dragging" : ""}`}>
//           <div className="admin-upload-header">
//             <div className="admin-upload-title">
//               <CloudUploadIcon size={32} />
//               <h3>Upload Educational Materials</h3>
//             </div>
//             <p>Drag & drop or click to browse files from your device</p>
//           </div>

//           <div className="admin-upload-zone">
//             <div 
//               className={`admin-drop-zone ${isDragging ? "admin-active" : ""}`}
//               onClick={() => fileInputRef.current.click()}
//               onDragOver={handleDragOver}
//               onDragLeave={handleDragLeave}
//               onDrop={handleDrop}
//             >
//               <div className="admin-upload-visual">
//                 <div className="admin-upload-icon-large">
//                   <CloudUploadIcon size={48} />
//                 </div>
//                 <div className="admin-upload-hint">
//                   <p>Supports PDF, DOC, PPT, Images, and more</p>
//                   <span>Max file size: 100MB</span>
//                 </div>
//                 <button className="admin-browse-files-btn">
//                   Browse Files
//                 </button>
//               </div>
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 hidden
//                 onChange={(e) => handleFileSelect(e.target.files[0])}
//                 accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,."
//                 multiple
//               />
//             </div>
//           </div>

//           <div className="admin-upload-methods">
//             <div className="admin-method-card admin-method-card-enhanced" onClick={() => fileInputRef.current.click()}>
//               <div className="admin-method-icon admin-method-icon-file">
//                 <FileIcon size={24} />
//               </div>
//               <div className="admin-method-content">
//                 <h4>Upload Files</h4>
//                 <p>PDF, DOC, PPT, Images</p>
//               </div>
//             </div>

//             <div className="admin-method-card admin-method-card-enhanced" onClick={pasteText}>
//               <div className="admin-method-icon admin-method-icon-text">
//                 <FileTextIcon size={24} />
//               </div>
//               <div className="admin-method-content">
//                 <h4>Create Content</h4>
//                 <p>Lesson notes, assignments</p>
//               </div>
//             </div>

//             <div className="admin-method-card admin-method-card-enhanced">
//               <div className="admin-method-icon admin-method-icon-link">
//                 <ExternalLinkIcon size={24} />
//               </div>
//               <div className="admin-method-content">
//                 <h4>Import URL</h4>
//                 <p>Web articles, videos</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {showPreview && (
//           <div className="admin-preview-panel" ref={previewRef}>
//             <div className="admin-panel-header">
//               <h3>Preview</h3>
//               <button className="admin-close-preview" onClick={removeFile}>
//                 <XIcon size={20} />
//               </button>
//             </div>

//             <div className="admin-file-card admin-file-card-enhanced">
//               <div className="admin-file-header">
//                 <div className="admin-file-icon admin-file-icon-preview">
//                   {selectedFile ? (
//                     <FileIcon size={32} />
//                   ) : (
//                     <FileTextIcon size={32} />
//                   )}
//                 </div>
//                 <div className="admin-file-info">
//                   <h4>{selectedFile ? selectedFile.name : "Educational Content"}</h4>
//                   <div className="admin-file-meta">
//                     {selectedFile ? (
//                       <>
//                         <span>
//                           <FileIcon size={14} />
//                           {formatFileSize(selectedFile.size)}
//                         </span>
//                         <span>
//                           <ClockIcon size={14} />
//                           Just now
//                         </span>
//                       </>
//                     ) : (
//                       <>
//                         <span>
//                           <FileTextIcon size={14} />
//                           {pastedText.length} characters
//                         </span>
//                         <span>
//                           <ClockIcon size={14} />
//                           Just now
//                         </span>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {!selectedFile && pastedText && (
//                 <div className="admin-text-preview">
//                   <div className="admin-preview-header">
//                     <h5>Content Preview</h5>
//                     <span className="admin-char-count">
//                       {pastedText.length} chars
//                     </span>
//                   </div>
//                   <div className="admin-text-preview-content">
//                     {pastedText.length > 300 
//                       ? `${pastedText.substring(0, 300)}...` 
//                       : pastedText}
//                   </div>
//                 </div>
//               )}

//               <div className="admin-upload-actions">
//                 <button className="admin-cancel-btn admin-btn-secondary" onClick={removeFile}>
//                   Cancel
//                 </button>
//                 <button className="admin-upload-action-btn admin-primary-btn" onClick={uploadFile}>
//                   <UploadIcon size={18} />
//                   Upload & Process
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );

//   const renderHistoryView = () => (
//     <>
//       <div className="admin-content-header">
//         <div>
//           <h1 className="admin-page-title">
//             <span className="admin-title-gradient">Content History</span>
//           </h1>
//           <p className="admin-page-subtitle">View and manage your previously uploaded educational materials</p>
//         </div>
//         <div className="admin-quick-actions">
//           {history.length > 0 && (
//             <button 
//               className="admin-clear-history-btn admin-btn-danger" 
//               onClick={confirmClearHistory}
//             >
//               <Trash2Icon size={18} />
//               Clear All
//             </button>
//           )}
//           <button className="admin-header-btn">
//             <FilterIcon size={20} />
//           </button>
//         </div>
//       </div>

//       <div className="admin-history-container">
//         <div className="admin-history-header admin-card">
//           <div className="admin-search-box admin-search-box-enhanced">
//             <SearchIcon size={18} />
//             <input
//               type="text"
//               placeholder="Search materials..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//             {searchQuery && (
//               <button className="admin-clear-search" onClick={() => setSearchQuery("")}>
//                 <XIcon size={16} />
//               </button>
//             )}
//           </div>
//           <div className="admin-filter-options">
//             <div className="admin-filter-tabs">
//               <button 
//                 className={`admin-filter-tab ${filterType === 'all' ? 'admin-filter-tab-active' : ''}`}
//                 onClick={() => setFilterType('all')}
//               >
//                 All Types
//               </button>
//               <button 
//                 className={`admin-filter-tab ${filterType === 'file' ? 'admin-filter-tab-active' : ''}`}
//                 onClick={() => setFilterType('file')}
//               >
//                 Files
//               </button>
//               <button 
//                 className={`admin-filter-tab ${filterType === 'text' ? 'admin-filter-tab-active' : ''}`}
//                 onClick={() => setFilterType('text')}
//               >
//                 Texts
//               </button>
//             </div>
//           </div>
//         </div>

//         {filteredHistory.length === 0 ? (
//           <div className="admin-empty-history admin-card">
//             <div className="admin-empty-icon">
//               <HistoryIcon size={48} />
//             </div>
//             <h3>No Materials Found</h3>
//             <p>{searchQuery || filterType !== 'all' ? 'Try different search terms or filters' : 'Your uploaded educational content will appear here'}</p>
//             <button 
//               className="admin-browse-files-btn admin-primary-btn"
//               onClick={() => setActiveNav("upload")}
//             >
//               <UploadIcon size={18} />
//               Upload First Material
//             </button>
//           </div>
//         ) : (
//           <>
//             <div className="admin-history-stats admin-card">
//               <div className="admin-stat-badge admin-stat-badge-enhanced">
//                 <LayersIcon size={18} />
//                 <span>{filteredHistory.length} items</span>
//               </div>
//               <div className="admin-stat-badge admin-stat-badge-enhanced">
//                 <FileIcon size={18} />
//                 <span>{filteredHistory.filter(item => item.type === 'file').length} files</span>
//               </div>
//               <div className="admin-stat-badge admin-stat-badge-enhanced">
//                 <FileTextIcon size={18} />
//                 <span>{filteredHistory.filter(item => item.type === 'text').length} texts</span>
//               </div>
//               <div className="admin-stat-badge admin-stat-badge-enhanced">
//                 <CalendarIcon size={18} />
//                 <span>Last updated: {filteredHistory.length > 0 ? formatDate(filteredHistory[0].timestamp) : 'Never'}</span>
//               </div>
//             </div>

//             <div className="admin-history-grid">
//               {paginatedHistory.map((item) => (
//                 <div key={item.id} className="admin-history-card admin-history-card-enhanced">
//                   <div className="admin-card-header">
//                     <div className={`admin-card-icon admin-card-icon-${item.type}`}>
//                       {item.type === 'file' ? <FileIcon size={20} /> : <FileTextIcon size={20} />}
//                     </div>
//                     <div className="admin-card-meta">
//                       <span className={`admin-status-badge admin-status-badge-${item.status}`}>
//                         <div className="admin-status-dot-small"></div>
//                         {item.status}
//                       </span>
//                     </div>
//                     <button className="admin-card-menu">
//                       <MoreVerticalIcon size={18} />
//                     </button>
//                   </div>
                  
//                   <div className="admin-card-content">
//                     <h4>{item.name}</h4>
//                     {item.preview && (
//                       <p className="admin-card-preview">{item.preview}</p>
//                     )}
//                     <div className="admin-card-footer">
//                       <span className="admin-card-footer-item">
//                         <CalendarIcon size={14} />
//                         {formatDate(item.timestamp)}
//                       </span>
//                       <span className="admin-card-footer-item">
//                         <FileIcon size={14} />
//                         {item.type === 'file' 
//                           ? formatFileSize(item.size) 
//                           : `${item.size} chars`
//                         }
//                       </span>
//                     </div>
//                   </div>
                  
//                   <div className="admin-card-actions">
//                     <button 
//                       className="admin-action-btn admin-view-btn"
//                       onClick={() => viewItem(item)}
//                       title="View details"
//                     >
//                       <EyeIcon size={18} />
//                     </button>
//                     <button 
//                       className="admin-action-btn admin-download-btn"
//                       onClick={() => alert(`Downloading ${item.name}`)}
//                       title="Download"
//                     >
//                       <DownloadIcon size={18} />
//                     </button>
//                     <button 
//                       className="admin-action-btn admin-delete-btn"
//                       onClick={() => confirmDeleteItem(item)}
//                       title="Delete"
//                     >
//                       <Trash2Icon size={18} />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {totalPages > 1 && (
//               <div className="admin-pagination admin-card">
//                 <div className="admin-pagination-info">
//                   Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredHistory.length)} of {filteredHistory.length} items
//                 </div>
//                 <div className="admin-pagination-controls">
//                   <button 
//                     className="admin-page-btn admin-page-btn-prev"
//                     onClick={() => setHistoryPage(prev => Math.max(1, prev - 1))}
//                     disabled={historyPage === 1}
//                   >
//                     <ChevronLeftIcon size={18} />
//                     Previous
//                   </button>
                  
//                   <div className="admin-page-numbers">
//                     {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                       let pageNum;
//                       if (totalPages <= 5) {
//                         pageNum = i + 1;
//                       } else if (historyPage <= 3) {
//                         pageNum = i + 1;
//                       } else if (historyPage >= totalPages - 2) {
//                         pageNum = totalPages - 4 + i;
//                       } else {
//                         pageNum = historyPage - 2 + i;
//                       }
                      
//                       return (
//                         <button
//                           key={pageNum}
//                           className={`admin-page-number ${historyPage === pageNum ? 'admin-page-number-active' : ''}`}
//                           onClick={() => setHistoryPage(pageNum)}
//                         >
//                           {pageNum}
//                         </button>
//                       );
//                     })}
//                   </div>
                  
//                   <button 
//                     className="admin-page-btn admin-page-btn-next"
//                     onClick={() => setHistoryPage(prev => Math.min(totalPages, prev + 1))}
//                     disabled={historyPage === totalPages}
//                   >
//                     Next
//                     <ChevronRightIcon size={18} />
//                   </button>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </>
//   );

//   return (
//     <div className="admin-dashboard-page">
//       {/* Background Elements */}
//       <div className="admin-bg-blob admin-blob-1"></div>
//       <div className="admin-bg-blob admin-blob-2"></div>
//       <div className="admin-bg-blob admin-blob-3"></div>

//       {/* Success Toast */}
//       {successMessage && (
//         <div className="admin-global-success-message admin-toast-success">
//           <div className="admin-success-content-wrapper">
//             <div className="admin-success-icon">
//               <CheckCircleIcon size={20} />
//             </div>
//             <div className="admin-success-text">
//               <h4>Success!</h4>
//               <p>{successMessage}</p>
//             </div>
//             <button className="admin-close-success" onClick={() => setSuccessMessage("")}>
//               <XIcon size={18} />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Header */}
//       <header className="admin-dashboard-header admin-header-enhanced">
//         <div className="admin-header-left">
//           <button 
//             className="admin-sidebar-toggle"
//             onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
//           >
//             {sidebarCollapsed ? <MenuIcon size={24} /> : <GridIcon size={24} />}
//           </button>
//           <div className="admin-logo-container">
//             <div className="admin-logo-icon">
//               <SparklesIcon size={24} />
//             </div>
//             <div className="admin-logo-text">
//               <h1 className="admin-title-gradient">learnsphere</h1>
//               <p className="admin-logo-subtitle">Education Platform</p>
//             </div>
//           </div>
//         </div>

//         <div className="admin-header-center">
//           <div className="admin-search-container">
//             <SearchIcon size={18} />
//             <input 
//               type="text" 
//               placeholder="Search courses, students, materials..." 
//               className="admin-global-search"
//             />
//           </div>
//         </div>

//         <div className="admin-header-right">
//           <button className="admin-header-btn admin-header-btn-notification">
//             <BellIcon size={20} />
//             <span className="admin-notification-badge">3</span>
//           </button>
//           <button className="admin-header-btn">
//             <HelpCircleIcon size={20} />
//           </button>
          
//           <div className="admin-user-menu">
//             <div className="admin-user-avatar-container">
//               <div className="admin-user-avatar-ring">
//                 <div className="admin-user-avatar admin-user-avatar-enhanced">
//                   {user.initials || user.name.charAt(0)}
//                 </div>
//               </div>
//               <div className="admin-user-status admin-user-status-online"></div>
//             </div>
//             <div className="admin-user-info-dropdown">
//               <strong>{user.name}</strong>
//               <span>{user.role}</span>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Layout */}
//       <div className="admin-dashboard-layout">
//         <aside className={`admin-sidebar ${sidebarCollapsed ? 'admin-sidebar-collapsed' : ''}`}>
//           <div className="admin-sidebar-header">
//             <h3>Navigation</h3>
//           </div>
          
//           <div className="admin-sidebar-nav">
//             <div 
//               className={`admin-nav-item ${activeNav === "dashboard" ? "admin-active" : ""}`}
//               onClick={() => setActiveNav("dashboard")}
//             >
//               <div className="admin-nav-icon">
//                 <HomeIcon size={20} />
//               </div>
//               <span>Dashboard</span>
//               {activeNav === "dashboard" && <div className="admin-nav-indicator"></div>}
//             </div>
            
//             <div 
//               className={`admin-nav-item ${activeNav === "upload" ? "admin-active" : ""}`}
//               onClick={() => setActiveNav("upload")}
//             >
//               <div className="admin-nav-icon">
//                 <UploadIcon size={20} />
//               </div>
//               <span>Upload</span>
//               {activeNav === "upload" && <div className="admin-nav-indicator"></div>}
//             </div>
            
//             <div 
//               className={`admin-nav-item ${activeNav === "history" ? "admin-active" : ""}`}
//               onClick={() => setActiveNav("history")}
//             >
//               <div className="admin-nav-icon">
//                 <HistoryIcon size={20} />
//               </div>
//               <span>History</span>
//               {activeNav === "history" && <div className="admin-nav-indicator"></div>}
//             </div>
            
//             <div 
//               className={`admin-nav-item ${activeNav === "courses" ? "admin-active" : ""}`}
//               onClick={() => setActiveNav("courses")}
//             >
//               <div className="admin-nav-icon">
//                 <BookOpenIcon size={20} />
//               </div>
//               <span>My Courses</span>
//               {activeNav === "courses" && <div className="admin-nav-indicator"></div>}
//             </div>
            
//             <div 
//               className={`admin-nav-item ${activeNav === "students" ? "admin-active" : ""}`}
//               onClick={() => setActiveNav("students")}
//             >
//               <div className="admin-nav-icon">
//                 <UsersIcon size={20} />
//               </div>
//               <span>Students</span>
//               {activeNav === "students" && <div className="admin-nav-indicator"></div>}
//             </div>
            
//             <div 
//               className={`admin-nav-item ${activeNav === "settings" ? "admin-active" : ""}`}
//               onClick={() => setActiveNav("settings")}
//             >
//               <div className="admin-nav-icon">
//                 <SettingsIcon size={20} />
//               </div>
//               <span>Settings</span>
//               {activeNav === "settings" && <div className="admin-nav-indicator"></div>}
//             </div>
//           </div>

//           <div className="admin-sidebar-footer">
//             <div className="admin-user-profile">
//               <div className="admin-user-avatar-sidebar admin-user-avatar-sidebar-enhanced">
//                 {user.initials || user.name.charAt(0)}
//               </div>
//               <div className="admin-user-info">
//                 <strong>{user.name}</strong>
//                 <span>{user.role}</span>
//               </div>
//               <button className="admin-logout-btn-sidebar" onClick={logout} title="Logout">
//                 <LogOutIcon size={18} />
//               </button>
//             </div>
//           </div>
//         </aside>

//         <main className={`admin-main-content-scroll ${sidebarCollapsed ? 'admin-main-content-expanded' : ''}`}>
//           {activeNav === "dashboard" && renderDashboardView()}
//           {activeNav === "upload" && renderUploadView()}
//           {activeNav === "history" && renderHistoryView()}
//           {activeNav === "courses" && (
//             <div className="admin-coming-soon admin-card">
//               <BookOpenIcon size={48} />
//               <h2>Courses Management</h2>
//               <p>Coming soon - Manage your courses and students</p>
//               <button className="admin-primary-btn">
//                 Explore Demo
//               </button>
//             </div>
//           )}
//           {activeNav === "students" && (
//             <div className="admin-coming-soon admin-card">
//               <UsersIcon size={48} />
//               <h2>Student Management</h2>
//               <p>Coming soon - View and manage your students</p>
//               <button className="admin-primary-btn">
//                 Explore Demo
//               </button>
//             </div>
//           )}
//           {activeNav === "settings" && (
//             <div className="admin-coming-soon admin-card">
//               <SettingsIcon size={48} />
//               <h2>Settings</h2>
//               <p>Coming soon - Configure your preferences</p>
//               <button className="admin-primary-btn">
//                 Explore Demo
//               </button>
//             </div>
//           )}
//         </main>
//       </div>

//       {/* Text Input Modal */}
//       {showTextModal && (
//         <div className="admin-text-input-modal-overlay">
//           <div className="admin-text-input-modal admin-modal-enhanced">
//             <div className="admin-modal-header">
//               <h3>Create Educational Content</h3>
//               <button className="admin-close-modal" onClick={() => setShowTextModal(false)}>
//                 <XIcon size={20} />
//               </button>
//             </div>
//             <div className="admin-modal-body">
//               <div className="admin-modal-subtitle">
//                 <FileTextIcon size={18} />
//                 <span>Enter lesson notes, assignments, or instructional content</span>
//               </div>
//               <textarea
//                 className="admin-recipe-textarea-modal admin-textarea-enhanced"
//                 placeholder="Enter your educational content here... (Lesson notes, assignments, instructions, etc.)"
//                 value={pastedText}
//                 onChange={(e) => setPastedText(e.target.value)}
//                 rows={8}
//                 autoFocus
//               />
//               <div className="admin-textarea-footer">
//                 <span className="admin-char-counter">
//                   {pastedText.length} characters
//                 </span>
//                 <span className="admin-word-counter">
//                   {pastedText.trim().split(/\s+/).filter(word => word.length > 0).length} words
//                 </span>
//               </div>
//               <div className="admin-modal-footer">
//                 <button 
//                   className="admin-cancel-btn admin-btn-secondary" 
//                   onClick={() => {
//                     setPastedText("");
//                     setShowTextModal(false);
//                   }}
//                 >
//                   Cancel
//                 </button>
//                 <button 
//                   className="admin-submit-text-btn admin-primary-btn" 
//                   onClick={handleTextSubmit}
//                   disabled={!pastedText.trim()}
//                 >
//                   <CheckIcon size={18} />
//                   Save Content
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Clear All Confirmation Modal */}
//       {showClearConfirm && (
//         <div className="admin-confirmation-modal-overlay">
//           <div className="admin-confirmation-modal admin-modal-enhanced">
//             <div className="admin-confirmation-header admin-warning">
//               <AlertTriangleIcon size={24} />
//               <h3>Clear All History</h3>
//             </div>
//             <div className="admin-confirmation-body">
//               <p>Are you sure you want to clear all educational content history? This action cannot be undone.</p>
//               <div className="admin-confirmation-stats">
//                 <div className="admin-stat-warning">
//                   <LayersIcon size={18} />
//                   <span>{history.length} items will be permanently removed</span>
//                 </div>
//                 <div className="admin-stat-warning">
//                   <FileIcon size={18} />
//                   <span>{history.filter(item => item.type === 'file').length} files</span>
//                 </div>
//                 <div className="admin-stat-warning">
//                   <FileTextIcon size={18} />
//                   <span>{history.filter(item => item.type === 'text').length} text entries</span>
//                 </div>
//               </div>
//             </div>
//             <div className="admin-confirmation-footer">
//               <button 
//                 className="admin-cancel-confirm-btn admin-btn-secondary"
//                 onClick={() => setShowClearConfirm(false)}
//               >
//                 Cancel
//               </button>
//               <button 
//                 className="admin-confirm-delete-all-btn admin-btn-danger"
//                 onClick={clearHistory}
//               >
//                 <Trash2Icon size={18} />
//                 Clear All History
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Item Confirmation Modal */}
//       {showDeleteConfirm && itemToDelete && (
//         <div className="admin-confirmation-modal-overlay">
//           <div className="admin-confirmation-modal admin-modal-enhanced">
//             <div className="admin-confirmation-header admin-warning">
//               <AlertTriangleIcon size={24} />
//               <h3>Delete Item</h3>
//             </div>
//             <div className="admin-confirmation-body">
//               <p>Are you sure you want to delete this educational material?</p>
//               <div className="admin-item-to-delete">
//                 <div className={`admin-item-icon-small admin-item-icon-${itemToDelete.type}`}>
//                   {itemToDelete.type === 'file' ? <FileIcon size={20} /> : <FileTextIcon size={20} />}
//                 </div>
//                 <div className="admin-item-details">
//                   <h4>{itemToDelete.name}</h4>
//                   <div className="admin-item-meta-small">
//                     <span>
//                       <CalendarIcon size={14} />
//                       {formatDate(itemToDelete.timestamp)}
//                     </span>
//                     <span>
//                       <FileIcon size={14} />
//                       {itemToDelete.type === 'file' 
//                         ? formatFileSize(itemToDelete.size) 
//                         : `${itemToDelete.size} chars`
//                       }
//                     </span>
//                     <span className={`admin-item-status-small admin-item-status-${itemToDelete.status}`}>
//                       {itemToDelete.status}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div className="admin-confirmation-footer">
//               <button 
//                 className="admin-cancel-confirm-btn admin-btn-secondary"
//                 onClick={() => {
//                   setShowDeleteConfirm(false);
//                   setItemToDelete(null);
//                 }}
//               >
//                 Cancel
//               </button>
//               <button 
//                 className="admin-confirm-delete-btn admin-btn-danger"
//                 onClick={() => deleteFromHistory(itemToDelete.id)}
//               >
//                 <Trash2Icon size={18} />
//                 Delete Item
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* View Item Modal */}
//       {showViewModal && selectedHistoryItem && (
//         <div className="admin-view-modal-overlay">
//           <div className="admin-view-modal admin-modal-enhanced">
//             <div className="admin-view-modal-header">
//               <div className="admin-view-header-left">
//                 <div className={`admin-view-item-icon admin-view-item-icon-${selectedHistoryItem.type}`}>
//                   {selectedHistoryItem.type === 'file' ? <FileIcon size={24} /> : <FileTextIcon size={24} />}
//                 </div>
//                 <div>
//                   <h3>{selectedHistoryItem.name}</h3>
//                   <div className="admin-view-item-meta">
//                     <span>
//                       <CalendarIcon size={14} />
//                       {formatDate(selectedHistoryItem.timestamp)}
//                     </span>
//                     <span>
//                       <FileIcon size={14} />
//                       {selectedHistoryItem.type === 'file' 
//                         ? formatFileSize(selectedHistoryItem.size) 
//                         : `${selectedHistoryItem.size} characters`
//                       }
//                     </span>
//                     <span className={`admin-view-status-badge admin-view-status-${selectedHistoryItem.status}`}>
//                       <div className="admin-view-status-dot"></div>
//                       {selectedHistoryItem.status}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//               <button 
//                 className="admin-close-view-modal"
//                 onClick={() => setShowViewModal(false)}
//               >
//                 <XIcon size={20} />
//               </button>
//             </div>
            
//             <div className="admin-view-modal-content">
//               {selectedHistoryItem.type === 'text' && selectedHistoryItem.fullContent ? (
//                 <div className="admin-text-content-view">
//                   <div className="admin-content-header-view">
//                     <h4>Content</h4>
//                     <div className="admin-content-stats">
//                       <span className="admin-char-count-view">
//                         {selectedHistoryItem.fullContent.length} characters
//                       </span>
//                       <span className="admin-word-count-view">
//                         {selectedHistoryItem.fullContent.trim().split(/\s+/).filter(word => word.length > 0).length} words
//                       </span>
//                     </div>
//                   </div>
//                   <div className="admin-text-content-display">
//                     {selectedHistoryItem.fullContent}
//                   </div>
//                 </div>
//               ) : selectedHistoryItem.type === 'file' ? (
//                 <div className="admin-file-content-view">
//                   <div className="admin-file-preview-placeholder">
//                     <FileIcon size={48} />
//                     <p className="admin-file-name-large">{selectedHistoryItem.name}</p>
//                     <p className="admin-file-info">This is a file upload. Download to view original content.</p>
//                     <div className="admin-file-details">
//                       <span>Size: {formatFileSize(selectedHistoryItem.size)}</span>
//                       <span>Uploaded: {formatDate(selectedHistoryItem.timestamp)}</span>
//                     </div>
//                     <button 
//                       className="admin-download-full-btn admin-primary-btn"
//                       onClick={() => alert(`Downloading ${selectedHistoryItem.name}`)}
//                     >
//                       <DownloadIcon size={18} />
//                       Download Original File
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="admin-no-content-view">
//                   <InfoIcon size={24} />
//                   <p>No content available for this item.</p>
//                 </div>
//               )}
//             </div>
            
//             <div className="admin-view-modal-footer">
//               <button 
//                 className="admin-close-view-btn admin-btn-secondary"
//                 onClick={() => setShowViewModal(false)}
//               >
//                 Close
//               </button>
//               <button 
//                 className="admin-download-view-btn admin-primary-btn"
//                 onClick={() => alert(`Downloading ${selectedHistoryItem.name}`)}
//               >
//                 <DownloadIcon size={18} />
//                 Download
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;