/* cerebral.js */
/* Author: Silvia Frias */
/**
 * Designed to work with the last version of cytoscape.js at the moment: 2.2.11
 * This layout place the nodes in horizontal layers. 
 * Default settings are set for cerebral  
 */

/** MODIFY THESE VARIABLES IF NEEDED **/

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
var edgeWidth = '0.2px';
var edgeLabel = 'black';

// Node label color
var nodeLabel = 'white';
var borderNodeLabel = 'black';


function filterTable(filter) {
    //REWRITE THIS METHOD TO EXTEND THE FILTERING
}


/* DO NOT MODIFY CODE BELOW THIS LINE */
//DROPBOX and parse


$(loadDropbox = function(_elements, id_obj) {
    if (id_obj) {

        $("#" + id_obj).cytoscape({
            layout: options,
            showOverlay: false,
            zoom: 1,
            style: cerebral_style,
            elements: _elements,
            ready: function() {
                cy = this;
                cerebral_ready(cy);
            }
        });
    }
});

function dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
}

function dragover(e) {
    e.stopPropagation();
    e.preventDefault();
}

function drop(e) {
    e.stopPropagation();
    e.preventDefault();

    var dt = e.dataTransfer;
    var files = dt.files;

    loadFiles(files, e.currentTarget.id);
}
$(document).ready(function() {

    $(".cerebral-dropbox").each(function(index) {
        $(this)[0].addEventListener("dragenter", dragenter, false);
        $(this)[0].addEventListener("dragover", dragover, false);
        $(this)[0].addEventListener("drop", drop, false);
    });

});


function loadFiles(files, id_obj) {
    if (files.length != 1) {
        alert("Only one file at a time please");
    } else if (!files[0]['name'].endsWith(".xgmml") && !files[0]['name'].endsWith(".xml")) {
        alert("Your file doesn't look like an XGMML file")
    } else {
        parseXGMMLandLoad(files[0], id_obj);
    }
}
function parseXGMMLandLoad(xgmml_file, id_obj) {

    var reader = new FileReader();
    xgmml = '';
    elements = [];
    nodes = {};
    identifier_type = '';
    reader.onload = function() {
        xgmml = this.result;
        var xml = $.parseXML(xgmml);
        var graph = xml.children[0];
        for (e in graph.children) {
            element = graph.children[e];
            if (element.nodeName == "node") {
                var localization = null;
                var identifier = '';
                for (i in element.children) {
                    att = element.children[i];
                    if (att.nodeName == 'att' && att.getAttribute('name') == 'Localization') {
                        localization = att.getAttribute('value');
                        break;
                    } else if (att.nodeName == 'att' && att.getAttribute('name') == 'identifier type') {
                        identifier_type = att.getAttribute('value');
                    } else if (att.nodeName == 'att' && att.getAttribute('name') == 'identifier') {
                        identifier = att.getAttribute('value');
                        if (identifier_type.length > 0)
                            break;
                    }
                }
                if (localization == null) {
                    nodes[identifier] = {"id": element.id, "name": element.getAttribute('label')}
                } else {
                    elements.push({group: "nodes", data: {"id": element.id, "name": element.getAttribute('label'), 'localization': localization}});
                }
            } else if (element.nodeName == "edge") {
                for (i in element.children) {
                    att = element.children[i];
                    if ((att.getAttribute('name').indexOf('type') != -1) || (att.getAttribute('name') == 'interaction')) {
                        interaction_type = att.getAttribute('value');
                        break;
                    }
                }
                elements.push({group: "edges", data: {"id": element.getAttribute('source') + '#' + element.getAttribute('target'), "name": interaction_type, "source": element.getAttribute('source'), "target": element.getAttribute('target')}});
            }
        }
        // We need to query the WS to get localisations
        if (Object.keys(nodes).length > 0) {
            if (identifier_type.toLowerCase().indexOf("uniprot") - 1) {
                identifier_type = "UniProt";
            }
            var ids = JSON.stringify(Object.keys(nodes)).replace('\[', '').replace('\]', '').replaceAll('"', '');
            $.ajax({
                dataType: "json",
                async: false,
                type: "GET",
                url: "http://www.innatedb.com/cerebralLocalizationWS.do",
                data: 'xref=' + identifier_type + '&ids=' + ids,
                success: function(data)
                {
                    for (d in data) {
                        var obj = {
                            data: {
                                id: nodes[d]['id'],
                                name: nodes[d]['name'],
                                localization: data[d]
                            },
                            group: "nodes"
                        };
                        elements.push(obj)
                        //console.log(JSON.stringify(obj));

                    }
                },
                error: function(jqXHR, textStatus, errorThrown)
                {
                    console.log(errorThrown);
                }
            });
        }
        loadDropbox(elements, id_obj);
    }
    reader.readAsText(xgmml_file);
}