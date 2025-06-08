// Modules
import React, { useState, useEffect, useRef, useCallback } from "react";
import ForceGraph3D from "react-force-graph-3d";
import * as THREE from "three";
import SpriteText from "three-spritetext";
import { forceCollide } from "d3-force-3d";
import Hammer from 'hammerjs';

const Graph = ({ d3Data, highlights, setHighlights, highlightedFamily, showingLegend, setShowingLegend, showingSurnames, setShowingSurnames, colorTheme, customLoveLineColor, customBloodLineColor, loveLineWeight, bloodLineWeight, loveLineType, bloodLineType, loveLineOpacity, bloodLineOpacity, isMobile, clearHighlights }) => {

  console.log(`d3Data`, d3Data);

  // STATE //
  const fgRef = useRef();

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const justPinchedRef = useRef(false);

  // COLOR THEMES //
  const colorThemes = {
    dark: {
      background: '#010000',
      accent: '#fc6767',
      linkNormal: 'rgba(252, 103, 103, 0.3)',
      linkRomantic: 'rgba(255, 215, 0, 0.5)',
      linkMuted: 'rgba(167, 98, 98, 0.15)',
      linkHighlighted: 'rgba(252, 103, 103, 0.6)',
      linkFamilyMuted: 'rgba(252, 103, 103, 0.15)',
      timeline: '#333333',
      timeLabel: '#f8f8f8',
      timeLabelSecondary: '#ccc'
    },
    light: {
      background: '#f0f8ff',
      accent: '#2c5aa0',
      linkNormal: 'rgba(44, 90, 160, 0.4)',
      linkRomantic: 'rgba(255, 140, 0, 0.6)',
      linkMuted: 'rgba(100, 100, 100, 0.2)',
      linkHighlighted: 'rgba(44, 90, 160, 0.7)',
      linkFamilyMuted: 'rgba(44, 90, 160, 0.2)',
      timeline: '#666666',
      timeLabel: '#333333',
      timeLabelSecondary: '#666666'
    },
    forest: {
      background: '#0d1f0d',
      accent: '#4a7c59',
      linkNormal: 'rgba(74, 124, 89, 0.4)',
      linkRomantic: 'rgba(255, 193, 7, 0.6)',
      linkMuted: 'rgba(74, 124, 89, 0.15)',
      linkHighlighted: 'rgba(74, 124, 89, 0.7)',
      linkFamilyMuted: 'rgba(74, 124, 89, 0.2)',
      timeline: '#4a7c59',
      timeLabel: '#a8d5ba',
      timeLabelSecondary: '#6b9080'
    },
    sunset: {
      background: '#1a0d0d',
      accent: '#ff6b35',
      linkNormal: 'rgba(255, 107, 53, 0.4)',
      linkRomantic: 'rgba(255, 215, 0, 0.6)',
      linkMuted: 'rgba(255, 107, 53, 0.15)',
      linkHighlighted: 'rgba(255, 107, 53, 0.7)',
      linkFamilyMuted: 'rgba(255, 107, 53, 0.2)',
      timeline: '#ff6b35',
      timeLabel: '#ffa07a',
      timeLabelSecondary: '#cd853f'
    },
    ocean: {
      background: '#0a1628',
      accent: '#20b2aa',
      linkNormal: 'rgba(32, 178, 170, 0.4)',
      linkRomantic: 'rgba(255, 215, 0, 0.6)',
      linkMuted: 'rgba(32, 178, 170, 0.15)',
      linkHighlighted: 'rgba(32, 178, 170, 0.7)',
      linkFamilyMuted: 'rgba(32, 178, 170, 0.2)',
      timeline: '#20b2aa',
      timeLabel: '#48d1cc',
      timeLabelSecondary: '#5f9ea0'
    },
    purple: {
      background: '#1a0d1a',
      accent: '#9370db',
      linkNormal: 'rgba(147, 112, 219, 0.4)',
      linkRomantic: 'rgba(255, 215, 0, 0.6)',
      linkMuted: 'rgba(147, 112, 219, 0.15)',
      linkHighlighted: 'rgba(147, 112, 219, 0.7)',
      linkFamilyMuted: 'rgba(147, 112, 219, 0.2)',
      timeline: '#9370db',
      timeLabel: '#dda0dd',
      timeLabelSecondary: '#ba55d3'
    }
  };

  const currentTheme = colorThemes[colorTheme] || colorThemes.dark;

  // DESIGN //

  const setNodeThreeObject = useCallback((node) => {
    // Use a sphere as a drag handle
    const obj = new THREE.Mesh(
      new THREE.SphereGeometry(25),
      // new THREE.MeshBasicMaterial({ color: node.color || 'skyblue' }),
      new THREE.MeshBasicMaterial({
        depthWrite: false,
        transparent: true,
        opacity: 0,
      })
    );

    // Add text sprite as child
    let name;
    if (node.firstName == "?") {
      name = node.name;
    } else {
      name = `${node.firstName} ${node.surname}`;
    }
    let sprite = new SpriteText(name);

    // Sprite defaults
    const coloredSprite = () => {
      sprite.color = node.color;
      sprite.backgroundColor = "#000c";
      sprite.borderColor = "#555";
    };

    const greyedSprite = () => {
      sprite.color = "#3335";
      sprite.backgroundColor = "#0002";
      sprite.borderColor = "#3333";
    };

    // NODE.COLOR
    // No highlighted node
    if (highlights.node === null) {
      if (highlightedFamily) {
        if (highlightedFamily === node.surname) {
          coloredSprite();
        } else {
          greyedSprite();
        }
      } else {
        coloredSprite();
      }
    } else {
      if (highlights.family.indexOf(node.id) !== -1) {
        coloredSprite();
      } else {
        greyedSprite();
      }
    }

    sprite.fontFace = "Helvetica";
    sprite.fontWeight = 600;
    sprite.textHeight = 10;
    sprite.borderWidth = .4;
    sprite.borderRadius = 8;
    sprite.padding = 4;
    obj.add(sprite);
    return obj;
  }, [highlights, highlightedFamily]);

  // Link color with opacity
  const getLinkColor = useCallback((link) => {
    const isRomanticLink = link.sourceType != "CHIL" && link.targetType != "CHIL";
    let baseColor;
    let opacity;
    
    if (highlights.links.length < 1) {
      if (highlightedFamily) {
        baseColor = currentTheme.linkFamilyMuted;
        opacity = 1;
      } else {
        if (isRomanticLink) {
          baseColor = customLoveLineColor || currentTheme.linkRomantic;
          opacity = loveLineOpacity;
        } else {
          baseColor = customBloodLineColor || currentTheme.linkNormal;
          opacity = bloodLineOpacity;
        }
      }
    } else {
      if (highlights.links.indexOf(link.index) !== -1) {
        if (isRomanticLink) {
          baseColor = customLoveLineColor || currentTheme.linkRomantic;
          opacity = loveLineOpacity;
        } else {
          baseColor = currentTheme.linkHighlighted;
          opacity = bloodLineOpacity;
        }
      } else {
        baseColor = currentTheme.linkMuted;
        opacity = 1;
      }
    }
    
    // Convert color to include opacity
    if (baseColor.startsWith('rgba')) {
      // Replace the alpha value in rgba
      return baseColor.replace(/[\d\.]+\)$/, `${opacity})`);
    } else if (baseColor.startsWith('rgb')) {
      // Convert rgb to rgba
      return baseColor.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
    } else if (baseColor.startsWith('#')) {
      // Convert hex to rgba
      const hex = baseColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    return baseColor;
  }, [highlights, highlightedFamily, currentTheme, customLoveLineColor, customBloodLineColor, loveLineOpacity, bloodLineOpacity]);

  // Link width
  const getLinkWidth = useCallback((link) => {
    const isRomanticLink = link.sourceType != "CHIL" && link.targetType != "CHIL";
    
    if (highlights.links.indexOf(link.index) !== -1) {
      return isRomanticLink ? loveLineWeight * 1.2 : bloodLineWeight * 1.2; // Slightly thicker when highlighted
    } else {
      return isRomanticLink ? loveLineWeight : bloodLineWeight;
    }
  }, [highlights, loveLineWeight, bloodLineWeight]);

  // Custom link rendering for line types
  const getLinkThreeObject = useCallback((link) => {
    const isRomanticLink = link.sourceType != "CHIL" && link.targetType != "CHIL";
    const lineType = isRomanticLink ? loveLineType : bloodLineType;
    
    if (lineType === 'solid') {
      return null; // Use default rendering
    }
    
    // Create custom dashed/dotted line
    const start = new THREE.Vector3(link.source.x, link.source.y, link.source.z);
    const end = new THREE.Vector3(link.target.x, link.target.y, link.target.z);
    
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    
    let material;
    if (lineType === 'dashed') {
      material = new THREE.LineDashedMaterial({
        color: getLinkColor(link),
        linewidth: getLinkWidth(link),
        dashSize: 3,
        gapSize: 1,
      });
    } else if (lineType === 'dotted') {
      material = new THREE.LineDashedMaterial({
        color: getLinkColor(link),
        linewidth: getLinkWidth(link),
        dashSize: 0.5,
        gapSize: 0.5,
      });
    }
    
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances(); // Required for dashed lines
    
    return line;
  }, [loveLineType, bloodLineType, getLinkColor, getLinkWidth]);

  // Link particles
  const getLinkParticleWidth = useCallback((link) => {
    if (highlights.links.indexOf(link.index) !== -1) {
      return 2;
    } else {
      return 0.1;
    }
  }, [highlights]);

  // USE EFFECT
  useEffect(() => {
    // Manage force
    fgRef.current.d3Force("collide", forceCollide(55));

    // Add timeline //
    (function () {
      // Get list of fixed Y
      let yRange = d3Data.nodes.map((node) => Number(node.fy));

      // Filter out NaN
      yRange = yRange.filter((node) => !isNaN(node) && node);

      // TIMELINE
      const highestY = Math.max.apply(Math, yRange);
      const lowestY = Math.min.apply(Math, yRange);

      // Create a timeline material with theme color
      var material = new THREE.LineBasicMaterial({
        color: currentTheme.timeline,
        linewidth: 2,
      });

      var points = [];
      points.push(new THREE.Vector3(0, lowestY, 0));
      points.push(new THREE.Vector3(0, highestY, 0));

      var geometry = new THREE.BufferGeometry().setFromPoints(points);

      var line = new THREE.Line(geometry, material);

      fgRef.current.scene().add(line);
    })();

    // Add timeline years
    (function () {
      // All YOBs
      let years = d3Data.nodes.map((node) => Number(node.yob));

      // Filter out NaN
      years = years.filter((year) => !isNaN(year));

      // Get list of fixed Y
      let yRange = d3Data.nodes.map((node) => Number(node.fy));

      // Filter out NaN
      yRange = yRange.filter((node) => !isNaN(node) && node);

      // TIMELINE
      const highestY = Math.max.apply(Math, yRange);
      const lowestY = Math.min.apply(Math, yRange);
      const halfY = (highestY + lowestY) / 2;
      const quarterY = (halfY + lowestY) / 2;
      const threeQuarterY = (halfY + highestY) / 2;

      const earliestYOB = Math.min.apply(Math, years);
      const latestYOB = Math.max.apply(Math, years);
      const halfYOB = parseInt((earliestYOB + latestYOB) / 2);
      const quarterYOB = parseInt((latestYOB + halfYOB) / 2);
      const threeQuarterYOB = parseInt((earliestYOB + halfYOB) / 2);

      // EARLIEST
      let earliest = new THREE.Mesh(
        new THREE.SphereGeometry(100),
        new THREE.MeshBasicMaterial({
          depthWrite: false,
          transparent: true,
          opacity: 0,
        })
      );

      earliest.position.y = highestY + 15;

      let earliestTimeLabel = earliestYOB
        ? new SpriteText(earliestYOB)
        : new SpriteText("Earlier");
      earliestTimeLabel.color = currentTheme.timeLabel;
      earliestTimeLabel.fontFace = "Helvetica";
      earliestTimeLabel.fontWeight = 800;
      earliestTimeLabel.textHeight = 25;
      earliest.add(earliestTimeLabel);

      // LATEST
      let latest = new THREE.Mesh(
        new THREE.SphereGeometry(100),
        new THREE.MeshBasicMaterial({
          depthWrite: false,
          transparent: true,
          opacity: 0,
        })
      );

      latest.position.y = lowestY - 15;

      let latestTimeLabel = latestYOB
        ? new SpriteText(latestYOB)
        : new SpriteText("Later");
      latestTimeLabel.color = currentTheme.timeLabel;
      latestTimeLabel.fontFace = "Helvetica";
      latestTimeLabel.fontWeight = 800;
      latestTimeLabel.textHeight = 25;
      latest.add(latestTimeLabel);

      // HALF
      let half = new THREE.Mesh(
        new THREE.SphereGeometry(100),
        new THREE.MeshBasicMaterial({
          depthWrite: false,
          transparent: true,
          opacity: 0,
        })
      );

      half.position.y = halfY;

      let halfTimeLabel = new SpriteText(halfYOB);
      halfTimeLabel.color = currentTheme.timeLabelSecondary;
      halfTimeLabel.fontFace = "Helvetica";
      halfTimeLabel.fontWeight = 800;
      halfTimeLabel.textHeight = 15;
      half.add(halfTimeLabel);

      // QUARTER
      let quarter = new THREE.Mesh(
        new THREE.SphereGeometry(100),
        new THREE.MeshBasicMaterial({
          depthWrite: false,
          transparent: true,
          opacity: 0,
        })
      );

      quarter.position.y = quarterY;

      let quarterTimeLabel = new SpriteText(quarterYOB);
      quarterTimeLabel.color = currentTheme.timeLabelSecondary;
      quarterTimeLabel.fontFace = "Helvetica";
      quarterTimeLabel.fontWeight = 800;
      quarterTimeLabel.textHeight = 15;
      quarter.add(quarterTimeLabel);

      // QUARTER
      let threeQuarter = new THREE.Mesh(
        new THREE.SphereGeometry(100),
        new THREE.MeshBasicMaterial({
          depthWrite: false,
          transparent: true,
          opacity: 0,
        })
      );

      threeQuarter.position.y = threeQuarterY;

      let threeQuarterTimeLabel = new SpriteText(threeQuarterYOB);
      threeQuarterTimeLabel.color = currentTheme.timeLabelSecondary;
      threeQuarterTimeLabel.fontFace = "Helvetica";
      threeQuarterTimeLabel.fontWeight = 800;
      threeQuarterTimeLabel.textHeight = 15;
      threeQuarter.add(threeQuarterTimeLabel);

      fgRef.current.scene().add(earliest);
      fgRef.current.scene().add(latest);
      highestY - lowestY > 300 && fgRef.current.scene().add(half);
      highestY - lowestY > 450 && fgRef.current.scene().add(quarter);
      highestY - lowestY > 450 && fgRef.current.scene().add(threeQuarter);
    })();

    // controls
    fgRef.current.controls().enableDamping = true;
    fgRef.current.controls().dampingFactor = 0.3;
    fgRef.current.controls().rotateSpeed = 0.8;
    fgRef.current.controls().screenSpacePanning = true;
  }, [currentTheme]);


  // LOGIC //

  // Handle node click
  const handleNodeClick = (node) => {    
    clearHighlights();
    
    // Only action if new node is clicked
    if (highlights.node !== node) {
      let tempHighlights = { node: node, family: [node.id], links: [], spouses: [], notDescendent: [] };
      const cloneable = { ...tempHighlights };
      delete cloneable.node;

      // Build nuclear family
      d3Data.links.forEach((link) => {
        if (link.source.id === node.id) {        
          tempHighlights.family.push(link.target.id);
          tempHighlights.links.push(link.index);
          if ((link.sourceType === "WIFE" || link.sourceType === "HUSB") && (link.targetType === "WIFE" || link.targetType === "HUSB")) {
            tempHighlights.spouses.push(link.target.id);
          }
          if (link.targetType !== "CHIL") {
            tempHighlights.notDescendent.push(link.target.id);
          }
        } else if (link.target.id === node.id) {        
          tempHighlights.family.push(link.source.id);
          tempHighlights.links.push(link.index);
          if ((link.sourceType === "WIFE" || link.sourceType === "HUSB") && (link.targetType === "WIFE" || link.targetType === "HUSB")) {
            tempHighlights.spouses.push(link.source.id);
          }
          tempHighlights.notDescendent.push(link.source.id);
        }
      });

      // Build parental lines
      const buildParentLines = (parentTempHighlights) => {
        d3Data.links.forEach((link) => {
          if (parentTempHighlights.family.indexOf(link.target.id) !== -1 && parentTempHighlights.family.indexOf(link.source.id) === -1 && parentTempHighlights.spouses.indexOf(link.target.id) === -1 && (link.sourceType != "CHIL" && link.targetType != "WIFE")) {
            parentTempHighlights.family.push(link.source.id);
            parentTempHighlights.links.push(link.index);
          }
        });
      }
      
      let parentTempHighlights = structuredClone(cloneable);
      while (true) {
        const lengthBefore = parentTempHighlights.family.length;
        buildParentLines(parentTempHighlights);
        const lengthAfter = parentTempHighlights.family.length;
        if (lengthAfter === lengthBefore) {
          break; // Exit loop if array length didn't change
        }
      }

      // Build descendent lines
      const buildDescendentLines = (descendentTempHighlights) => {
        d3Data.links.forEach((link) => {
          if (descendentTempHighlights.family.indexOf(link.source.id) !== -1 && descendentTempHighlights.family.indexOf(link.target.id) === -1 && descendentTempHighlights.notDescendent.indexOf(link.source.id) === -1 && (link.targetType === "CHIL")) {
            descendentTempHighlights.family.push(link.target.id);
            descendentTempHighlights.links.push(link.index);
          }
        });
      }
      // Remove duplicates
      tempHighlights.family = [...new Set(tempHighlights.family)];
      tempHighlights.links = [...new Set(tempHighlights.links)];

      let descendentTempHighlights = structuredClone(cloneable);
      while (true) {
        const lengthBefore = descendentTempHighlights.family.length;
        buildDescendentLines(descendentTempHighlights);
        const lengthAfter = descendentTempHighlights.family.length;
        console.log("lengthBefore", lengthBefore);
        console.log("lengthAfter", lengthAfter);
        if (lengthAfter === lengthBefore) {
          console.log("descendentLines length didn't change, exiting loop");
          break; // Exit loop if array length didn't change
        }
      }

      tempHighlights.family.push(...parentTempHighlights.family);
      tempHighlights.links.push(...parentTempHighlights.links);
      tempHighlights.family.push(...descendentTempHighlights.family);
      tempHighlights.links.push(...descendentTempHighlights.links);
      
      
      // Remove duplicates
      tempHighlights.family = [...new Set(tempHighlights.family)];
      tempHighlights.links = [...new Set(tempHighlights.links)];

      // Set highlights
      console.log("highlights", tempHighlights);
      setHighlights(tempHighlights);
    }
  };

  // Handle touch events for mobile
  useEffect(() => {
    if (!isMobile) return;

    const canvas = fgRef.current?.renderer().domElement;
    if (!canvas) return;

    const hammer = new Hammer.Manager(canvas);
    const singleTap = new Hammer.Tap({ event: "singletap" });
    const pinch = new Hammer.Pinch();

    pinch.recognizeWith(singleTap);
    hammer.add([singleTap, pinch]);

    hammer.on("singletap", (ev) => {
      const bounds = canvas.getBoundingClientRect();
      mouse.x = ((ev.center.x - bounds.left) / bounds.width) * 2 - 1;
      mouse.y = -((ev.center.y - bounds.top) / bounds.height) * 2 + 1;

      raycaster.setFromCamera(mouse, fgRef.current.camera());
      const intersects = raycaster.intersectObjects(fgRef.current.scene().children, true);
      const nodeObject = intersects.find((intersect) => intersect.object.__data && intersect.object.__data.id);

      if (nodeObject) {
        const node = nodeObject.object.__data;
        console.log(node)
        if (navigator.vibrate) navigator.vibrate(25);
        handleNodeClick(node);
      } else if (showingSurnames || showingLegend) {
        setShowingSurnames(false);
        setShowingLegend(false);
      } else {
        clearHighlights();
      }
    });

    hammer.on("pinchstart", () => {
      justPinchedRef.current = true;
    });

    hammer.on("pinchend", () => {
      setTimeout(() => {
        justPinchedRef.current = false;
      }, 500);
    });

    return () => {
      hammer.destroy();
    };
  }, [highlights, showingSurnames, showingLegend]);


  // BUILD GRAPH //
  return (
    <ForceGraph3D
      ref={fgRef}
      graphData={d3Data}
      // Display
      width={window.innerWidth}
      height={window.innerHeight}
      backgroundColor={currentTheme.background}
      showNavInfo={false}
      // Controls
      controlType={"orbit"}
      enableNodeDrag={false}
      onBackgroundClick={
        isMobile ? undefined : clearHighlights
      }
      // Nodes
      nodeThreeObject={setNodeThreeObject}
      nodeLabel={null}
      onNodeClick={!isMobile ? (node) => handleNodeClick(node) : undefined}
      onNodeDragEnd={() => {
        if (touchTimeout) {
          clearTimeout(touchTimeout);
          touchTimeout = null;
        }
      }}
      // LINKS
      linkLabel={null}
      linkColor={getLinkColor}
      linkOpacity={1}
      linkWidth={getLinkWidth}
      linkThreeObject={getLinkThreeObject}
      linkDirectionalParticles={(link) =>
        link.sourceType != "CHIL" &&
        link.targetType == "CHIL" &&
        d3Data.nodes.length < 300
          ? 8
          : 0
      }
      linkDirectionalParticleWidth={getLinkParticleWidth}
      linkDirectionalParticleSpeed={0.001}
    />
  );
};

export default Graph;