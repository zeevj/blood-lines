import React, {useState} from "react";

import greyLine from './img/grey-line.png';
import goldLine from './img/gold-line.png';

const Controls = ({ d3Data, closeRoots, highlights, highlightedFamily, setHighlightedFamily, showingLegend, setShowingLegend, showingSurnames, setShowingSurnames, colorTheme, setColorTheme, customLoveLineColor, setCustomLoveLineColor, customBloodLineColor, setCustomBloodLineColor, loveLineWeight, setLoveLineWeight, bloodLineWeight, setBloodLineWeight, loveLineType, setLoveLineType, bloodLineType, setBloodLineType, loveLineOpacity, setLoveLineOpacity, bloodLineOpacity, setBloodLineOpacity, isMobile }) => {

  console.log('Controls component props:', { colorTheme, setColorTheme }); // Debug log

  const [showingColorThemes, setShowingColorThemes] = useState(false);
  const [showingLineColors, setShowingLineColors] = useState(false);

  const toggleLegend = () => {
    setShowingLegend(prevState => !prevState);
    setShowingSurnames(false);
    setShowingColorThemes(false);
    setShowingLineColors(false);
  }

  const toggleSurnames = () => {
    setShowingSurnames(prevState => !prevState);
    setShowingLegend(false);
    setShowingColorThemes(false);
    setShowingLineColors(false);
  }

  const toggleColorThemes = () => {
    setShowingColorThemes(prevState => !prevState);
    setShowingLegend(false);
    setShowingSurnames(false);
    setShowingLineColors(false);
  }

  const toggleLineColors = () => {
    setShowingLineColors(prevState => !prevState);
    setShowingLegend(false);
    setShowingSurnames(false);
    setShowingColorThemes(false);
  }

  const colorThemes = [
    { id: 'dark', name: 'Dark Space', bg: '#010000', accent: '#fc6767' },
    { id: 'light', name: 'Light Sky', bg: '#f0f8ff', accent: '#2c5aa0' },
    { id: 'forest', name: 'Forest', bg: '#0d1f0d', accent: '#4a7c59' },
    { id: 'sunset', name: 'Sunset', bg: '#1a0d0d', accent: '#ff6b35' },
    { id: 'ocean', name: 'Ocean', bg: '#0a1628', accent: '#20b2aa' },
    { id: 'purple', name: 'Purple Haze', bg: '#1a0d1a', accent: '#9370db' }
  ];

  function compareSurname( a, b ) {
    if ( a.surname < b.surname ){
      return -1;
    }
    if ( a.surname > b.surname ){
      return 1;
    }
    return 0;
  }

  function compareCount( a, b ) {
    if ( a.count < b.count ){
      return 1;
    }
    if ( a.count > b.count ){
      return -1;
    }
    return 0;
  }

  const surnameList = d3Data.surnameList.filter(name => name.surname !== "").sort(compareSurname).sort(compareCount).map((family, index) =>
    <p 
      key={index}
      style={{color: !highlightedFamily ? family.color : highlightedFamily === family.surname ? family.color : '#ccc', cursor: 'pointer'}}
      onClick={e => highlightedFamily === family.surname ? setHighlightedFamily() : setHighlightedFamily(family.surname) }>
      {family.surname} ({family.count})
    </p>
  );

  const nodeInfoInsert = (node) => {      

    // Gender
    const labelGender = (node.gender === 'M') ? `♂` : `♀`;

    return (
      <div id="node-info--content">
        {node.title ? <h4 className="node-title"><span style={{color:node.color}}>{node.name} ({node.title})</span> {labelGender}</h4> :
          <h4><span style={{color:node.color}}>{node.name}</span> {labelGender}</h4>}
        <p><b>{node.yob} - {node.yod}</b></p>
        {node.pob != '' && <p><b>From:</b> {node.pob}</p>}
        {node.pod != '' && <p><b>Died:</b> {node.pod}</p>}
        {node.bio && <p>{node.bio}</p>}
      </div>
    );    
  }
  

  return (
    <div id='controls'>
      <div id="back-button" onClick={closeRoots}>
        <i className="fa fa-times" aria-hidden="true"></i>
      </div>

      <div id="legend">
        {showingLegend &&
          <div id="legend-content">
            <p className='control-title'>controls</p>
            {isMobile ?
              <>
                <p>tap on name: person info</p>
                <p>pinch: zoom</p>
                <p>swipe: rotate</p>
                <p>two-finger swipe: pan</p>
              </>
              :
              <>
                <p>click on name: person info</p>
                <p>scroll: zoom</p>
                <p>left-click drag: rotate</p>
                <p>right-click drag: pan</p>
              </>
            }

            <br/>
            
            <p className='control-title'>legend</p>
            <div className="legend-line">
              <img src={greyLine} />
              <p>- blood line</p>
            </div>
            <div className="legend-line">
              <img src={goldLine} />
              <p>- love line</p>
            </div>
          </div>
        }
        <p id="legend-button" className={showingLegend ? 'active' : ''} onClick={toggleLegend}>{'info'}</p>
      </div>

      <div id="node-info">
        {!!highlights.node && nodeInfoInsert(highlights.node)}
      </div>

      <div id="color-themes">
        {showingColorThemes &&
          <div className="color-themes-content">
            <p className='control-title'>themes</p>
            {colorThemes.map(theme => (
              <div 
                key={theme.id} 
                className={`theme-option ${colorTheme === theme.id ? 'active' : ''}`}
                onClick={() => setColorTheme(theme.id)}
              >
                <div 
                  className="theme-preview" 
                  style={{ backgroundColor: theme.bg, borderColor: theme.accent }}
                ></div>
                <p>{theme.name}</p>
              </div>
            ))}
          </div>
        }
        <p id="color-themes-button" className={showingColorThemes ? 'active' : ''} onClick={toggleColorThemes}>{'theme'}</p>
      </div>

      <div id="line-colors">
        {showingLineColors &&
          <div className="line-colors-content">
            <p className='control-title'>line controls</p>
            
            <div className="line-section">
              <h4>Love Lines</h4>
              
              <div className="color-control">
                <label>Color:</label>
                <div className="color-inputs">
                  <input 
                    type="color" 
                    value={customLoveLineColor || '#ffd700'} 
                    onChange={(e) => setCustomLoveLineColor(e.target.value)}
                  />
                  <button 
                    className="reset-color-btn"
                    onClick={() => setCustomLoveLineColor(null)}
                    title="Reset to theme default"
                  >
                    ↻
                  </button>
                </div>
              </div>
              
              <div className="range-control">
                <label>Color Opacity: {Math.round(loveLineOpacity * 100)}%</label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1" 
                  step="0.1"
                  value={loveLineOpacity} 
                  onChange={(e) => setLoveLineOpacity(parseFloat(e.target.value))}
                />
              </div>
              
              <div className="range-control">
                <label>Weight: {loveLineWeight}px</label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="10" 
                  step="0.1"
                  value={loveLineWeight} 
                  onChange={(e) => setLoveLineWeight(parseFloat(e.target.value))}
                />
              </div>
              
              <div className="select-control">
                <label>Type:</label>
                <select 
                  value={loveLineType} 
                  onChange={(e) => setLoveLineType(e.target.value)}
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
              </div>
            </div>
            
            <div className="line-section">
              <h4>Blood Lines</h4>
              
              <div className="color-control">
                <label>Color:</label>
                <div className="color-inputs">
                  <input 
                    type="color" 
                    value={customBloodLineColor || '#fc6767'} 
                    onChange={(e) => setCustomBloodLineColor(e.target.value)}
                  />
                  <button 
                    className="reset-color-btn"
                    onClick={() => setCustomBloodLineColor(null)}
                    title="Reset to theme default"
                  >
                    ↻
                  </button>
                </div>
              </div>
              
              <div className="range-control">
                <label>Color Opacity: {Math.round(bloodLineOpacity * 100)}%</label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1" 
                  step="0.1"
                  value={bloodLineOpacity} 
                  onChange={(e) => setBloodLineOpacity(parseFloat(e.target.value))}
                />
              </div>
              
              <div className="range-control">
                <label>Weight: {bloodLineWeight}px</label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="10" 
                  step="0.1"
                  value={bloodLineWeight} 
                  onChange={(e) => setBloodLineWeight(parseFloat(e.target.value))}
                />
              </div>
              
              <div className="select-control">
                <label>Type:</label>
                <select 
                  value={bloodLineType} 
                  onChange={(e) => setBloodLineType(e.target.value)}
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
              </div>
            </div>
            
            <div className="reset-all-section">
              <button 
                className="reset-all-btn"
                onClick={() => {
                  setCustomLoveLineColor(null);
                  setCustomBloodLineColor(null);
                  setLoveLineWeight(1.5);
                  setBloodLineWeight(1.5);
                  setLoveLineType('solid');
                  setBloodLineType('solid');
                  setLoveLineOpacity(0.8);
                  setBloodLineOpacity(0.8);
                }}
              >
                Reset All Line Settings
              </button>
            </div>
          </div>
        }
        <p id="line-colors-button" className={showingLineColors ? 'active' : ''} onClick={toggleLineColors}>{'lines'}</p>
      </div>

      <div id="surnames">
        {showingSurnames &&
          <div className="surnames-content">
            {surnameList}
          </div>
        }
        <p id="surnames-button" className={showingSurnames ? 'active' : ''} onClick={toggleSurnames}>{'names'}</p>
      </div>
    </div>
  )
}

export default Controls;
