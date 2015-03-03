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
                    if (att.nodeName == 'att' && att.getAttribute('name').toLowerCase() == 'localization') {
                        localization = att.getAttribute('value');
                        break;
                    } else if (att.nodeName == 'att' && att.getAttribute('name').toLowerCase() == 'identifier type') {
                        identifier_type = att.getAttribute('value');
                    } else if (att.nodeName == 'att' && att.getAttribute('name').toLowerCase() == 'identifier') {
                        identifier = att.getAttribute('value');
                        if (identifier_type.length > 0)
                            break;
                    } else if (att.nodeName == 'att' && att.getAttribute('name').toLowerCase().indexOf('id')!=-1){
                        aux = att.getAttribute('value').split(':');
                        if (aux.length == 2){
                            if ((aux[0].toLowerCase().indexOf('uniprot') !=-1) ||
                                (aux[0].toLowerCase().indexOf('innatedb') !=-1) ||
                                (aux[0].toLowerCase().indexOf('ensembl') !=-1) ||
                                (aux[0].toLowerCase().indexOf('entrez') !=-1)) {
                                identifier_type = aux[0];
                                identifier = aux[1];
                                break;
                            }
                        }
                    }
                }
                if (localization == null) {
                    nodes[identifier] = {"id": element.id, "name": element.getAttribute('label')}
                } else {
                    elements.push({group: "nodes", data: {"id": element.id, "name": element.getAttribute('label'), 'localization': localization, 'color': defaultNodeColor}});
                }
            } else if (element.nodeName == "edge") {
                for (i in element.children) {
                    att = element.children[i];
                    if (att.nodeName == 'att'){
                        if ((att.getAttribute('name').toLowerCase().indexOf('type') != -1) || (att.getAttribute('name').toLowerCase() == 'interaction')) {
                            interaction_type = att.getAttribute('value');
                            break;
                        }
                    }
                }
                elements.push({group: "edges", data: {"id": element.getAttribute('source') + '#' + element.getAttribute('target'), "name": interaction_type, "source": element.getAttribute('source'), "target": element.getAttribute('target'), "idgroup": element.getAttribute('source') + '#' + element.getAttribute('target')}});
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
                                localization: data[d],
                                color: defaultNodeColor
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


