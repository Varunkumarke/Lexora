import React, { useState } from "react";
import "./UserManual.css";

export default function UserManual({ onClose }) {
  const [activeSection, setActiveSection] = useState("quickstart");

  const sections = {
    quickstart: {
      title: "Quick Start Guide",
      content: `
        <h3>Get Started in 5 Minutes</h3>
        <ol>
          <li><strong>Login</strong> with your credentials</li>
          <li><strong>Choose a Category</strong> (Vocabulary, Sentences, etc.)</li>
          <li><strong>Select Difficulty Level</strong> (Start with Easy)</li>
          <li><strong>Pick a Task</strong> from the available exercises</li>
          <li><strong>Combine Sentences</strong> using logical relations</li>
          <li><strong>Generate & Evaluate</strong> your text</li>
        </ol>
        
        <div class="tip-box">
          <strong>💡 Tip:</strong> Start with simple relations like "and", "but", or "because"
        </div>
      `
    },
    categories: {
      title: "Learning Categories",
      content: `
        <h3>Four Learning Paths</h3>
        
        <div class="category-card">
          <div class="category-icon">📚</div>
          <div>
            <h4>Vocabulary</h4>
            <p>Learn new words and their usage in context</p>
          </div>
        </div>
        
        <div class="category-card">
          <div class="category-icon">🧠</div>
          <div>
            <h4>conversation</h4>
            <p>Test your reading comprehension and analysis skills</p>
          </div>
        </div>
        
        <div class="category-card">
          <div class="category-icon">📝</div>
          <div>
            <h4>Sentence Composition</h4>
            <p>Work with longer text-based exercises</p>
          </div>
        </div>
        
        <div class="category-card">
          <div class="category-icon">💬</div>
          <div>
            <h4>Text Composition</h4>
            <p>Practice sentence construction and logical connections</p>
          </div>
        </div>
      `
    },
    relations: {
      title: "Sentence Relations Guide",
      content: `
        <h3>26 Logical Relations Explained</h3>
        
        <div class="relations-grid">
          <div class="relation-group">
            <h4>🔄 Additive Relations</h4>
            <ul>
              <li><strong>and</strong> - Connects similar ideas</li>
              <li><strong>as well as</strong> - Additional information</li>
              <li><strong>besides</strong> - Adds supporting points</li>
              <li><strong>in addition</strong> - Extra information</li>
              <li><strong>along with</strong> - Companion ideas</li>
              <li><strong>not only..but also</strong> - Emphasizes both</li>
            </ul>
          </div>
          
          <div class="relation-group">
            <h4>⚡ Causal Relations</h4>
            <ul>
              <li><strong>because</strong> - Shows reason</li>
              <li><strong>because of</strong> - Reason with noun phrase</li>
              <li><strong>due to</strong> - Formal cause</li>
              <li><strong>thus</strong> - Therefore/conclusion</li>
              <li><strong>that's why</strong> - Informal result</li>
              <li><strong>as a result</strong> - Consequence</li>
            </ul>
          </div>
          
          <div class="relation-group">
            <h4>⚖️ Contrast Relations</h4>
            <ul>
              <li><strong>but</strong> - Simple contrast</li>
              <li><strong>although</strong> - Unexpected contrast</li>
              <li><strong>even though</strong> - Strong contrast</li>
              <li><strong>despite</strong> - Contrast with noun</li>
              <li><strong>however</strong> - Formal contrast</li>
            </ul>
          </div>
          
          <div class="relation-group">
            <h4>⏰ Temporal Relations</h4>
            <ul>
              <li><strong>then</strong> - Sequence</li>
              <li><strong>after</strong> - Following event</li>
              <li><strong>before</strong> - Preceding event</li>
              <li><strong>if then</strong> - Conditional sequence</li>
              <li><strong>otherwise</strong> - Alternative outcome</li>
            </ul>
          </div>
        </div>
        
        <div class="example-box">
          <h4>Example Combination:</h4>
          <p><em>"I studied hard"</em> + <strong>because</strong> + <em>"I wanted to pass"</em><br/>
          → <strong>"I studied hard because I wanted to pass."</strong></p>
        </div>
      `
    },
    workflow: {
      title: "Step-by-Step Workflow",
      content: `
        <h3>How to Complete an Exercise</h3>
        
        <div class="step-card">
          <div class="step-number">1</div>
          <div>
            <h4>Select Sentences</h4>
            <p>Click on <strong>exactly 2 sentences</strong> from the list</p>
            <small>They will highlight when selected</small>
          </div>
        </div>
        
        <div class="step-card">
          <div class="step-number">2</div>
          <div>
            <h4>Choose a Relation</h4>
            <p>Pick a logical connection from the dropdown (26 options)</p>
            <small>Use the tooltip to understand each relation</small>
          </div>
        </div>
        
        <div class="step-card">
          <div class="step-number">3</div>
          <div>
            <h4>Combine</h4>
            <p>Click "Combine Sentences" to create a new sentence</p>
            <small>Your new sentence appears in the Combined list</small>
          </div>
        </div>
        
        <div class="step-card">
          <div class="step-number">4</div>
          <div>
            <h4>Build Final Text</h4>
            <p>Click "+" to add sentences to your final text</p>
            <small>Arrange them in logical order</small>
          </div>
        </div>
        
        <div class="step-card">
          <div class="step-number">5</div>
          <div>
            <h4>Generate & Evaluate</h4>
            <p>Click "Generate" to create paragraph, then "Evaluate" for AI feedback</p>
            <small>Aim for 8+ score out of 10</small>
          </div>
        </div>
      `
    },
    scoring: {
      title: "Scoring System",
      content: `
        <h3>How You're Evaluated</h3>
        
        <div class="score-card excellent">
          <div class="score-header">
            <span class="score-range">9-10/10</span>
            <span class="score-label">EXCELLENT</span>
          </div>
          <p>Perfect or near-perfect logical connections</p>
        </div>
        
        <div class="score-card good">
          <div class="score-header">
            <span class="score-range">7-8/10</span>
            <span class="score-label">GOOD</span>
          </div>
          <p>Minor relation mismatches but good structure</p>
        </div>
        
        <div class="score-card average">
          <div class="score-header">
            <span class="score-range">5-6/10</span>
            <span class="score-label">AVERAGE</span>
          </div>
          <p>Understands concepts but needs practice</p>
        </div>
        
        <div class="score-card needs-work">
          <div class="score-header">
            <span class="score-range">0-4/10</span>
            <span class="score-label">NEEDS PRACTICE</span>
          </div>
          <p>Review relation types and try again</p>
        </div>
        
        <div class="tip-box">
          <strong>📈 Progress Tip:</strong> Your scores are not saved permanently unless you click "Save"
        </div>
      `
    },
    faq: {
      title: "FAQ & Troubleshooting",
      content: `
        <h3>Frequently Asked Questions</h3>
        
        <div class="faq-item">
          <h4>❓ Why can I only select 2 sentences?</h4>
          <p>This is by design. You combine sentences in pairs to focus on individual logical relationships. After combining, you can use the combined sentence with another one.</p>
        </div>
        
        <div class="faq-item">
          <h4>❓ How do I change the order of sentences?</h4>
          <p>In the Final Text section, use the up/down arrows or enter order numbers (1, 2, 3...) then click "Apply Order".</p>
        </div>
        
        <div class="faq-item">
          <h4>❓ What if I make a mistake?</h4>
          <p>You can remove any combined sentence using the trash icon, or clear selections and start over.</p>
        </div>
        
        <div class="faq-item">
          <h4>❓ Why is my score low?</h4>
          <p>Check the evaluation feedback. Common issues: wrong relation type, illogical connection, or grammar errors in combination.</p>
        </div>
        
        <div class="faq-item">
          <h4>❓ Can I save my progress?</h4>
          <p>Yes! Use the "Save" button in the Final Text section. This saves your combined sentences and structure.</p>
        </div>
        
        <div class="faq-item">
          <h4>❓ No tasks are loading. What should I do?</h4>
          <p>1. Check your internet connection<br/>
             2. Try a different category or level<br/>
             3. Contact support if problem persists</p>
        </div>
      `
    }
  };

  return (
    <div className="user-manual-overlay">
      <div className="user-manual-container">
        {/* Header */}
        <div className="manual-header">
          <div className="header-left">
            <h1 className="manual-title">
              <span className="title-icon">📘</span>
              lexora User Manual
            </h1>
            <p className="manual-subtitle">Your guide to mastering sentence construction</p>
          </div>
          <button className="close-manual-btn" onClick={onClose}>
            ✕ Close
          </button>
        </div>

        <div className="manual-content">
          {/* Sidebar Navigation */}
          <div className="manual-sidebar">
            <div className="sidebar-header">
              <h3>Contents</h3>
            </div>
            <nav className="sidebar-nav">
              {Object.keys(sections).map((key) => (
                <button
                  key={key}
                  className={`nav-item ${activeSection === key ? 'active' : ''}`}
                  onClick={() => setActiveSection(key)}
                >
                  <span className="nav-icon">
                    {key === 'quickstart' && '🚀'}
                    {key === 'categories' && '📚'}
                    {key === 'relations' && '🔗'}
                    {key === 'workflow' && '📋'}
                    {key === 'scoring' && '⭐'}
                    {key === 'faq' && '❓'}
                  </span>
                  {sections[key].title}
                </button>
              ))}
            </nav>
            
            <div className="sidebar-footer">
              <div className="support-box">
                <h4>Need Help?</h4>
                <p>Contact: support@learnsphere.com</p>
                <button className="print-btn" onClick={() => window.print()}>
                  🖨️ Print Manual
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="manual-main">
            <div className="section-header">
              <h2>{sections[activeSection].title}</h2>
              <div className="breadcrumb">
                <span>lexora Manual</span> / <span>{sections[activeSection].title}</span>
              </div>
            </div>
            
            <div 
              className="section-content"
              dangerouslySetInnerHTML={{ __html: sections[activeSection].content }}
            />
            
            <div className="section-footer">
              <div className="nav-buttons">
                {activeSection !== 'quickstart' && (
                  <button 
                    className="prev-btn"
                    onClick={() => {
                      const keys = Object.keys(sections);
                      const currentIndex = keys.indexOf(activeSection);
                      if (currentIndex > 0) setActiveSection(keys[currentIndex - 1]);
                    }}
                  >
                    ← Previous
                  </button>
                )}
                
                {activeSection !== 'faq' && (
                  <button 
                    className="next-btn"
                    onClick={() => {
                      const keys = Object.keys(sections);
                      const currentIndex = keys.indexOf(activeSection);
                      if (currentIndex < keys.length - 1) setActiveSection(keys[currentIndex + 1]);
                    }}
                  >
                    Next →
                  </button>
                )}
              </div>
              
              <div className="quick-actions">
                <button className="action-btn" onClick={() => setActiveSection('quickstart')}>
                  🚀 Quick Start
                </button>
                <button className="action-btn" onClick={() => setActiveSection('faq')}>
                  ❓ FAQ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

