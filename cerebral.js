/* cerebral.js */
/* Author: Silvia Frias */
/**
 * Designed to work with the last version of cytoscape.js at the moment: 2.2.11
 * This layout place the nodes in horizontal layers.
 * Default settings are set for cerebral
 */

/** MODIFY THESE VARIABLES TO CUSTOMIZE YOUR NETWORK **/ 

// Map with the color of each layer ({layer1:color1, layer2:color2})
var colors = {"Nucleus": "#33CC33", "Plasma membrane": "#FF9900", "Cytoplasm": "#9999FF", "Extracellular": "#FFCC11", "Cell surface": "#3366FF", "Unknown": "#8e8e8e"};

// Ordered list of layers from top to bottom
var layers = ['Extracellular', 'Cell surface', 'Plasma membrane', 'Cytoplasm', 'Nucleus', 'Unknown'];

// Name of the attribute that contains the information of the node layer
var layer_attribute_name = "localization";

// Color of hihglighted elements
var highLighColor = "red";

// Background color
var backgroundColor = "#FFFFFF";

// Widht of the line between layers
var gridLineWidth = 0.2;

// Color of the line between layers
var gridColor = '#323232';

// Font of the labels of each layer
var font = "12pt Arial";

//Edges color, width and label color
var edgeColor = '5f5f5f';
var edgeWidth = '0.8px';
var edgeLabel = 'black';

// Node label color
var nodeLabel = 'white';
var borderNodeLabel = 'black';


function filterTable(filter) {
    //REWRITE THIS METHOD TO EXTEND THE FILTERING
}


