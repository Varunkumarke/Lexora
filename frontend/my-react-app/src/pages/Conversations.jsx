import React, { useState, useEffect, useRef } from 'react';
import { Home, Bell, ChevronDown, User, Briefcase, ArrowLeft, Lightbulb, Volume2, Pause, Play, Headphones } from 'lucide-react';
import './Conversations.css';

export default function Conversations({ onBack, level, task }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [currentPlayingAudio, setCurrentPlayingAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [currentConversationIndex, setCurrentConversationIndex] = useState(0);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);
  const conversationQueueRef = useRef([]);
  const isPlayingAllRef = useRef(false);
  const currentIndexRef = useRef(0);
  
  console.log("🎯 Conversations component RENDERED with props:");
  console.log("  - level:", level);
  console.log("  - task:", task);
  
  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      stopAllConversation();
    };
  }, []);
  
  // Update ref when isPlayingAll changes
  useEffect(() => {
    isPlayingAllRef.current = isPlayingAll;
  }, [isPlayingAll]);
  
  // Cleanup audio (but don't reset everything if playing all)
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current && !isPlayingAllRef.current) {
      // Only revoke URL if not playing all
      window.URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setIsPlaying(false);
    
    // Only reset currentPlayingAudio if not playing all
    if (!isPlayingAllRef.current) {
      setCurrentPlayingAudio(null);
    }
    
    setAudioLoading(false);
  };
  
  // Stop the entire conversation playback
  const stopAllConversation = () => {
    isPlayingAllRef.current = false;
    setIsPlayingAll(false);
    setCurrentConversationIndex(0);
    currentIndexRef.current = 0;
    conversationQueueRef.current = [];
    setProgress({ current: 0, total: 0 });
    
    // Cleanup audio completely
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      window.URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setIsPlaying(false);
    setCurrentPlayingAudio(null);
  };
  
  // Play a specific conversation message
  const playSingleMessage = async (message, messageId) => {
    // If we're playing all conversations, stop that first
    if (isPlayingAllRef.current) {
      stopAllConversation();
    }
    
    // If the same audio is already playing, pause it
    if (currentPlayingAudio === messageId && isPlaying) {
      stopAudio();
      return;
    }
    
    // If a different audio is playing, stop it first
    if (currentPlayingAudio !== messageId && audioRef.current) {
      stopAudio();
    }
    
    // If the same audio is paused, resume it
    if (currentPlayingAudio === messageId && !isPlaying && audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error resuming audio:", error);
        stopAudio();
      }
      return;
    }
    
    // Fetch and play new audio
    await playAudioFromServer(message, messageId);
  };
  
  // Play audio from server (shared function)
  const playAudioFromServer = async (text, messageId, isPartOfQueue = false) => {
    try {
      setAudioLoading(true);
      setCurrentPlayingAudio(messageId);
      
      // Use the same TTS endpoint as vocabulary
      const response = await fetch("http://10.2.142.27:3003/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          text: text,
          language: 'en'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Audio generation failed: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error("Empty audio response from server");
      }
      
      const audioUrl = window.URL.createObjectURL(blob);
      audioUrlRef.current = audioUrl;
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      // Set up event handlers
      const onAudioEnded = () => {
        // Clean up this audio
        if (audioRef.current) {
          audioRef.current = null;
        }
        if (audioUrlRef.current) {
          window.URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
        setIsPlaying(false);
        setAudioLoading(false);
        
        // If this was part of the conversation queue, play the next one
        if (isPartOfQueue && isPlayingAllRef.current) {
          setTimeout(() => playNextInQueue(), 300); // Small delay between sentences
        }
      };
      
      audio.onended = onAudioEnded;
      
      audio.onerror = (e) => {
        console.error("Audio playback error:", e);
        
        // Clean up on error
        if (audioRef.current) {
          audioRef.current = null;
        }
        if (audioUrlRef.current) {
          window.URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
        setIsPlaying(false);
        setAudioLoading(false);
        
        // Even on error, try to play next if in queue
        if (isPartOfQueue && isPlayingAllRef.current) {
          setTimeout(() => playNextInQueue(), 300);
        }
      };
      
      await audio.play();
      setIsPlaying(true);
      
    } catch (error) {
      console.error("Audio error:", error);
      
      // Clean up on error
      if (audioRef.current) {
        audioRef.current = null;
      }
      if (audioUrlRef.current) {
        window.URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
      setIsPlaying(false);
      setAudioLoading(false);
      
      // If this was part of queue, try next one
      if (isPartOfQueue && isPlayingAllRef.current) {
        setTimeout(() => playNextInQueue(), 300);
        return;
      }
      
      // Fallback: Use Web Speech API if available
      if ('speechSynthesis' in window && !isPartOfQueue) {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'en-US';
          utterance.rate = 0.9;
          
          utterance.onend = () => {
            if (audioUrlRef.current) {
              window.URL.revokeObjectURL(audioUrlRef.current);
              audioUrlRef.current = null;
            }
            setIsPlaying(false);
            setCurrentPlayingAudio(null);
          };
          
          utterance.onerror = () => {
            if (audioUrlRef.current) {
              window.URL.revokeObjectURL(audioUrlRef.current);
              audioUrlRef.current = null;
            }
            setIsPlaying(false);
            setCurrentPlayingAudio(null);
          };
          
          speechSynthesis.speak(utterance);
          setIsPlaying(true);
          setCurrentPlayingAudio(messageId);
          
        } catch (webSpeechError) {
          console.error("Web Speech API failed:", webSpeechError);
        }
      }
    } finally {
      setAudioLoading(false);
    }
  };
  
  // Play the entire conversation from start to finish
  const playAllConversation = async () => {
    // If already playing all, stop it
    if (isPlayingAllRef.current) {
      stopAllConversation();
      return;
    }
    
    // Build conversation queue
    const sentences = task.sentences || [];
    const conversations = sentences.map((sentence, index) => ({
      id: index + 1,
      messageId: `message-${index}`,
      message: sentence.text,
      index: index
    }));
    
    if (conversations.length === 0) {
      console.log("No conversations to play");
      return;
    }
    
    // Set up queue and start playing
    conversationQueueRef.current = conversations;
    isPlayingAllRef.current = true;
    setIsPlayingAll(true);
    currentIndexRef.current = 0;
    setCurrentConversationIndex(0);
    setProgress({ current: 1, total: conversations.length });
    
    // Play the first message
    const firstMessage = conversations[0];
    setCurrentPlayingAudio(firstMessage.messageId);
    await playAudioFromServer(firstMessage.message, firstMessage.messageId, true);
  };
  
  // Play next message in the queue
  const playNextInQueue = async () => {
    if (!isPlayingAllRef.current || conversationQueueRef.current.length === 0) {
      return;
    }
    
    const nextIndex = currentIndexRef.current + 1;
    
    if (nextIndex < conversationQueueRef.current.length) {
      currentIndexRef.current = nextIndex;
      const nextMessage = conversationQueueRef.current[nextIndex];
      
      // Update UI
      setCurrentConversationIndex(nextIndex);
      setCurrentPlayingAudio(nextMessage.messageId);
      setProgress({ current: nextIndex + 1, total: conversationQueueRef.current.length });
      
      // Play the next message
      await playAudioFromServer(nextMessage.message, nextMessage.messageId, true);
    } else {
      // Reached the end of conversation
      console.log("Finished playing all conversations");
      stopAllConversation();
    }
  };
  
  // Get audio button state for a specific message
  const getAudioButtonState = (messageId) => {
    const isCurrentAudio = currentPlayingAudio === messageId;
    const isCurrentInQueue = isPlayingAll && currentConversationIndex === conversations.findIndex(c => c.messageId === messageId);
    
    return {
      isPlaying: isCurrentAudio && isPlaying,
      isLoading: audioLoading && isCurrentAudio,
      isPaused: isCurrentAudio && !isPlaying && audioRef.current,
      isInQueue: isCurrentInQueue
    };
  };
  
  // Get conversation data
  const getConversations = () => {
    const sentences = task.sentences || [];
    return sentences.map((sentence, index) => {
      const isManager = index % 2 === 0;
      return {
        id: index + 1,
        messageId: `message-${index}`,
        name: isManager ? 'Manager' : 'Employee',
        role: isManager ? 'Manager' : 'Employee',
        avatarType: isManager ? 'manager' : 'employee',
        message: sentence.text,
        time: index === 0 ? '3 min ago' : 'Just now',
        // timestamp: index === 0 ? '3 min ago' : null,
        letter: sentence.letter,
        sentence_id: sentence.sentence_id,
        index: index
      };
    });
  };
  
  if (!task) {
    return (
      <div className="conversations-container">
        <div className="conversations-card">
          <div className="conversations-header">
            <div className="header-left">
              <div className="header-icon">
                <svg className="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h1 className="header-title">
                Conversations {level ? `- ${level.charAt(0).toUpperCase() + level.slice(1)} Level` : ''}
              </h1>
            </div>
            <div className="header-actions">
              <ArrowLeft 
                className="header-action-icon back-action-icon"
                onClick={onBack}
                style={{ cursor: 'pointer' }}
              />
              <Home className="header-action-icon" />
              <Bell className="header-action-icon" />
              <ChevronDown className="header-action-icon" />
            </div>
          </div>
          
          <div style={{ padding: "40px", textAlign: "center" }}>
            <h2>No Task Selected</h2>
            <button onClick={onBack} style={{ marginTop: "20px", padding: "10px 20px" }}>
              Back to Tasks
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const conversations = getConversations();
  
  // Question data
  const questionData = {
    question: 'What does the word "avoid" mean in the context of the conversation?',
    options: [
      { id: 'set', label: 'set' },
      { id: 'delay', label: 'delay' },
      { id: 'prevent', label: 'prevent' }
    ],
    hint: 'Think about spending time focusing on the initial planning phase.',
    correctAnswer: 'prevent'
  };
  
  const handleAnswerSelect = (optionId) => {
    setSelectedAnswer(optionId);
    console.log('Selected answer:', optionId);
  };
  
  const handleSubmit = () => {
    if (selectedAnswer) {
      if (selectedAnswer === questionData.correctAnswer) {
        alert('Correct! Well done!');
      } else {
        alert('Incorrect. Try again!');
      }
    } else {
      alert('Please select an answer first.');
    }
  };
  
  const handleSkip = () => {
    console.log('Question skipped');
    alert('Question skipped!');
  };
  
  const toggleHint = () => {
    setShowHint(!showHint);
  };
  
  const renderAvatar = (avatarType) => {
    if (avatarType === 'manager') {
      return (
        <div className="avatar avatar-manager">
          <Briefcase size={20} />
        </div>
      );
    } else {
      return (
        <div className="avatar avatar-employee">
          <User size={20} />
        </div>
      );
    }
  };
  
  return (
    <div className="conversations-container">
      <div className="conversations-card">
        {/* Header with Play All Button */}
        <div className="conversations-header">
          <div className="header-left">
            <ArrowLeft 
              className="header-action-icon back-action-icon"
              onClick={onBack}
              style={{ cursor: 'pointer' }}
            />
            <div className="header-icon">
              <svg className="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h1 className="header-title">
              {task.title}
              {isPlayingAll && (
                <span className="conversation-progress">
                  (Playing: {progress.current}/{progress.total})
                </span>
              )}
            </h1>
          </div>
          
          <div className="header-actions">
            {/* Play All Conversations Button */}
            <button 
              className={`play-all-btn ${isPlayingAll ? 'playing' : ''}`}
              onClick={playAllConversation}
              title={isPlayingAll ? "Stop conversation playback" : "Play entire conversation"}
            >
              <Headphones size={20} />
              <span>{isPlayingAll ? 'Stop Conversation' : 'Play Conversation'}</span>
              {isPlayingAll && (
                <span className="play-all-progress">
                  {progress.current}/{progress.total}
                </span>
              )}
            </button>
            
            <Home className="header-action-icon" />
            <Bell className="header-action-icon" />
            <ChevronDown className="header-action-icon" />
          </div>
        </div>
        
        {/* Conversations List with Question */}
        <div className="conversations-list">
          {/* Conversation Messages */}
          {conversations.map((conv, index) => {
            const audioState = getAudioButtonState(conv.messageId);
            const isCurrentInQueue = isPlayingAll && currentConversationIndex === index;
            
            return (
              <div
                key={conv.id}
                className={`conversation-item ${index % 2 === 0 ? 'conversation-blue' : 'conversation-purple'} ${isCurrentInQueue ? 'current-playing' : ''}`}
              >
                <div className="conversation-avatar">
                  {renderAvatar(conv.avatarType)}
                </div>
                <div className="conversation-content">
                  <div className="conversation-header-row">
                    <div className="conversation-user-info">
                      <span className="conversation-name">{conv.name}</span>
                      <span className={`conversation-role ${conv.role === 'Manager' ? 'role-manager' : 'role-employee'}`}>
                        {conv.role}
                      </span>
                    </div>
                    <span className="conversation-time">{conv.time}</span>
                  </div>
                  <div className="conversation-message-row">
                    <p className="conversation-message">
                      {conv.message}
                      {isCurrentInQueue && isPlayingAll && (
                        <span className="now-playing-indicator"> 🔊 Now playing...</span>
                      )}
                    </p>
                    <button 
                      className={`audio-icon-btn ${audioState.isPlaying ? 'audio-playing' : audioState.isPaused ? 'audio-paused' : ''} ${isPlayingAll ? 'disabled' : ''}`}
                      onClick={() => playSingleMessage(conv.message, conv.messageId)}
                      disabled={audioState.isLoading || isPlayingAll}
                      title={isPlayingAll ? "Cannot play individual while conversation is playing" : 
                             audioState.isPlaying ? "Pause audio" : 
                             audioState.isPaused ? "Resume audio" : 
                             "Play audio"}
                    >
                      {audioState.isLoading ? (
                        <span className="audio-loading-spinner"></span>
                      ) : audioState.isPlaying ? (
                        <Pause size={18} />
                      ) : audioState.isPaused ? (
                        <Play size={18} />
                      ) : (
                        <Volume2 size={18} />
                      )}
                    </button>
                  </div>
                  {conv.timestamp && (
                    <div className="conversation-timestamp">
                      <svg className="timestamp-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{conv.timestamp}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Question Section - Compact */}
          <div className="question-section">
            <p className="question-text">{questionData.question}</p>
            
            <div className="question-options">
              {questionData.options.map((option) => (
                <label
                  key={option.id}
                  className={`option-label ${selectedAnswer === option.id ? 'option-selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={option.id}
                    checked={selectedAnswer === option.id}
                    onChange={() => handleAnswerSelect(option.id)}
                    className="option-radio"
                  />
                  <span className="option-text">{option.label}</span>
                </label>
              ))}
            </div>
            
            {/* Hint Button and Content - Inline */}
            <div className="question-footer">
              <div className="hint-wrapper">
                <button className="btn-hint" onClick={toggleHint}>
                  <Lightbulb size={16} />
                  <span>Hint</span>
                </button>
                
                {showHint && (
                  <div className="question-hint-inline">
                    <span className="hint-text">{questionData.hint}</span>
                    <button 
                      className="hint-audio-btn"
                      onClick={() => playSingleMessage(questionData.hint, 'hint-audio')}
                      title="Play hint audio"
                    >
                      <Volume2 size={12} />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="question-actions">
                <button className="btn-skip" onClick={handleSkip}>
                  Skip
                </button>
                <button className="btn-submit" onClick={handleSubmit}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}