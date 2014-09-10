/* layout.horitzontal.js */
/* Author: Silvia Frias */
/**
 * Designed to work with the last version of cytoscape.js at the moment: 2.2.11
 * This layout place the nodes in horizontal layers. 
 */

/* DO NOT MODIFY CODE BELOW THIS LINE */
options = {
    name: 'cerebral',
    colors: colors,
    layer_attribute_name: layer_attribute_name,
    layers: layers,
    background: backgroundColor,
    lineWidth: gridLineWidth,
    strokeStyle: gridColor,
    font: font
};
var cy;
var cerebral_style = [
    {
        selector: 'node',
        css: {
            'text-valign': 'center',
            'color': nodeLabel,
            'text-outline-width': '2px',
            'font-weight': 'bold',
            'background-color': 'data(color)',
            'width': '6px',
            'height': '6px',
            'border-color': borderNodeLabel,
            'border-width': '0.3px',
        }
    },
    {
        selector: 'node.nodeName',
        css: {
            'content': 'data(name)',
            'background-color': highLighColor,
            'text-opacity': 1
        }
    },
    {
        selector: 'edge.redLine',
        css: {
            'line-color': highLighColor,
            'width': '1px'
        }
    },
    {
        selector: 'edge.highLight',
        css: {
            'width': '0.8px'
        }
    },
    {
        selector: 'edge',
        css: {
            'target-arrow-shape': 'none',
            'line-color': edgeColor,
            'content': 'data(name)',
            'text-opacity': 0,
            'width': edgeWidth
        }
    },
    {
        selector: 'edge.showLabel',
        css: {
            'content': 'data(name)',
            'color': edgeLabel,
            'text-opacity': 1
        }
    }];

function cerebral_ready(cy) {

    if (cy.elements().nodes() < 20)
        cy.elements().addClass('nodeName');
    cy.on('mouseover', 'node', function(e) {
        var node = e.cyTarget;
        var neighborhood = node.neighborhood().add(node);
        neighborhood.toggleClass('nodeName');
        neighborhood.toggleClass('redLine');
    });

    cy.on('mouseover', 'edge', function(e) {
        var edge = e.cyTarget;
        var neighborhood = edge.connectedNodes();
        edge.toggleClass('showLabel');
        edge.toggleClass('redLine');
        neighborhood.toggleClass('nodeName');
    });

    cy.on('mouseout', 'node', function(e) {
        var node = e.cyTarget;
        var neighborhood = node.neighborhood().add(node);
        neighborhood.toggleClass('nodeName');
        neighborhood.toggleClass('redLine');
    });

    cy.on('mouseout', 'edge', function(e) {
        var edge = e.cyTarget;
        var neighborhood = edge.connectedNodes();
        edge.toggleClass('showLabel');
        edge.toggleClass('redLine');
        neighborhood.toggleClass('nodeName');
    });

    cy.on('tap', 'node', function(e) {
        var node = e.cyTarget;
        if (node.data('name').lastIndexOf("complex") > 0) {
            filter = node.data('name').substring(4, node.data('name').length - 7).trim();
            highlight(cy, "[idgroup= '" + filter + "']");
        } else {
            filter = node.data('name');
            highlight(cy, "edge[source = '" + node.data('id') + "']");
        }
        filterTable(filter);

    });

    cy.on('tap', 'edge', function(e) {
        var edge = e.cyTarget;
        highlight(cy, "[idgroup= '" + edge.data('idgroup') + "']");
        filterTable(edge.data('idgroup'));

    });

    cy.on('tap', function(e) {
        if (cy == e.cyTarget) {
            resetHighLight(this);
        }
    });
    //cy.fit();
    cy.zoomingEnabled(false);
}


function highlight(cy, selector) {
    cy.elements().removeClass('highLight');
    cy.elements().hide();

    var toHighLight = cy.edges(selector.toString());
    toHighLight.toggleClass('highLight');
    toHighLight.show();
    toHighLight.connectedNodes().show();
}

function resetHighLight(cy) {
    cy.elements().removeClass('highLight');
    cy.elements().show();
}


(function($$) {

    var defaults = {
        fit: true, // whether to fit the viewport to the graph
        padding: 30, // padding used on fit
        layers: ["layer 1", "layer 2", "layer 3"], //ordered from top to bottom 
        colors: {"layer 1": "red", "layer 2": "blue", "layer 3": "green"}, // colors of the layers
        layer_attribute_name: "layer", //name of the attribute that contains the information of the node layer
        background: "#FFFFFF", //background color
        lineWidth: 0.2, // widht of the line between layers
        strokeStyle: '#323232', // color of the line between layers
        font: "12pt Arial", // font of the labels of each layer
    };

    function CerebralLayout(options) {
        this.options = $$.util.extend({}, defaults, options);
    }

    CerebralLayout.prototype.run = function() {
        var options = this.options;
        var cy = options.cy;
        var totalNodes = cy.nodes().length;

        var container = cy.container();
        var width = container.clientWidth - 180;

        //grid
        var objCanvas = document.createElement('canvas');
        objCanvas.style.position = "absolute";
        objCanvas.style.zIndex = "-4";
        objCanvas.setAttribute("data-id", "grid");
        objCanvas.setAttribute("width", container.clientWidth);
        objCanvas.setAttribute("height", container.clientHeight);
        aux = [];
        for (i = 0; i < container.childNodes.length; i++) {
            if (container.childNodes[i].innerHTML && container.childNodes[i].innerHTML.startsWith("<canvas")) {
                container.childNodes[i].appendChild(objCanvas);
            } else {
                aux.push(container.childNodes[i]);
            }
        }
        for (i = 0; i < aux.length; i++) {
            container.removeChild(aux[i]);
        }
        var objContext = objCanvas.getContext("2d");
        objContext.globalCompositeOperation = 'source-over';

        objContext.fillStyle = options.background;
        objContext.fillRect(0, 0, container.clientWidth, container.clientHeight);

        objContext.textAlign = "end";

        var nodes = {};
        //If layers is not defined we'll extract layer data from elements.
        extractLayers = true;
        if (options.layers.length > 0) {
            extractLayers = false;
        }
        var auxColors = ['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'];
        n = cy.nodes();
        for (i = 0; i < n.length; i++) {
            if (extractLayers && options.layers.indexOf(n[i].data(options.layer_attribute_name)) == -1) {
                options.layers.push(n[i].data(options.layer_attribute_name));
            }
            if (options.colors[n[i].data(options.layer_attribute_name)] == undefined) {
                if (options.layers.length - 1 < auxColors.length) {
                    col = auxColors[options.layers.indexOf(n[i].data(options.layer_attribute_name))];
                }
                else {
                    col = '#' + Math.floor(Math.random() * 16777215).toString(16);
                }
                options.colors[n[i].data(options.layer_attribute_name)] = col;
            }
            n[i].data('color', options.colors[n[i].data(options.layer_attribute_name)]);
        }

        for (i = 0; i < options.layers.length; i++) {
            var nodesAux = cy.elements("node[" + options.layer_attribute_name + " = '" + options.layers[i] + "']");
            if (nodesAux.length > 0) {
                nodes[options.layers[i]] = nodesAux;
            }
        }
        var height = 0;
        var heightAcum = 0;
        var numLines = Object.keys(nodes).length - 1;
        var room = 20;
        for (i = 0; i < options.layers.length; i++) {
            var nodesAux = nodes[options.layers[i]];
            if (nodesAux != null && nodesAux.length > 0) {

                height = Math.ceil((container.clientHeight - 10 - (numLines * room)) / (totalNodes / nodesAux.length));
                var line = heightAcum + height + (room / 2);
                //console.log(options.layers[i]"- height: " + height + ", heightAcum: " + heightAcum + ", line: " + line);

                objContext.moveTo(0, line);
                objContext.lineTo(objCanvas.width, line);
                objContext.lineWidth = options.lineWidth;
                objContext.strokeStyle = options.strokeStyle;
                objContext.stroke();
                objContext.font = options.font;
                objContext.fillStyle = options.colors[options.layers[i]];
                objContext.textBaseline = "middle";

                var y = heightAcum + Math.ceil((height) / 2);
                if (heightAcum == 0) {
                    y = line / 2;
                }

                objContext.fillText(options.layers[i], container.clientWidth - 10, y);
                nodesAux.positions(function(j, element) {
                    if (element.locked()) {
                        return false;
                    }

                    return {
                        x: Math.round((Math.random() * width) + 15),
                        y: Math.round((Math.random() * height) + 5 + heightAcum)
                    };
                });
                heightAcum += height + room;
            }
        }

        cy.one("layoutready", options.ready);
        cy.trigger("layoutready");

        cy.one("layoutstop", options.stop);
        cy.trigger("layoutstop");
    };



    // called on continuous layouts to stop them before they finish
    CerebralLayout.prototype.stop = function() {
        var options = this.options;
        var cy = options.cy;

        cy.one('layoutstop', options.stop);
        cy.trigger('layoutstop');
    };


    $$("layout", "cerebral", CerebralLayout);

})(cytoscape);



//Some useful functions
if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function(str) {
        return this.substring(0, str.length) === str;
    }
}


if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function(str) {
        return this.substring(this.length - str.length, this.length) === str;
    }
}

if (typeof String.prototype.replaceAll != 'function') {
    String.prototype.replaceAll = function(find, replace) {
        var str = this;
        return str.replace(new RegExp(find, 'g'), replace);
    }
}