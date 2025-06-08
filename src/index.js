// Modules
import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { parse, d3ize } from 'gedcom-d3';

// Components
import Load from './Load';
import Controls from './Controls';
import Graph from './Graph';

// Style
import './sass/style.scss';

// GEDOM files
import halflingFile from './gedcoms/halfling.ged';
import kennedyFile from './gedcoms/kennedy.ged';
import shakespeareFile from './gedcoms/shakespeare.ged';
import tudorFile from './gedcoms/tudors.ged';
import plunkettFile from './gedcoms/plunkett_ancestry.ged';
import kardashianFile from './gedcoms/kardashian.ged';
import bachFile from './gedcoms/bach.ged';
import potterFile from './gedcoms/potter.ged';
import royalFile from './gedcoms/royal-family.ged';
import tolkienFile from './gedcoms/tolkien.ged';
import washingtonFile from './gedcoms/washington.ged';
import grekGodsFile from './gedcoms/greek-gods.ged';
import romanGodsFile from './gedcoms/roman-gods.ged';


const App = () => {

  console.log("rendering app");

  const [showingRoots, setShowingRoots] = useState(false);
  const [d3Data, setD3Data] = useState([]);
  const [showError, setShowError] = useState(false);
  const [highlightedFamily, setHighlightedFamily] = useState();
  const [showingLegend, setShowingLegend] = useState(false);
  const [showingSurnames, setShowingSurnames] = useState(false);
  const [highlights, setHighlights] = useState({ node: null, family: [], links: [] });
  
  // Load saved settings from localStorage
  const loadSavedSettings = () => {
    try {
      const saved = localStorage.getItem('bloodLinesSettings');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.warn('Failed to load saved settings:', error);
      return {};
    }
  };

  const savedSettings = loadSavedSettings();
  
  const [colorTheme, setColorTheme] = useState(savedSettings.colorTheme || 'dark');
  const [customLoveLineColor, setCustomLoveLineColor] = useState(savedSettings.customLoveLineColor || null);
  const [customBloodLineColor, setCustomBloodLineColor] = useState(savedSettings.customBloodLineColor || null);
  const [loveLineWeight, setLoveLineWeight] = useState(savedSettings.loveLineWeight || 1.5);
  const [bloodLineWeight, setBloodLineWeight] = useState(savedSettings.bloodLineWeight || 1.5);
  const [loveLineType, setLoveLineType] = useState(savedSettings.loveLineType || 'solid');
  const [bloodLineType, setBloodLineType] = useState(savedSettings.bloodLineType || 'solid');
  const [loveLineOpacity, setLoveLineOpacity] = useState(savedSettings.loveLineOpacity || 0.8);
  const [bloodLineOpacity, setBloodLineOpacity] = useState(savedSettings.bloodLineOpacity || 0.8);
  
  const isMobile = window.innerWidth < 769;

  // Save settings to localStorage whenever they change
  const saveSettings = useCallback(() => {
    const settings = {
      colorTheme,
      customLoveLineColor,
      customBloodLineColor,
      loveLineWeight,
      bloodLineWeight,
      loveLineType,
      bloodLineType,
      loveLineOpacity,
      bloodLineOpacity
    };
    try {
      localStorage.setItem('bloodLinesSettings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save settings:', error);
    }
  }, [colorTheme, customLoveLineColor, customBloodLineColor, loveLineWeight, bloodLineWeight, loveLineType, bloodLineType, loveLineOpacity, bloodLineOpacity]);

  // Save settings whenever they change
  useEffect(() => {
    saveSettings();
  }, [saveSettings]);

  // Clear highlights
  const clearHighlights = () => {
    setHighlights({ node: null, family: [], links: [] });
    setHighlightedFamily(null);
    setShowingLegend(false);
    setShowingSurnames(false);
  }

  const readFile = file => {
    setD3Data(d3ize(parse(file)));  // Parse data
    setShowingRoots(true);
    setShowError(false);
  }

  const closeRoots = () => {
    clearHighlights();
    setShowingRoots(false);
    setD3Data([]);
  }

  const handleUpload = event => {
    const file = event.target.files[0];
    const parts = file.name.split('.');
    const reader = new FileReader();

    if (parts[parts.length - 1].toLowerCase() === 'ged') {
      reader.onloadend = () => {
        readFile(reader.result);
      }
      reader.readAsText(file);
    } else {
      reader.readAsText(file);
      setShowError(true);
    }
  }

  return(
    <>
      {!showingRoots ?
        <Load
          handleUpload={handleUpload}
          loadHalfling={() => readFile(halflingFile)}
          loadKennedy={() => readFile(kennedyFile)}
          loadShakespeare={() => readFile(shakespeareFile)}
          loadTudor={() => readFile(tudorFile)}
          loadPlunkett={() => readFile(plunkettFile)}
          loadKardashian={() => readFile(kardashianFile)}
          loadBach={() => readFile(bachFile)}
          loadPotter={() => readFile(potterFile)}
          loadRoyal={() => readFile(royalFile)}
          loadTolkien={() => readFile(tolkienFile)}
          loadWashington={() => readFile(washingtonFile)}
          loadGreekGods={() => readFile(grekGodsFile)}
          loadRomanGods={() => readFile(romanGodsFile)}
          showError={showError}
        /> :
        <>
          <Controls
            d3Data={d3Data}
            closeRoots={closeRoots}
            highlights={highlights}
            highlightedFamily={highlightedFamily}
            setHighlightedFamily={setHighlightedFamily}
            showingLegend={showingLegend}
            setShowingLegend={setShowingLegend}
            showingSurnames={showingSurnames}
            setShowingSurnames={setShowingSurnames}
            colorTheme={colorTheme}
            setColorTheme={setColorTheme}
            customLoveLineColor={customLoveLineColor}
            setCustomLoveLineColor={setCustomLoveLineColor}
            customBloodLineColor={customBloodLineColor}
            setCustomBloodLineColor={setCustomBloodLineColor}
            loveLineWeight={loveLineWeight}
            setLoveLineWeight={setLoveLineWeight}
            bloodLineWeight={bloodLineWeight}
            setBloodLineWeight={setBloodLineWeight}
            loveLineType={loveLineType}
            setLoveLineType={setLoveLineType}
            bloodLineType={bloodLineType}
            setBloodLineType={setBloodLineType}
            loveLineOpacity={loveLineOpacity}
            setLoveLineOpacity={setLoveLineOpacity}
            bloodLineOpacity={bloodLineOpacity}
            setBloodLineOpacity={setBloodLineOpacity}
            isMobile={isMobile}
            clearHighlights={clearHighlights}
          />
          <Graph
            d3Data={d3Data}
            highlights={highlights}
            setHighlights={setHighlights}
            highlightedFamily={highlightedFamily}
            setHighlightedFamily={setHighlightedFamily}
            showingLegend={showingLegend}
            setShowingLegend={setShowingLegend}
            showingSurnames={showingSurnames}
            setShowingSurnames={setShowingSurnames}
            colorTheme={colorTheme}
            customLoveLineColor={customLoveLineColor}
            customBloodLineColor={customBloodLineColor}
            loveLineWeight={loveLineWeight}
            bloodLineWeight={bloodLineWeight}
            loveLineType={loveLineType}
            bloodLineType={bloodLineType}
            loveLineOpacity={loveLineOpacity}
            bloodLineOpacity={bloodLineOpacity}
            isMobile={isMobile}
            clearHighlights={clearHighlights}
          />
        </>
      }
    </>
  )
}

ReactDOM.render(<App />, document.getElementById('root'));
