
var map;
var featsimplify=0; //sets custom feature simplification level
var countyweight=4; //sets county line width depending upon zoom level
var geojsonLayer;
var ignore_redraw = false;
var timeout_in_process = null;


    L.mapbox.accessToken = 'pk.eyJ1Ijoic3RhdGVjb2RlbW9nIiwiYSI6Ikp0Sk1tSmsifQ.hl44-VjKTJNEP5pgDFcFPg';

//attribution string for mapbox basemaps
var mbAttr = 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ';
var mbUrl = 'https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png';


    /* Basemap Layers */
    //var mbstyle = L.mapbox.tileLayer('statecodemog.d47df6dd', {
        //'zIndex': 1
    //});
    //var mbsat = L.mapbox.tileLayer('statecodemog.km7i3g01');


//Mapbox basemaps (my own)
var mbmap1   = L.tileLayer(mbUrl, {id: 'statecodemog.map-i4mhpeb3', attribution: mbAttr});
var mbmap2   = L.tileLayer(mbUrl, {id: 'statecodemog.map-392qgzze', attribution: mbAttr});

emerald = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: 'mapbox/outdoors-v11',
        accessToken: 'pk.eyJ1Ijoic3RhdGVjb2RlbW9nIiwiYSI6Ikp0Sk1tSmsifQ.hl44-VjKTJNEP5pgDFcFPg'
    });

nolabel = L.tileLayer('https://api.mapbox.com/styles/v1/statecodemog/ciq0yl9wf000ebpndverm5ler/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic3RhdGVjb2RlbW9nIiwiYSI6Ikp0Sk1tSmsifQ.hl44-VjKTJNEP5pgDFcFPg', {
        attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>'
    });

var Esri_WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
    });

//map declaration, default with the esri topo map.  No zoom control.  No attribution control (handling that custom)
map = L.map("map", {
  zoom: 12,
  center: [39.8, -105],
  layers: [Esri_WorldStreetMap],
  zoomControl: false,
  attributionControl: false
});


        //initialize geojsonLayer
         geojsonLayer = L.geoJson.ajax("", {
            middleware: function(data) {
                getJson(data);
            },
            onEachFeature: createPopup //onEachFeature
        }).addTo(map);

  
//boundary and annexations layer from my arcgis online account  
//style handled through 'getcitystyle' function
//popup handled through 'createPopup' function
// var annexations = L.esri.featureLayer({
//   url: 'https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/Web_Annexations07272016/FeatureServer/0', 
//     simplifyFactor: featsimplify,
//     style: function (feature) {
// 		return getcitystyle(feature);
//     },
// 	onEachFeature: createPopup
    
//   }).addTo(map);
  

//create jquery slider element
$('.slider').slider();

//when user stops sliding the slider, this function is called
 $('.slider').on('slideStop', function(ev){
 
  //custom redraw function
//   annexations.eachFeature(function(layer){
//     annexations.setFeatureStyle(layer.feature.id, getcitystyle(layer.feature));
//   });
geojsonLayer.setStyle(getcitystyle);
   
});

	

	
//when moving stops, this function is called
map.on('moveend', function() {
  
if(!ignore_redraw){
  // we dont want clicking a popup to trigger a complete redraw of the screen
  //if that popup bumps the screen view
ajaxcall();
}
  
});
	


//when 'Only Show Annexations' checkbox is toggled, call getcitystyle for each feature to update layer style
$(':checkbox').change(function() {

//   annexations.eachFeature(function(layer){
//     annexations.setFeatureStyle(layer.feature.id, getcitystyle(layer.feature));
//   });
geojsonLayer.setStyle(getcitystyle);
}); 	
		

    //calls php file that communicates with the database and retrieves geojson
    function ajaxcall() {

        geojsonLayer.clearLayers();

        var r = map.getBounds();
      
      var coord={};
        coord.nelat = (r._northEast.lat);
        coord.nelng = (r._northEast.lng);
        coord.swlat = (r._southWest.lat);
        coord.swlng = (r._southWest.lng);

        var diff1 = (coord.nelat - coord.swlat) / 2;
        var diff2 = (coord.nelng - coord.swlng) / 2;

        //we calculate a bounding box equal much larger than the actual visible map.  This preloades shapes that are off the map.  Combined with the center point query, this will allow us to not have to requery the database on every map movement.
        var newbounds = (coord.swlng - diff2) + "," + (coord.swlat - diff1) + "," + (coord.nelng + diff2) + "," + (coord.nelat + diff1);
console.log("https://gis.dola.colorado.gov/munis/munis?bb=" + newbounds + "&zoom=" + map.getZoom());
        geojsonLayer.refresh("https://gis.dola.colorado.gov/munis/munis?bb=" + newbounds + "&zoom=" + map.getZoom() ); //add a new layer replacing whatever is there

    }



    //after successfull ajax call, data is sent here
    function getJson(data) {


        geojsonLayer.clearLayers(); //(mostly) eliminates double-draw (should be technically unneccessary if you look at the code of leaflet-ajax...but still seems to help)
        geojsonLayer.addData(data);

        geojsonLayer.setStyle(getcitystyle); //geojsonLayer.setStyle(feat1);   
        //map.addLayer(geojsonLayer);

    }




//style a feature in the boundary and annexation layer
function getcitystyle(feature){

  //get slider value - range as an array of two decimal values
var slar=$('#sl1').data('slider').getValue();
var minyear=slar[0]; //slider 'from' date  - year with month as decimal
var maxyear=slar[1]; //slider 'to' date  - year with month as decimal
var rawdate=feature.properties.cl_re_date; //get the clerk and recorder date from feature
var curdate=new Date(rawdate); //turns clerk and recorder date into a javascrip date object
var curyear=curdate.getUTCFullYear(); //get year only from date object
var curmonth=(curdate.getUTCMonth() + 1)/12; //turns decimal value into actual month

  //if no date given, then it is a part of the base layer (rather than an annexation)
if(rawdate === "null"){
	if($('#ialign').prop('checked')===true){
    //if only show annexations is checked, dim feature. 
	  return {fillColor: 'rgb(0,0,0)', weight: 1, opacity: 0.6, color: 'rgb(0,0,0)', fillOpacity: 0.04};
  } 
}else{
  //else it is an annexation; check to make sure annexation date is within range, else dim feature.
	  if((curyear+curmonth)<=minyear){ //dont show all before this date
	  return {fillColor: 'rgb(0,0,0)', weight: 1, opacity: 0.6, color: 'rgb(0,0,0)', fillOpacity: 0.04};
	  } 
	  
	  if((curyear+curmonth)>maxyear){ //dont show all after this date
	  return {fillColor: 'rgb(0,0,0)', weight: 1, opacity: 0.6, color: 'rgb(0,0,0)', fillOpacity: 0.04};
	  } 
}
	  
  
	  //for the features not eliminated (return-ed) above, individually set feature colors (for best cartographic effect)
	  if(feature.properties.cityname === 'Aguilar'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Akron'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Alamosa'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Alma'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Antonito'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Arriba'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Arvada'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.cityname === 'Aspen'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Ault'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Aurora'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Avon'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Basalt'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Bayfield'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.cityname === 'Bennett'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Berthoud'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Bethune'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Black Hawk'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Blanca'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Blue River'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};

      }else if(feature.properties.cityname === 'Bonanza'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Boone'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Boulder'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Bow Mar'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Branson'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Breckenridge'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.cityname === 'Brighton'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Brookside'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Broomfield'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Brush'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Buena Vista'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Burlington'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.cityname === 'Calhan'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Campo'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Canon City'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Carbondale'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Castle Pines'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Castle Rock'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.cityname === 'Cedaredge'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Centennial'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Center'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Central City'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Cheraw'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Cherry Hills Village'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};


      }else if(feature.properties.cityname === 'Cheyenne Wells'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'City of Creede'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Coal Creek'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Cokedale'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Collbran'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Colorado Springs'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.cityname === 'Columbine Valley'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Commerce City'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Cortez'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Craig'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Crawford'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Crested Butte'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.cityname === 'Crestone'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Cripple Creek'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Crook'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Crowley'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Dacono'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'De Beque'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.cityname === 'Deer Trail'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Del Norte'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Delta'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Denver'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Dillon'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Dinosaur'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.cityname === 'Dolores'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Dove Creek'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Durango'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Eads'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Eagle'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Eaton'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};

      }else if(feature.properties.cityname === 'Eckley'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Edgewater'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Elizabeth'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Empire'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Englewood'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Erie'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.cityname === 'Estes Park'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Evans'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Fairplay'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Federal Heights'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Firestone'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Flagler'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.cityname === 'Fleming'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Florence'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Fort Collins'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Fort Lupton'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Fort Morgan'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Fountain'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};

      }else if(feature.properties.cityname === 'Fowler'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Foxfield'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Fraser'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Frederick'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Frisco'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Fruita'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.cityname === 'Garden City'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Genoa'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Georgetown'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Gilcrest'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Glendale'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Glenwood Springs'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.cityname === 'Golden'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Granada'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Granby'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Grand Junction'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Grand Lake'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Greeley'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.cityname === 'Green Mountain Falls'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Greenwood Village'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Grover'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Gunnison'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Gypsum'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Hartman'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.cityname === 'Haswell'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Haxtun'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Hayden'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Hillrose'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Holly'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Holyoke'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.cityname === 'Hooper'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Hot Sulphur Springs'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Hotchkiss'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Hudson'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Hugo'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Idaho Springs'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.cityname === 'Ignacio'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Iliff'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Jamestown'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Johnstown'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Julesburg'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Keenesburg'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.cityname === 'Kersey'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Kim'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Kiowa'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Kit Carson'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Kremmling'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'La Jara'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.cityname === 'La Junta'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'La Salle'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'La Veta'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Lafayette'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Lake City'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Lakeside'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.cityname === 'Lakewood'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Lamar'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Larkspur'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Las Animas'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Leadville'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Limon'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.cityname === 'Littleton'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Lochbuie'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Log Lane Village'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Lone Tree'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Longmont'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Louisville'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};		

      }else if(feature.properties.cityname === 'Loveland'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Lyons'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Manassa'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Mancos'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Manitou Springs'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Manzanola'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};		

      }else if(feature.properties.cityname === 'Marble'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Mead'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Meeker'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Merino'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Milliken'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Minturn'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.cityname === 'Moffat'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Monte Vista'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Montezuma'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Montrose'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Monument'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Morrison'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.cityname === 'Mount Crested Butte'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Mountain View'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Mountain Village'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Naturita'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Nederland'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'New Castle'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};		

      }else if(feature.properties.cityname === 'Northglenn'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Norwood'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Nucla'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Nunn'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Oak Creek'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Olathe'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.cityname === 'Olney Springs'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Ophir'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Orchard City'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Ordway'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Otis'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Ouray'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.cityname === 'Ovid'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Pagosa Springs'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Palisade'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Palmer Lake'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Paoli'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Paonia'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.cityname === 'Parachute'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Parker'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Peetz'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Pierce'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Pitkin'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Platteville'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.cityname === 'Poncha Springs'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Pritchett'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Pueblo'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Ramah'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Rangely'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Raymer (New Raymer)'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.cityname === 'Red Cliff'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Rico'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Ridgway'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Rifle'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Rockvale'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Rocky Ford'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.cityname === 'Romeo'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Rye'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Saguache'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Salida'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'San Luis'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Sanford'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};		

      }else if(feature.properties.cityname === 'Sawpit'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Sedgwick'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Seibert'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Severance'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Sheridan'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Sheridan Lake'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.cityname === 'Silt'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Silver Cliff'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Silver Plume'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Silverthorne'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Silverton'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Simla'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.cityname === 'Snowmass Village'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'South Fork'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Springfield'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Starkville'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Steamboat Springs'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Sterling'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.cityname === 'Stratton'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Sugar City'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Superior'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Swink'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Telluride'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Thornton'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.cityname === 'Timnath'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Trinidad'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Two Buttes'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Vail'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Victor'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Vilas'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.cityname === 'Vona'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Walden'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Walsenburg'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Walsh'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Ward'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Wellington'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.cityname === 'Westcliffe'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Westminster'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Wheat Ridge'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Wiggins'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Wiley'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Williamsburg'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.cityname === 'Windsor'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Winter Park'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Woodland Park'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Wray'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Yampa'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.cityname === 'Yuma'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		
		
      }else {
        //catch all
        return {fillColor: 'purple', weight: 2, opacity: 1, color: 'purple', fillOpacity: 0.2};
      }
	  

  }


//custom popup for boundary and annexation layer
//also adds mouseover and mouseout events
function createPopup(geojson,layer) {
  //geojson == feature.
  //layer == layer.

  
  //get slider value - range as an array of two decimal values
var slar=$('#sl1').data('slider').getValue();
var minyear=slar[0]; //slider 'from' date  - year with month as decimal
var maxyear=slar[1]; //slider 'to' date  - year with month as decimal
  
var rawdate=geojson.properties.cl_re_date;  //get the clerk and recorder date from feature
var curdate=new Date(rawdate); //turns clerk and recorder date into a javascrip date object
var curyear=curdate.getUTCFullYear(); //get year only from date object
var curmonth=(curdate.getUTCMonth() + 1)/12;  //turns decimal value into actual month
  
var popupText=''; //html markup for popup
var skip=0;


if(rawdate === "null"){
	//Base Layer
 popupText = "<div style='max-height:200px;'>" +
 "<h4>" + citylookup(geojson.properties.city) +
 "</h4><b>Base Layer</b></div>";
}else{
// 	  always show annexation popup - even if annexation not within date range

  //populate popup with annexation attributes
 if (geojson.properties) {
 popupText = "<div style='max-height:200px;'><h5><b>"+geojson.properties.descr+"</b></h5>" +
 "<table><tr><td><b>City:</b></td><td>" + citylookup(geojson.properties.city)+ "</td></tr>" +
 "<tr><td><b>County:</b></td><td>" + countylookup(geojson.properties.county)+ "</td></tr>" +
 "<tr><td><b>Ordinance:&nbsp;&nbsp;&nbsp;&nbsp;</b></td><td>" + geojson.properties.ord_num+ "</td></tr>" +
 "<tr><td><b>Reception:</b></td><td>" + geojson.properties.rec_num+ "</td></tr>" +
 "<tr><td><b>Date:</b></td><td>" + dateformat(geojson.properties.cl_re_date)+ "</td></tr>" +
 "<tr><td><b>Type:</b></td><td>" + typetranslate(geojson.properties.type)+ "</td></tr></table>";
 popupText += "</div>";
 }else{skip=1;} //or else set 'skip' flag
 
 }
 
  //if skip flag not set, bind popup to that layer/feature  (for leaflet - each feature (individual geometry) in geojson is also a layer)
 if(skip==0){layer.bindPopup(popupText);}
 
  //add mouseover and mouseout events
     layer.on({
         click: tellignore,
         mouseover: highlightFeatureAnn,
         mouseout: resetHighlightAnn
     });
	
}

function tellignore(){
  
  if(timeout_in_process !== null){
    window.clearTimeout(timeout_in_process);
  }
  
  ignore_redraw = true;
  
   timeout_in_process = window.setTimeout(function(){
    ignore_redraw = false;
  }, 2000);
}

//custom popup for deannexation layer
//also adds mouseover and mouseout events
//slider does not apply to de-annexations (yet)
function createPopup2(geojson,layer) {
    //geojson == feature.
  //layer == layer.

  //text for popup
 if (geojson.properties) {
 var popupText = "<div style='max-height:200px;'><h5><b>"+geojson.properties["DESCR"]+"</b></h5>" +
 "<table><tr><td><b>City:</b></td><td>" + citylookup(geojson.properties["CITY"])+ "</td></tr>" +
 "<tr><td><b>County:</b></td><td>" + countylookup(geojson.properties["COUNTY"])+ "</td></tr>" +
 "<tr><td><b>Ordinance:&nbsp;&nbsp;&nbsp;&nbsp;</b></td><td>" + geojson.properties["ORD_NUM"]+ "</td></tr>" +
 "<tr><td><b>Reception:</b></td><td>" + geojson.properties["REC_NUM"]+ "</td></tr>" +
 "<tr><td><b>Date:</b></td><td>" + dateformat(geojson.properties["CL_RE_DATE"])+ "</td></tr>" +
 "<tr><td><b>Type:</b></td><td>" + typetranslate(geojson.properties["TYPE"])+ "</td></tr></table>";
 popupText += "</div>";
 }
  
  //bind popup to geojson layer (an individual geojson feature is also a layer)
  layer.bindPopup(popupText);
  
  //add mouseover and mouseout events  
      layer.on({
        mouseover: highlightFeatureDe,
        mouseout: resetHighlightDe
    });
}


//translates attribute TYPE to either Annexation or De-Annexation for popups
function typetranslate(atype){
var toa;
if(atype=='A'){toa='Annexation';}
if(atype=='D'){toa='De-Annexation';}
return toa;
}


//date formatting function
function dateformat(cdate){
var d = new Date(cdate);

var month, day, year;

day = d.getUTCDate();
year = d.getUTCFullYear();
month = d.getUTCMonth() + 1;

return month+"/"+day+"/"+year;
}


//add mouseover highlight to annexation feature
function highlightFeatureAnn(e) {
    var layer = e.target;

  //get the clerk and recorder date from feature
var dtime = layer.feature.properties.cl_re_date;

var slar=$('#sl1').data('slider').getValue();  //get slider value - range as an array of two decimal values
var minyear=slar[0];  //slider 'from' date  - year with month as decimal
var maxyear=slar[1];  //slider 'to' date  - year with month as decimal

var curdate=new Date(dtime); //turns clerk and recorder date into a javascrip date object
var curyear=curdate.getUTCFullYear(); //get year only from date object
var curmonth=(curdate.getUTCMonth() + 1)/12; //turns decimal value into actual month

  //if feature is the baselayer
if(dtime === "null"){
	if($('#ialign').prop('checked')===true){ //and if 'only show annexations' is checked
    return; //do nothing - no highlight, exit function
	  }else{ //and if 'only show annexations' is NOT checked
	  		layer.setStyle({  //add a yellow highlight around the feature
			weight: 2,
			opacity: 1,
			color: 'yellow'
		});
      
      
                  //and bring that feature to the front (so other boundaries dont obscure the new highlighted boundaries)
            if (!L.Browser.ie && !L.Browser.opera) {
                layer.bringToFront();
            }
      
	  }
}else{ //if feature is an annexation

  //check date range - don't highlight out of range.
	  if((curyear+curmonth)<=minyear){
      return; //exit function
	  } //dont show all before this date
	  
	  if((curyear+curmonth)>=maxyear){
      return; //exit function
	  } //dont show all after this date
	  
  //if within range, add yellow highlight
	  if((minyear<=(curyear+curmonth)) && ((curyear+curmonth)<=maxyear)){
		layer.setStyle({
			weight: 3,
			opacity: 1,
			color: 'yellow'
		});
      
                  //and bring that feature to the front (so other boundaries dont obscure the new highlighted boundaries)
            if (!L.Browser.ie && !L.Browser.opera) {
                layer.bringToFront();
            }
      

	  }
	  
}
	  
}

//reset feature style on mouseout (remove highlight) to annexation feature
function resetHighlightAnn(e) {
  e.target.setStyle(getcitystyle(e.target.feature));
}


function highlightFeatureDe(e) {
    var layer = e.target;

    layer.setStyle({
		fillColor: 'pink',
        weight: 3,
        opacity: 1,
        color: 'pink'
    });
            if (!L.Browser.ie && !L.Browser.opera) {
                layer.bringToFront();
            }
}


function resetHighlightDe(e) {
    var layer = e.target;


    layer.setStyle({
		fillColor: 'black',
        weight: 2,
        opacity: 1,
        color: 'black'
    });
layer.bringToBack();
}


/* Attribution control */

//problem with geojson repeatedly calling updateAttribution
function updateAttribution(e) {

//if layer has an options.attribution property, then it is a basemap - update attribution
  //if we dont do this check for properties, this function will be called for every geojson layer too... as they are also triggered by map.on('layeradd',updateAttribution)
  if (e.layer.options) { // true 
      if (e.layer.options.attribution) { // true

  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      $("#attribution").html((layer.getAttribution()));
    }
  });
  $("#attribution").find("a").find("img").hide(); //hide disturbing ESRI logo if present

   }
}
}

//triggered when any layer added or removed (but meant for basemaps only)
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);


//attribution control is just the text element in the lower right corner of map
var attributionControl = L.control({
  position: "bottomright"
});
attributionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution");
  div.innerHTML = "<a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
};
map.addControl(attributionControl);

//zoom control... add to map
var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "icon-direction",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 18,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);


/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

//list of baselayers for grouped layer control plugin
var baseLayers = {
  "ESRI Streets": Esri_WorldStreetMap,
  "Low Contrast": nolabel,
  "Mapbox Emerald": emerald
  //"Mapbox Satellite": mbsat
};

//overlay layers for grouped layer control plugin
var groupedOverlays = {
  "Layers": {
	"<img src='images/muni.png' width='24' height='28'>&nbsp;Boundaries & Annexations": geojsonLayer
	//"<img src='images/deannex.png' width='24' height='28'>&nbsp;De-Annexations": null,	
	//"<img src='images/county.png' width='24' height='28'>&nbsp;County Lines": null
  }
};

//set up grouped layer control and add to map
var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed
}).addTo(map);


/* Highlight search box text on click */
$("#the-basics").click(function () {
  $(this).select();
});

//hide loading animation
  $("#loading").hide();
  
  //substring matcher function for typeahead implementation (algorithm for match.  did not write it myself)
var substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    var matches, substringRegex;
 
    // an array that will be populated with substring matches
    matches = [];
 
    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');
 
    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
        // the typeahead jQuery plugin expects suggestions to a
        // JavaScript object, refer to typeahead docs for more info
        matches.push({ value: str });
      }
    });
 
    cb(matches);
  };
};

//highlights text in searchbox on click
 $("#searchbox").click(function () {
  $(this).select();
});

//typeahead jquery plugin setup 
$('#the-basics .typeahead').typeahead({
  hint: true,
  highlight: true,
  minLength: 4
},
{
  name: 'locations',
  displayKey: 'value',
  source: substringMatcher(locations)
}
);
	
//typeahead jquery plugin - on selected or autocompleted
$('#the-basics .typeahead').on('typeahead:selected', function (e, datum) {
    //console.log(datum);
	searchresult(datum);
}).on('typeahead:autocompleted', function (e, datum) {
    //console.log(datum);
	searchresult(datum);	
});	
	
//translate selection in searchbox to actual map event
function searchresult(result){

  //locations array in js/locations.js
for(i=1;i<523;i++){
	if(lv[i].n==result.value){
    //if match, pan map to lat lng
		map.panTo(new L.LatLng(lv[i].lat,lv[i].lng));
		}
	}
}

//jquery document ready - when DOM has fully loaded
//leaflet active-area plugin - more compatible with mobile devices
$(document).ready(function() {
      map.setActiveArea({
      position: "absolute",
      top: "0px",
      left: "0px",
      right: "0px",
      height: $("#map").css("height")
    });
  
  //if a mobile device, set feature simplification
  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
   $('.slider').width('50px');
   featsimplify=0.8;
  }
  // TODO
  
  
  //kick it
  ajaxcall();
  
});
