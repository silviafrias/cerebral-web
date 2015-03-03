CerebralWeb
============

Cerebral javascript plugin version that extends Cytoscape.js creating a horizontal layout and placing the nodes in the region of the canvas corresponding to the appropiate subcellular localization.

While it was designed with biological pathways in mind, it can also be used to lay out any graph that requires stratification according to some characteristic and thus can be used by researchers in a variety of fields, including the social sciences.

#Installation instructions
##Dependencies
Cerebral.js needs http://jquery.com and http://cytoscape.github.io/cytoscape.js to work. It works with jQuery 1.9+ and Cytoscape.js 2.2+

##Including Javascript

After downloading the dependency libraries and the 2 source files for the cerebral plugin you only need to include them in your HTML:
```html
<!-- jQuery -->
<script type="text/javascript" charset="utf8" src="/path.to.jquery/jquery.min.js"></script>

<!-- Cytoscape.js -->
<script type="text/javascript" charset="utf8" src="/path.to.cytoscape/cytoscape.min.js"></script>

<!-- Cerebral: cerebral.js -->
<script type="text/javascript" charset="utf8" src="/path.to.cerebral/cerebral.js"></script>

<!-- XGMML: xgmml.js -->
<!-- Include this module if you want to use the xgmml dropbox -->
<script type="text/javascript" charset="utf8" src="/path.to.cerebral/xgmml.js"></script>

<!-- Cerebral: Horizontal layout -->
<script type="text/javascript" charset="utf8" src="/path.to.cerebral/layout.horizontal.js"></script>
```
##Initialising CerebralWeb
Your CerebralWeb is almost working now. Add the inisialization to your html:
```html
<script type="text/javascript">
    $(loadCy = function() {
        
        $('#cy').cytoscape({
            layout: options,
            showOverlay: false,
            zoom: 1,
            style: cerebral_style,
            elements: [list of JSON elements],
            ready: function() {
                cy = this;
                cerebral_ready(cy);
            }
        });
    });

    $(window).resize(function() {
        loadCy();
    });

</script>  

<div id="cy"></div>
```
##Elements JSON
You can add to your JSON elements as much information as you need but the mandatory info for nodes and edges is:
```javascript
{
  "data": {
    "id": "node_id",
    "name": "node_name",
    "localization": "localization",
    "color": "color"
  },
  "group": "nodes"
},
{
  "data": {
    "id": "edge_id",
    "name": "info you want to popup on mouseover (interaction type, interactor types, ...)",
    "source": "node_idA",
    "target": "node_idB",
    "idgroup": "edge_id"
  },
  "group": "edges"
}
```
