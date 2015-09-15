
var map;
var featsimplify=0; //sets custom feature simplification level
var countyweight=4; //sets county line width depending upon zoom level


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
  
});



// Basemap Layers for Mapquest Basemaps
var mapquestOSM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png", {
  maxZoom: 19,
  subdomains: ["otile1", "otile2", "otile3", "otile4"],
  attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA.'
});
var mapquestOAM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
  maxZoom: 18,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
  attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
});
var mapquestHYB = L.layerGroup([L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
  maxZoom: 18,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
  attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA.'
}), L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/hyb/{z}/{x}/{y}.png", {
  maxZoom: 19,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
  attribution: 'Labels courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
})]);

//attribution string for mapbox basemaps
var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ';
var mbUrl = 'https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png';

//Mapbox basemaps (my own)
var mbmap1   = L.tileLayer(mbUrl, {id: 'statecodemog.map-i4mhpeb3', attribution: mbAttr});
var mbmap2   = L.tileLayer(mbUrl, {id: 'statecodemog.map-392qgzze', attribution: mbAttr});

//Built in ESRI basemaps
var esritopo = L.esri.basemapLayer("Topographic",{attribution: 'Tiles courtesy of ESRI.'});
var esrisat = L.esri.basemapLayer("Imagery",{attribution: 'Tiles courtesy of ESRI.'});


//map declaration, default with the esri topo map.  No zoom control.  No attribution control (handling that custom)
map = L.map("map", {
  zoom: 12,
  center: [39.8, -105],
  layers: [esritopo],
  zoomControl: false,
  attributionControl: false
});


//county outline layer from my arcgis online account
var counties = L.esri.featureLayer('http://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/County_Line_2012/FeatureServer/0', {
    simplifyFactor: 0.5,
    style: function (feature) {
        return {color: 'black', weight: countyweight };
    }
  }).addTo(map);
  
//boundary and annexations layer from my arcgis online account  
//style handled through 'getcitystyle' function
//popup handled through 'createPopup' function
var annexations = L.esri.featureLayer('http://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/Web_Annexations06052015/FeatureServer/0', {
    simplifyFactor: featsimplify,
    style: function (feature) {
		return getcitystyle(feature);
    },
	onEachFeature: createPopup
  }).addTo(map);
  

//create jquery slider element
$('.slider').slider();

//when user stops sliding the slider, this function is called
 $('.slider').on('slideStop', function(ev){
 
  //custom redraw function
  annexations.eachFeature(function(layer){
    annexations.setFeatureStyle(layer.feature.id, getcitystyle(layer.feature));
  });

});
	

//when zooming (in or out) stops, this function is called
map.on('zoomend', function() {

  //find the current zoomlevel of the map
  var zoomlev=map.getZoom();

  //by default, no feature simplification.  However, if zoomed way out, adjust simplification and county outline weight
  featsimplify=0;
  if(zoomlev<14){featsimplify=0.1;countyweight=4;}
  if(zoomlev<13){featsimplify=0.2;countyweight=4;}
  if(zoomlev<12){featsimplify=0.3;countyweight=3;}
  if(zoomlev<11){featsimplify=0.4;countyweight=3;}
  if(zoomlev<10){featsimplify=0.5;countyweight=3;}
  if(zoomlev<9){featsimplify=0.6;countyweight=2;}
  if(zoomlev<8){featsimplify=0.7;countyweight=2;}
  if(zoomlev<7){featsimplify=0.8;countyweight=2;}

  //update county symbology on map
  counties.setStyle({color: 'black', weight: countyweight });

});
	

//when 'Only Show Annexations' checkbox is toggled, call getcitystyle for each feature to update layer style
$(':checkbox').change(function() {

  annexations.eachFeature(function(layer){
    annexations.setFeatureStyle(layer.feature.id, getcitystyle(layer.feature));
  });
	
}); 	
		
  //deannexation feature layer from arcgis online
  //custom popup function createPopup2
  //all features same style
var deannex = L.esri.featureLayer('http://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/DeAnnexations11102014/FeatureServer/0', {
    simplifyFactor: 0,
    style: function (feature) {
        return {
		fillColor: 'black',
        weight: 2,
        opacity: 1,
        color: 'black',
        fillOpacity: 0.2
		};
    },
	onEachFeature: createPopup2
  }); 


//style a feature in the boundary and annexation layer
function getcitystyle(feature){

  //get slider value - range as an array of two decimal values
var slar=$('#sl1').data('slider').getValue();
var minyear=slar[0]; //slider 'from' date  - year with month as decimal
var maxyear=slar[1]; //slider 'to' date  - year with month as decimal
var rawdate=feature.properties.CL_RE_DATE; //get the clerk and recorder date from feature
var curdate=new Date(rawdate); //turns clerk and recorder date into a javascrip date object
var curyear=curdate.getUTCFullYear(); //get year only from date object
var curmonth=(curdate.getUTCMonth() + 1)/12; //turns decimal value into actual month

  
  //if no date given, then it is a part of the base layer (rather than an annexation)
if(rawdate === null){
	if($('#ialign').prop('checked')===true){
    //if only show annexations is checked, dim feature. 
	  return {fillColor: 'rgb(0,0,0)', weight: 1, opacity: 0.6, color: 'rgb(0,0,0)', fillOpacity: 0.04};
  } 
}else{
  //else it is an annexation; check to make sure annexation date is within range, else dim feature.
	  if((curyear+curmonth)<=minyear){ //dont show all before this date
	  return {fillColor: 'rgb(0,0,0)', weight: 1, opacity: 0.6, color: 'rgb(0,0,0)', fillOpacity: 0.04};
	  } 
	  
	  if((curyear+curmonth)>=maxyear){ //dont show all after this date
	  return {fillColor: 'rgb(0,0,0)', weight: 1, opacity: 0.6, color: 'rgb(0,0,0)', fillOpacity: 0.04};
	  } 
}
	  
  
	  //for the features not eliminated (return-ed) above, individually set feature colors (for best cartographic effect)
	  if(feature.properties.CITYNAME === 'Aguilar'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Akron'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Alamosa'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Alma'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Antonito'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Arriba'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Arvada'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.CITYNAME === 'Aspen'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Ault'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Aurora'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Avon'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Basalt'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Bayfield'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.CITYNAME === 'Bennett'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Berthoud'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Bethune'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Black Hawk'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Blanca'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Blue River'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};

      }else if(feature.properties.CITYNAME === 'Bonanza'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Boone'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Boulder'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Bow Mar'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Branson'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Breckenridge'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.CITYNAME === 'Brighton'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Brookside'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Broomfield'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Brush'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Buena Vista'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Burlington'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.CITYNAME === 'Calhan'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Campo'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Canon City'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Carbondale'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Castle Pines'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Castle Rock'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.CITYNAME === 'Cedaredge'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Centennial'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Center'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Central City'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Cheraw'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Cherry Hills Village'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};


      }else if(feature.properties.CITYNAME === 'Cheyenne Wells'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'City of Creede'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Coal Creek'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Cokedale'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Collbran'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Colorado Springs'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.CITYNAME === 'Columbine Valley'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Commerce City'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Cortez'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Craig'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Crawford'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Crested Butte'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.CITYNAME === 'Crestone'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Cripple Creek'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Crook'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Crowley'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Dacono'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'De Beque'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.CITYNAME === 'Deer Trail'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Del Norte'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Delta'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Denver'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Dillon'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Dinosaur'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.CITYNAME === 'Dolores'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Dove Creek'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Durango'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Eads'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Eagle'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Eaton'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};

      }else if(feature.properties.CITYNAME === 'Eckley'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Edgewater'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Elizabeth'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Empire'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Englewood'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Erie'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.CITYNAME === 'Estes Park'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Evans'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Fairplay'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Federal Heights'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Firestone'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Flagler'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.CITYNAME === 'Fleming'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Florence'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Fort Collins'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Fort Lupton'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Fort Morgan'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Fountain'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};

      }else if(feature.properties.CITYNAME === 'Fowler'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Foxfield'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Fraser'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Frederick'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Frisco'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Fruita'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.CITYNAME === 'Garden City'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Genoa'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Georgetown'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Gilcrest'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Glendale'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Glenwood Springs'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.CITYNAME === 'Golden'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Granada'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Granby'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Grand Junction'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Grand Lake'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Greeley'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.CITYNAME === 'Green Mountain Falls'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Greenwood Village'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Grover'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Gunnison'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Gypsum'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Hartman'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.CITYNAME === 'Haswell'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Haxtun'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Hayden'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Hillrose'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Holly'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Holyoke'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.CITYNAME === 'Hooper'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Hot Sulphur Springs'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Hotchkiss'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Hudson'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Hugo'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Idaho Springs'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.CITYNAME === 'Ignacio'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Iliff'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Jamestown'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Johnstown'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Julesburg'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Keenesburg'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.CITYNAME === 'Kersey'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Kim'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Kiowa'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Kit Carson'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Kremmling'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'La Jara'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.CITYNAME === 'La Junta'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'La Salle'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'La Veta'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Lafayette'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Lake City'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Lakeside'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(feature.properties.CITYNAME === 'Lakewood'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Lamar'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Larkspur'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Las Animas'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Leadville'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Limon'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.CITYNAME === 'Littleton'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Lochbuie'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Log Lane Village'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Lone Tree'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Longmont'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Louisville'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};		

      }else if(feature.properties.CITYNAME === 'Loveland'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Lyons'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Manassa'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Mancos'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Manitou Springs'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Manzanola'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};		

      }else if(feature.properties.CITYNAME === 'Marble'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Mead'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Meeker'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Merino'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Milliken'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Minturn'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.CITYNAME === 'Moffat'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Monte Vista'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Montezuma'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Montrose'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Monument'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Morrison'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.CITYNAME === 'Mount Crested Butte'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Mountain View'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Mountain Village'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Naturita'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Nederland'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'New Castle'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};		

      }else if(feature.properties.CITYNAME === 'Northglenn'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Norwood'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Nucla'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Nunn'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Oak Creek'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Olathe'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.CITYNAME === 'Olney Springs'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Ophir'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Orchard City'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Ordway'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Otis'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Ouray'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.CITYNAME === 'Ovid'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Pagosa Springs'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Palisade'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Palmer Lake'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Paoli'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Paonia'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.CITYNAME === 'Parachute'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Parker'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Peetz'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Pierce'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Pitkin'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Platteville'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.CITYNAME === 'Poncha Springs'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Pritchett'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Pueblo'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Ramah'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Rangely'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Raymer (New Raymer)'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.CITYNAME === 'Red Cliff'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Rico'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Ridgway'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Rifle'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Rockvale'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Rocky Ford'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.CITYNAME === 'Romeo'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Rye'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Saguache'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Salida'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'San Luis'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Sanford'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};		

      }else if(feature.properties.CITYNAME === 'Sawpit'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Sedgwick'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Seibert'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Severance'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Sheridan'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Sheridan Lake'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.CITYNAME === 'Silt'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Silver Cliff'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Silver Plume'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Silverthorne'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Silverton'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Simla'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.CITYNAME === 'Snowmass Village'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'South Fork'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Springfield'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Starkville'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Steamboat Springs'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Sterling'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.CITYNAME === 'Stratton'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Sugar City'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Superior'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Swink'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Telluride'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Thornton'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.CITYNAME === 'Timnath'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Trinidad'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Two Buttes'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Vail'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Victor'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Vilas'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.CITYNAME === 'Vona'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Walden'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Walsenburg'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Walsh'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Ward'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Wellington'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.CITYNAME === 'Westcliffe'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Westminster'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Wheat Ridge'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Wiggins'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Wiley'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Williamsburg'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(feature.properties.CITYNAME === 'Windsor'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Winter Park'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Woodland Park'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Wray'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Yampa'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(feature.properties.CITYNAME === 'Yuma'){
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
  
var rawdate=geojson.properties.CL_RE_DATE;  //get the clerk and recorder date from feature
var curdate=new Date(rawdate); //turns clerk and recorder date into a javascrip date object
var curyear=curdate.getUTCFullYear(); //get year only from date object
var curmonth=(curdate.getUTCMonth() + 1)/12;  //turns decimal value into actual month
  
var popupText=''; //html markup for popup
var skip=0;


if(rawdate === null){
	//Base Layer
 popupText = "<div style='max-height:200px;'>" +
 "<h4>" + citylookup(geojson.properties["CITY"]) +
 "</h4><b>Base Layer</b></div>";
}else{
	  if((curyear+curmonth)<=minyear){
	  skip=1;
	  } //dont show all before this date - dont display popup for annexation not within date range
	  
	  if((curyear+curmonth)>=maxyear){
	  skip=1;
	  } //dont show all after this date - dont display popup for annexation not within date range

  //populate popup with annexation attributes
 if (geojson.properties) {
 popupText = "<div style='max-height:200px;'><h5><b>"+geojson.properties["DESCR"]+"</b></h5>" +
 "<table><tr><td><b>City:</b></td><td>" + citylookup(geojson.properties["CITY"])+ "</td></tr>" +
 "<tr><td><b>County:</b></td><td>" + countylookup(geojson.properties["COUNTY"])+ "</td></tr>" +
 "<tr><td><b>Ordinance:&nbsp;&nbsp;&nbsp;&nbsp;</b></td><td>" + geojson.properties["ORD_NUM"]+ "</td></tr>" +
 "<tr><td><b>Reception:</b></td><td>" + geojson.properties["REC_NUM"]+ "</td></tr>" +
 "<tr><td><b>Date:</b></td><td>" + dateformat(geojson.properties["CL_RE_DATE"])+ "</td></tr>" +
 "<tr><td><b>Type:</b></td><td>" + typetranslate(geojson.properties["TYPE"])+ "</td></tr></table>";
 popupText += "</div>";
 }else{skip=1;} //or else set 'skip' flag
 
 }
 
  //if skip flag not set, bind popup to that layer/feature  (for leaflet - each feature (individual geometry) in geojson is also a layer)
 if(skip==0){layer.bindPopup(popupText);}
 
  //add mouseover and mouseout events
     layer.on({
         mouseover: highlightFeatureAnn,
         mouseout: resetHighlightAnn
     });
	
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

//lgid to city name lookup
function citylookup(city){

var cname;

if(city=='09555'){cname='Brush';}
if(city=='36610'){cname='Hillrose';}
if(city=='45695'){cname='Log Lane Village';}
if(city=='84770'){cname='Wiggins';}
if(city=='33310'){cname='Grover';}
if(city=='13460'){cname='Cheraw';}
if(city=='48500'){cname='Manzanola';}
if(city=='08345'){cname='Branson';}
if(city=='78610'){cname='Trinidad';}
if(city=='40570'){cname='Kim';}
if(city=='26875'){cname='Fleming';}
if(city=='58235'){cname='Peetz';}
if(city=='43660'){cname='Las Animas';}
if(city=='28690'){cname='Frisco';}
if(city=='53120'){cname='Naturita';}
if(city=='54935'){cname='Nucla';}
if(city=='55540'){cname='Olathe';}
if(city=='17375'){cname='Cortez';}
if(city=='66895'){cname='Rye';}
if(city=='28305'){cname='Fraser';}
if(city=='31715'){cname='Grand Lake';}
if(city=='37600'){cname='Hot Sulphur Springs';}
if(city=='41560'){cname='Kremmling';}
if(city=='85705'){cname='Winter Park';}
if(city=='18310'){cname='Crested Butte';}
if(city=='23740'){cname='Elizabeth';}
if(city=='40790'){cname='Kiowa';}
if(city=='27425'){cname='Fort Collins';}
if(city=='86310'){cname='Wray';}
if(city=='49875'){cname='Meeker';}
if(city=='00925'){cname='Akron';}
if(city=='62880'){cname='Rangely';}
if(city=='17760'){cname='Craig';}
if(city=='20495'){cname='Dinosaur';}
if(city=='68655'){cname='Sawpit';}
if(city=='19080'){cname='Dacono';}
if(city=='85485'){cname='Windsor';}
if(city=='39855'){cname='Johnstown';}
if(city=='45530'){cname='Lochbuie';}
if(city=='63045'){cname='Raymer (New Raymer)';}
if(city=='37820'){cname='Hudson';}
if(city=='45970'){cname='Longmont';}
if(city=='22860'){cname='Eaton';}
if(city=='40515'){cname='Kersey';}
if(city=='82350'){cname='Walsenburg';}
if(city=='19355'){cname='De Beque';}
if(city=='34520'){cname='Hartman';}
if(city=='73825'){cname='Steamboat Springs';}
if(city=='09115'){cname='Brookside';}
if(city=='11810'){cname='Cañon City';}
if(city=='08400'){cname='Breckenridge';}
if(city=='51690'){cname='Montezuma';}
if(city=='82130'){cname='Walden';}
if(city=='11645'){cname='Campo';}
if(city=='06530'){cname='Bethune';}
if(city=='10600'){cname='Burlington';}
if(city=='57630'){cname='Parker';}
if(city=='56420'){cname='Ouray';}
if(city=='03620'){cname='Aspen';}
if(city=='71755'){cname='Snowmass Village';}
if(city=='14175'){cname='Cheyenne Wells';}
if(city=='11260'){cname='Calhan';}
if(city=='16000'){cname='Colorado Springs';}
if(city=='27975'){cname='Fowler';}
if(city=='26765'){cname='Flagler';}
if(city=='74485'){cname='Stratton';}
if(city=='27810'){cname='Fort Morgan';}
if(city=='19850'){cname='Delta';}
if(city=='65190'){cname='Rocky Ford';}
if(city=='75970'){cname='Swink';}
if(city=='38590'){cname='Iliff';}
if(city=='73935'){cname='Sterling';}
if(city=='27865'){cname='Fountain';}
if(city=='51800'){cname='Monument';}
if(city=='86090'){cname='Woodland Park';}
if(city=='81690'){cname='Vona';}
if(city=='74815'){cname='Sugar City';}
if(city=='18750'){cname='Crowley';}
if(city=='55705'){cname='Olney Springs';}
if(city=='56145'){cname='Ordway';}
if(city=='51745'){cname='Montrose';}
if(city=='70635'){cname='Simla';}
if(city=='23025'){cname='Eckley';}
if(city=='48445'){cname='Manitou Springs';}
if(city=='57025'){cname='Palmer Lake';}
if(city=='62660'){cname='Ramah';}
if(city=='72395'){cname='South Fork';}
if(city=='15330'){cname='Coal Creek';}
if(city=='67280'){cname='Salida';}
if(city=='32650'){cname='Green Mountain Falls';}
if(city=='18530'){cname='Cripple Creek';}
if(city=='80865'){cname='Victor';}
if(city=='73330'){cname='Springfield';}
if(city=='79270'){cname='Two Buttes';}
if(city=='81030'){cname='Vilas';}
if(city=='27040'){cname='Florence';}
if(city=='64970'){cname='Rockvale';}
if(city=='85155'){cname='Williamsburg';}
if(city=='44320'){cname='Leadville';}
if(city=='57400'){cname='Parachute';}
if(city=='42330'){cname='Lake City';}
if(city=='10105'){cname='Buena Vista';}
if(city=='60600'){cname='Poncha Springs';}
if(city=='42110'){cname='La Junta';}
if(city=='25115'){cname='Estes Park';}
if(city=='83230'){cname='Wellington';}
if(city=='48115'){cname='Mancos';}
if(city=='45955'){cname='Lone Tree';}
if(city=='12415'){cname='Castle Rock';}
if(city=='18640'){cname='Crook';}
if(city=='55980'){cname='Orchard City';}
if(city=='50040'){cname='Merino';}
if(city=='07571'){cname='Bonanza';}
if(city=='18420'){cname='Crestone';}
if(city=='51250'){cname='Moffat';}
if(city=='67005'){cname='Saguache';}
if(city=='24620'){cname='Empire';}
if(city=='29735'){cname='Georgetown';}
if(city=='70360'){cname='Silver Plume';}
if(city=='12635'){cname='Cedaredge';}
if(city=='17925'){cname='Crawford';}
if(city=='57300'){cname='Paonia';}
if(city=='15605'){cname='Collbran';}
if(city=='28745'){cname='Fruita';}
if(city=='64200'){cname='Ridgway';}
if(city=='61315'){cname='Pritchett';}
if(city=='82460'){cname='Walsh';}
if(city=='56970'){cname='Palisade';}
if(city=='52075'){cname='Morrison';}
if(city=='05265'){cname='Bayfield';}
if(city=='38535'){cname='Ignacio';}
if(city=='70580'){cname='Silverton';}
if(city=='46355'){cname='Louisville';}
if(city=='31605'){cname='Granby';}
if(city=='68105'){cname='San Luis';}
if(city=='39965'){cname='Julesburg';}
if(city=='56475'){cname='Ovid';}
if(city=='68930'){cname='Sedgwick';}
if(city=='23135'){cname='Edgewater';}
if(city=='52350'){cname='Mountain View';}
if(city=='40185'){cname='Keenesburg';}
if(city=='55045'){cname='Nunn';}
if(city=='56860'){cname='Pagosa Springs';}
if(city=='07850'){cname='Boulder';}
if(city=='39195'){cname='Jamestown';}
if(city=='47070'){cname='Lyons';}
if(city=='53175'){cname='Nederland';}
if(city=='12910'){cname='Central City';}
if(city=='38370'){cname='Idaho Springs';}
if(city=='07795'){cname='Boone';}
if(city=='01530'){cname='Alma';}
if(city=='25610'){cname='Fairplay';}
if(city=='06255'){cname='Berthoud';}
if(city=='03950'){cname='Ault';}
if(city=='08675'){cname='Brighton';}
if(city=='24950'){cname='Erie';}
if(city=='27700'){cname='Fort Lupton';}
if(city=='29185'){cname='Garden City';}
if(city=='29955'){cname='Gilcrest';}
if(city=='32155'){cname='Greeley';}
if(city=='09280'){cname='Broomfield';}
if(city=='30780'){cname='Glenwood Springs';}
if(city=='70195'){cname='Silt';}
if(city=='43605'){cname='La Salle';}
if(city=='49600'){cname='Mead';}
if(city=='54330'){cname='Northglenn';}
if(city=='07410'){cname='Blue River';}
if(city=='20440'){cname='Dillon';}
if(city=='70525'){cname='Silverthorne';}
if(city=='20770'){cname='Dolores';}
if(city=='59005'){cname='Pierce';}
if(city=='69150'){cname='Severance';}
if(city=='77290'){cname='Thornton';}
if(city=='34740'){cname='Haswell';}
if(city=='06090'){cname='Bennett';}
if(city=='03455'){cname='Arvada';}
if(city=='21265'){cname='Dove Creek';}
if(city=='55870'){cname='Ophir';}
if(city=='37545'){cname='Hotchkiss';}
if(city=='12045'){cname='Carbondale';}
if(city=='53395'){cname='New Castle';}
if(city=='64255'){cname='Rifle';}
if(city=='86750'){cname='Yuma';}
if(city=='31660'){cname='Grand Junction';}
if(city=='35070'){cname='Hayden';}
if(city=='55155'){cname='Oak Creek';}
if(city=='76795'){cname='Telluride';}
if(city=='86475'){cname='Yampa';}
if(city=='52550'){cname='Mountain Village';}
if(city=='04110'){cname='Avon';}
if(city=='54880'){cname='Norwood';}
if(city=='50920'){cname='Minturn';}
if(city=='63265'){cname='Red Cliff';}
if(city=='04935'){cname='Basalt';}
if(city=='00760'){cname='Aguilar';}
if(city=='73715'){cname='Starkville';}
if(city=='43550'){cname='Larkspur';}
if(city=='08070'){cname='Bow Mar';}
if(city=='13845'){cname='Cherry Hills Village';}
if(city=='34960'){cname='Haxtun';}
if(city=='57245'){cname='Paoli';}
if(city=='16385'){cname='Columbine Valley';}
if(city=='28105'){cname='Foxfield';}
if(city=='30340'){cname='Glendale';}
if(city=='69645'){cname='Sheridan';}
if(city=='12815'){cname='Centennial';}
if(city=='37270'){cname='Holyoke';}
if(city=='37380'){cname='Hooper';}
if(city=='42055'){cname='La Jara';}
if(city=='65740'){cname='Romeo';}
if(city=='02355'){cname='Antonito';}
if(city=='48060'){cname='Manassa';}
if(city=='46465'){cname='Loveland';}
if(city=='77510'){cname='Timnath';}
if(city=='33640'){cname='Gunnison';}
if(city=='48555'){cname='Marble';}
if(city=='52570'){cname='Mount Crested Butte';}
if(city=='31550'){cname='Granada';}
if(city=='37215'){cname='Holly';}
if(city=='43110'){cname='Lamar';}
if(city=='85045'){cname='Wiley';}
if(city=='12855'){cname='Center';}
if(city=='12387'){cname='Castle Pines';}
if(city=='69040'){cname='Seibert';}
if(city=='29680'){cname='Genoa';}
if(city=='37875'){cname='Hugo';}
if(city=='04000'){cname='Aurora';}
if(city=='16495'){cname='Commerce City';}
if(city=='26270'){cname='Federal Heights';}
if(city=='83835'){cname='Westminster';}
if(city=='44980'){cname='Limon';}
if(city=='14765'){cname='City of Creede';}
if(city=='44100'){cname='La Veta';}
if(city=='20000'){cname='Denver';}
if(city=='70250'){cname='Silver Cliff';}
if(city=='83450'){cname='Westcliffe';}
if(city=='19795'){cname='Del Norte';}
if(city=='51635'){cname='Monte Vista';}
if(city=='25280'){cname='Evans';}
if(city=='50480'){cname='Milliken';}
if(city=='60160'){cname='Platteville';}
if(city=='80040'){cname='Vail';}
if(city=='26600'){cname='Firestone';}
if(city=='28360'){cname='Frederick';}
if(city=='62000'){cname='Pueblo';}
if(city=='41010'){cname='Kit Carson';}
if(city=='03235'){cname='Arriba';}
if(city=='15550'){cname='Cokedale';}
if(city=='07190'){cname='Blanca';}
if(city=='24785'){cname='Englewood';}
if(city=='33035'){cname='Greenwood Village';}
if(city=='19630'){cname='Deer Trail';}
if(city=='43000'){cname='Lakewood';}
if(city=='30835'){cname='Golden';}
if(city=='84440'){cname='Wheat Ridge';}
if(city=='45255'){cname='Littleton';}
if(city=='42495'){cname='Lakeside';}
if(city=='75640'){cname='Superior';}
if(city=='01090'){cname='Alamosa';}
if(city=='41835'){cname='Lafayette';}
if(city=='82735'){cname='Ward';}
if(city=='22035'){cname='Durango';}
if(city=='64090'){cname='Rico';}
if(city=='22145'){cname='Eads';}
if(city=='69700'){cname='Sheridan Lake';}
if(city=='07025'){cname='Black Hawk';}
if(city=='67830'){cname='Sanford';}
if(city=='22200'){cname='Eagle';}
if(city=='33695'){cname='Gypsum';}
if(city=='59830'){cname='Pitkin';}
if(city=='56365'){cname='Otis';}

return cname;
}

//fips to county name lookup
function countylookup(county){

var cn_name;

if(county=='053'){cn_name='Hinsdale';}
if(county=='029'){cn_name='Delta';}
if(county=='047'){cn_name='Gilpin';}
if(county=='023'){cn_name='Costilla';}
if(county=='057'){cn_name='Jackson';}
if(county=='015'){cn_name='Chaffee';}
if(county=='039'){cn_name='Elbert';}
if(county=='119'){cn_name='Teller';}
if(county=='099'){cn_name='Prowers';}
if(county=='115'){cn_name='Sedgwick';}
if(county=='031'){cn_name='Denver';}
if(county=='105'){cn_name='Rio Grande';}
if(county=='083'){cn_name='Montezuma';}
if(county=='081'){cn_name='Moffat';}
if(county=='021'){cn_name='Conejos';}
if(county=='067'){cn_name='La Plata';}
if(county=='033'){cn_name='Dolores';}
if(county=='063'){cn_name='Kit Carson';}
if(county=='123'){cn_name='Weld';}
if(county=='061'){cn_name='Kiowa';}
if(county=='109'){cn_name='Saguache';}
if(county=='121'){cn_name='Washington';}
if(county=='007'){cn_name='Archuleta';}
if(county=='009'){cn_name='Baca';}
if(county=='035'){cn_name='Douglas';}
if(county=='101'){cn_name='Pueblo';}
if(county=='037'){cn_name='Eagle';}
if(county=='095'){cn_name='Phillips';}
if(county=='103'){cn_name='Rio Blanco';}
if(county=='107'){cn_name='Routt';}
if(county=='117'){cn_name='Summit';}
if(county=='001'){cn_name='Adams';}
if(county=='075'){cn_name='Logan';}
if(county=='085'){cn_name='Montrose';}
if(county=='045'){cn_name='Garfield';}
if(county=='041'){cn_name='El Paso';}
if(county=='079'){cn_name='Mineral';}
if(county=='093'){cn_name='Park';}
if(county=='055'){cn_name='Huerfano';}
if(county=='011'){cn_name='Bent';}
if(county=='019'){cn_name='Clear Creek';}
if(county=='065'){cn_name='Lake';}
if(county=='017'){cn_name='Cheyenne';}
if(county=='071'){cn_name='Las Animas';}
if(county=='027'){cn_name='Custer';}
if(county=='003'){cn_name='Alamosa';}
if(county=='125'){cn_name='Yuma';}
if(county=='077'){cn_name='Mesa';}
if(county=='049'){cn_name='Grand';}
if(county=='091'){cn_name='Ouray';}
if(county=='051'){cn_name='Gunnison';}
if(county=='113'){cn_name='San Miguel';}
if(county=='087'){cn_name='Morgan';}
if(county=='069'){cn_name='Larimer';}
if(county=='089'){cn_name='Otero';}
if(county=='097'){cn_name='Pitkin';}
if(county=='073'){cn_name='Lincoln';}
if(county=='025'){cn_name='Crowley';}
if(county=='111'){cn_name='San Juan';}
if(county=='043'){cn_name='Fremont';}
if(county=='059'){cn_name='Jefferson';}
if(county=='005'){cn_name='Arapahoe';}
if(county=='014'){cn_name='Broomfield';}
if(county=='013'){cn_name='Boulder';}

return cn_name;
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
var dtime = layer.feature.properties.CL_RE_DATE;

var slar=$('#sl1').data('slider').getValue();  //get slider value - range as an array of two decimal values
var minyear=slar[0];  //slider 'from' date  - year with month as decimal
var maxyear=slar[1];  //slider 'to' date  - year with month as decimal

var curdate=new Date(dtime); //turns clerk and recorder date into a javascrip date object
var curyear=curdate.getUTCFullYear(); //get year only from date object
var curmonth=(curdate.getUTCMonth() + 1)/12; //turns decimal value into actual month

  //if feature is the baselayer
if(dtime === null){
	if($('#ialign').prop('checked')===true){ //and if 'only show annexations' is checked
    return; //do nothing - no highlight, exit function
	  }else{ //and if 'only show annexations' is NOT checked
	  		layer.setStyle({  //add a yellow highlight around the feature
			weight: 2,
			opacity: 1,
			color: 'yellow'
		});
	layer.bringToFront();	 //and bring that feature to the front (so other boundaries dont obscure the new highlighted boundaries)
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
	layer.bringToFront();	//and bring that feature to the front (so other boundaries dont obscure the new highlighted boundaries)
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
layer.bringToFront();
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
  "Mapquest Imagery": mapquestOAM,
  "Mapquest Hybrid": mapquestHYB,
  "ESRI Topographic": esritopo,
  "OpenStreetMap Simple": mbmap1,
  "OpenStreetMap Terrain": mbmap2, 
};

//overlay layers for grouped layer control plugin
var groupedOverlays = {
  "Layers": {
	"<img src='assets/img/muni.png' width='24' height='28'>&nbsp;Boundaries & Annexations": annexations,
	"<img src='assets/img/deannex.png' width='24' height='28'>&nbsp;De-Annexations": deannex,	
	"<img src='assets/img/county.png' width='24' height='28'>&nbsp;County Lines": counties
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

