var map, theaterSearch = [], museumSearch = [], featsimplify=0, countyweight=4;

$(document).ready(function() {
  getViewport();
});

function getViewport() {

    map.setActiveArea({
      position: "absolute",
      top: "0px",
      left: "0px",
      right: "0px",
      height: $("#map").css("height")
    });

}


if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
 $('.slider').width('50px');
 featsimplify=0.8;
}






/* Basemap Layers */
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
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"]
}), L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/hyb/{z}/{x}/{y}.png", {
  maxZoom: 19,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
  attribution: 'Labels courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
})]);


	    var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ',
			mbUrl = 'https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png';

	    var mbmap1   = L.tileLayer(mbUrl, {id: 'statecodemog.map-i4mhpeb3', attribution: mbAttr});
	    var mbmap2   = L.tileLayer(mbUrl, {id: 'statecodemog.map-392qgzze', attribution: mbAttr});


var esritopo = L.esri.basemapLayer("Topographic",{attribution: 'Tiles courtesy of ESRI.'});
var esrisat = L.esri.basemapLayer("Imagery",{attribution: 'Tiles courtesy of ESRI.'});


map = L.map("map", {
  zoom: 12,
  center: [39.8, -105],
  layers: [esritopo],
  zoomControl: false,
  attributionControl: false
});



var counties = L.esri.featureLayer('http://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/County_Line_2012/FeatureServer/0', {
    simplifyFactor: 0.5,
    style: function (feature) {
        return {color: 'black', weight: countyweight };
    }
  }).addTo(map);; 
  
  
var annexations = L.esri.featureLayer('http://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/Web_Annexations06052015/FeatureServer/0', {
    simplifyFactor: featsimplify,
    style: function (feature) {
		return getcitystyle(feature);
    },
	onEachFeature: createPopup
  }).addTo(map);
  

$('.slider').slider();

 $('.slider').on('slideStop', function(ev){
 
 //custom redraw function
annexations.eachFeature(function(layer){
  annexations.setFeatureStyle(layer.feature.id, getcitystyle(layer.feature));
});


	});;
	


map.on('zoomend', function() {

var zoomlev=map.getZoom();
console.log(map.getZoom());

featsimplify=0;
if(zoomlev<14){featsimplify=0.1;countyweight=4;}
if(zoomlev<13){featsimplify=0.2;countyweight=4;}
if(zoomlev<12){featsimplify=0.3;countyweight=3;}
if(zoomlev<11){featsimplify=0.4;countyweight=3;}
if(zoomlev<10){featsimplify=0.5;countyweight=3;}
if(zoomlev<9){featsimplify=0.6;countyweight=2;}
if(zoomlev<8){featsimplify=0.7;countyweight=2;}
if(zoomlev<7){featsimplify=0.8;countyweight=2;}

if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
 $('.slider').width('50px');
 featsimplify=0.8;
}

counties.setStyle({color: 'black', weight: countyweight });

});
	
$(':checkbox').change(function() {

annexations.eachFeature(function(layer){
  annexations.setFeatureStyle(layer.feature.id, getcitystyle(layer.feature));
});
	
}); 	
		
  
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


function getcitystyle(feature){

var slar=$('#sl1').data('slider').getValue();
minyear=slar[0];
maxyear=slar[1];
var rawdate=feature.properties.CL_RE_DATE;
var curdate=new Date(rawdate);
var curyear=curdate.getUTCFullYear();
var curmonth=(curdate.getUTCMonth() + 1)/12;

if(rawdate === null){
	if($('#ialign').prop('checked')===true)
	  return {fillColor: 'rgb(0,0,0)', weight: 1, opacity: 0.6, color: 'rgb(0,0,0)', fillOpacity: 0.04};
}else{

	  if((curyear+curmonth)<=minyear){
	  return {fillColor: 'rgb(0,0,0)', weight: 1, opacity: 0.6, color: 'rgb(0,0,0)', fillOpacity: 0.04};
	  } //dont show all before this date
	  
	  if((curyear+curmonth)>=maxyear){
	  return {fillColor: 'rgb(0,0,0)', weight: 1, opacity: 0.6, color: 'rgb(0,0,0)', fillOpacity: 0.04};
	  } //dont show all after this date
}
	  
	  
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
        return {fillColor: 'purple', weight: 2, opacity: 1, color: 'purple', fillOpacity: 0.2};
      }
	  

  }

function resetcitystyle(cityname, dtime){

var slar=$('#sl1').data('slider').getValue();
minyear=slar[0];
maxyear=slar[1];

var rawdate=dtime;
var curdate=new Date(rawdate);
var curyear=curdate.getUTCFullYear();
var curmonth=(curdate.getUTCMonth() + 1)/12;

if(rawdate === null){
	if($('#ialign').prop('checked')===true)
	  return {fillColor: 'rgb(0,0,0)', weight: 1, opacity: 0.6, color: 'rgb(0,0,0)', fillOpacity: 0.04};
}else{

	  if((curyear+curmonth)<=minyear){
	  return {fillColor: 'rgb(0,0,0)', weight: 1, opacity: 0.6, color: 'rgb(0,0,0)', fillOpacity: 0.04};
	  } //dont show all before this date
	  
	  if((curyear+curmonth)>=maxyear){
	  return {fillColor: 'rgb(0,0,0)', weight: 1, opacity: 0.6, color: 'rgb(0,0,0)', fillOpacity: 0.04};
	  } //dont show all after this date
}  
	  
	  	  
	  
	  if(cityname === 'Aguilar'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Akron'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Alamosa'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Alma'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Antonito'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Arriba'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Arvada'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(cityname === 'Aspen'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Ault'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Aurora'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Avon'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Basalt'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Bayfield'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(cityname === 'Bennett'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Berthoud'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Bethune'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Black Hawk'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Blanca'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Blue River'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};

      }else if(cityname === 'Bonanza'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Boone'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Boulder'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Bow Mar'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Branson'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Breckenridge'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(cityname === 'Brighton'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Brookside'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Broomfield'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Brush'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Buena Vista'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Burlington'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(cityname === 'Calhan'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Campo'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Canon City'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Carbondale'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Castle Pines'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Castle Rock'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(cityname === 'Cedaredge'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Centennial'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Center'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Central City'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Cheraw'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Cherry Hills Village'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};


      }else if(cityname === 'Cheyenne Wells'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'City of Creede'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Coal Creek'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Cokedale'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Collbran'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Colorado Springs'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(cityname === 'Columbine Valley'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Commerce City'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Cortez'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Craig'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Crawford'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Crested Butte'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(cityname === 'Crestone'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Cripple Creek'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Crook'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Crowley'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Dacono'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'De Beque'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(cityname === 'Deer Trail'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Del Norte'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Delta'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Denver'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Dillon'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Dinosaur'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(cityname === 'Dolores'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Dove Creek'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Durango'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Eads'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Eagle'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Eaton'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};

      }else if(cityname === 'Eckley'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Edgewater'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Elizabeth'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Empire'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Englewood'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Erie'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(cityname === 'Estes Park'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Evans'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Fairplay'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Federal Heights'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Firestone'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Flagler'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(cityname === 'Fleming'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Florence'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Fort Collins'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Fort Lupton'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Fort Morgan'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Fountain'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};

      }else if(cityname === 'Fowler'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Foxfield'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Fraser'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Frederick'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Frisco'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Fruita'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(cityname === 'Garden City'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Genoa'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Georgetown'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Gilcrest'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Glendale'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Glenwood Springs'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(cityname === 'Golden'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Granada'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Granby'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Grand Junction'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Grand Lake'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Greeley'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(cityname === 'Green Mountain Falls'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Greenwood Village'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Grover'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Gunnison'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Gypsum'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Hartman'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(cityname === 'Haswell'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Haxtun'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Hayden'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Hillrose'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Holly'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Holyoke'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(cityname === 'Hooper'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Hot Sulphur Springs'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Hotchkiss'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Hudson'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Hugo'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Idaho Springs'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(cityname === 'Ignacio'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Iliff'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Jamestown'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Johnstown'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Julesburg'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Keenesburg'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(cityname === 'Kersey'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Kim'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Kiowa'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Kit Carson'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Kremmling'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'La Jara'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(cityname === 'La Junta'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'La Salle'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'La Veta'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Lafayette'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Lake City'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Lakeside'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};

      }else if(cityname === 'Lakewood'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Lamar'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Larkspur'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Las Animas'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Leadville'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Limon'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(cityname === 'Littleton'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Lochbuie'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Log Lane Village'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Lone Tree'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Longmont'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Louisville'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};		

      }else if(cityname === 'Loveland'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Lyons'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Manassa'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Mancos'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Manitou Springs'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Manzanola'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};		

      }else if(cityname === 'Marble'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Mead'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};
      }else if(cityname === 'Meeker'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Merino'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Milliken'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Minturn'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(cityname === 'Moffat'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Monte Vista'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Montezuma'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Montrose'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Monument'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Morrison'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(cityname === 'Mount Crested Butte'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Mountain View'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Mountain Village'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Naturita'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Nederland'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'New Castle'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};		

      }else if(cityname === 'Northglenn'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Norwood'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Nucla'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Nunn'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Oak Creek'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Olathe'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(cityname === 'Olney Springs'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Ophir'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Orchard City'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Ordway'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Otis'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Ouray'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(cityname === 'Ovid'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Pagosa Springs'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Palisade'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Palmer Lake'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Paoli'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Paonia'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(cityname === 'Parachute'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Parker'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Peetz'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Pierce'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Pitkin'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Platteville'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(cityname === 'Poncha Springs'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Pritchett'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Pueblo'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Ramah'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Rangely'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Raymer (New Raymer)'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(cityname === 'Red Cliff'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Rico'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Ridgway'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Rifle'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Rockvale'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Rocky Ford'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(cityname === 'Romeo'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Rye'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Saguache'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Salida'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'San Luis'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Sanford'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};		

      }else if(cityname === 'Sawpit'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Sedgwick'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Seibert'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Severance'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Sheridan'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Sheridan Lake'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(cityname === 'Silt'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Silver Cliff'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Silver Plume'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Silverthorne'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Silverton'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Simla'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(cityname === 'Snowmass Village'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'South Fork'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Springfield'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Starkville'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Steamboat Springs'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Sterling'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(cityname === 'Stratton'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Sugar City'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Superior'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Swink'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Telluride'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Thornton'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(cityname === 'Timnath'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Trinidad'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Two Buttes'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Vail'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Victor'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Vilas'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(cityname === 'Vona'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Walden'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Walsenburg'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Walsh'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Ward'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Wellington'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(cityname === 'Westcliffe'){
        return {fillColor: 'rgb(228,26,28)', weight: 2, opacity: 1, color: 'rgb(228,26,28)', fillOpacity: 0.2};
      }else if(cityname === 'Westminster'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Wheat Ridge'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Wiggins'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Wiley'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Williamsburg'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		

      }else if(cityname === 'Windsor'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Winter Park'){
        return {fillColor: 'rgb(55,126,184)', weight: 2, opacity: 1, color: 'rgb(55,126,184)', fillOpacity: 0.2};
      }else if(cityname === 'Woodland Park'){
        return {fillColor: 'rgb(77,175,74)', weight: 2, opacity: 1, color: 'rgb(77,175,74)', fillOpacity: 0.2};
      }else if(cityname === 'Wray'){
        return {fillColor: 'rgb(152,78,163)', weight: 2, opacity: 1, color: 'rgb(152,78,163)', fillOpacity: 0.2};
      }else if(cityname === 'Yampa'){
        return {fillColor: 'rgb(255,127,0)', weight: 2, opacity: 1, color: 'rgb(255,127,0)', fillOpacity: 0.2};
      }else if(cityname === 'Yuma'){
        return {fillColor: 'rgb(166,86,40)', weight: 2, opacity: 1, color: 'rgb(166,86,40)', fillOpacity: 0.2};		
		
      }else {
        return {fillColor: 'purple', weight: 2, opacity: 1, color: 'purple', fillOpacity: 0.2};
      }
  }
    
function createPopup(geojson,layer) {

var slar=$('#sl1').data('slider').getValue();
minyear=slar[0];
maxyear=slar[1];
var rawdate=geojson.properties.CL_RE_DATE;
var curdate=new Date(rawdate);
var curyear=curdate.getUTCFullYear();
var curmonth=(curdate.getUTCMonth() + 1)/12;
var popupText='';
var skip=0;
//console.log(rawdate);

if(rawdate === null){
	//console.log('null');
 popupText = "<div style='max-height:200px;'>" +
 "<h4>" + citylookup(geojson.properties["CITY"]) +
 "</h4><b>Base Layer</b></div>";
}else{
	//console.log('not null');
	  if((curyear+curmonth)<=minyear){
	  skip=1;
	  } //dont show all before this date
	  
	  if((curyear+curmonth)>=maxyear){
	  skip=1;
	  } //dont show all after this date

 if (geojson.properties) {
 popupText = "<div style='max-height:200px;'><h5><b>"+geojson.properties["DESCR"]+"</b></h5>" +
 "<table><tr><td><b>City:</b></td><td>" + citylookup(geojson.properties["CITY"])+ "</td></tr>" +
 "<tr><td><b>County:</b></td><td>" + countylookup(geojson.properties["COUNTY"])+ "</td></tr>" +
 "<tr><td><b>Ordinance:&nbsp;&nbsp;&nbsp;&nbsp;</b></td><td>" + geojson.properties["ORD_NUM"]+ "</td></tr>" +
 "<tr><td><b>Reception:</b></td><td>" + geojson.properties["REC_NUM"]+ "</td></tr>" +
 "<tr><td><b>Date:</b></td><td>" + dateformat(geojson.properties["CL_RE_DATE"])+ "</td></tr>" +
 "<tr><td><b>Type:</b></td><td>" + typetranslate(geojson.properties["TYPE"])+ "</td></tr></table>";
 popupText += "</div>";
 }else{skip=1;}
 
 }
 
 if(skip==0){layer.bindPopup(popupText);}
 
    layer.on({
        mouseover: highlightFeatureAnn,
        mouseout: resetHighlightAnn
    });
	
}


function createPopup2(geojson,layer) {
 if (geojson.properties) {
 var popupText = "<div style='max-height:200px;'><h5><b>"+geojson.properties["DESCR"]+"</b></h5>" +
 "<table><tr><td><b>City:</b></td><td>" + citylookup(geojson.properties["CITY"])+ "</td></tr>" +
 "<tr><td><b>County:</b></td><td>" + countylookup(geojson.properties["COUNTY"])+ "</td></tr>" +
 "<tr><td><b>Ordinance:&nbsp;&nbsp;&nbsp;&nbsp;</b></td><td>" + geojson.properties["ORD_NUM"]+ "</td></tr>" +
 "<tr><td><b>Reception:</b></td><td>" + geojson.properties["REC_NUM"]+ "</td></tr>" +
 "<tr><td><b>Date:</b></td><td>" + dateformat(geojson.properties["CL_RE_DATE"])+ "</td></tr>" +
 "<tr><td><b>Type:</b></td><td>" + typetranslate(geojson.properties["TYPE"])+ "</td></tr></table>";
 popupText += "</div>";
 layer.bindPopup(popupText);
 }
      layer.on({
        mouseover: highlightFeatureDe,
        mouseout: resetHighlightDe
    });
}

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

function typetranslate(atype){
var toa;
if(atype=='A'){toa='Annexation';}
if(atype=='D'){toa='De-Annexation';}
return toa;
}

function dateformat(cdate){
var d = new Date(cdate);

var month, day, year;

day = d.getUTCDate();
year = d.getUTCFullYear();
month = d.getUTCMonth() + 1;

return month+"/"+day+"/"+year;
}

function retlatlng(city){
var rlat, rlng, latlng;

if(city=='09555'){rlat='40.2581364';rlng='-103.6321599';}
if(city=='36610'){rlat='40.3246539';rlng='-103.5221746';}
if(city=='45695'){rlat='40.2702304';rlng='-103.8293819';}
if(city=='84770'){rlat='40.226588';rlng='-104.0734981';}
if(city=='33310'){rlat='40.869111';rlng='-104.2259321';}
if(city=='13460'){rlat='38.1081042';rlng='-103.5109264';}
if(city=='48500'){rlat='38.1088247';rlng='-103.8667782';}
if(city=='08345'){rlat='37.0154926';rlng='-103.883777';}
if(city=='78610'){rlat='37.1731573';rlng='-104.4903263';}
if(city=='40570'){rlat='37.2470622';rlng='-103.3534114';}
if(city=='26875'){rlat='40.6817711';rlng='-102.839443';}
if(city=='58235'){rlat='40.9620456';rlng='-103.114231';}
if(city=='43660'){rlat='38.0696677';rlng='-103.2232289';}
if(city=='28690'){rlat='39.5784823';rlng='-106.0909729';}
if(city=='53120'){rlat='38.2185544';rlng='-108.5682864';}
if(city=='54935'){rlat='38.2665342';rlng='-108.5487156';}
if(city=='55540'){rlat='38.6083188';rlng='-107.9828407';}
if(city=='17375'){rlat='37.3497833';rlng='-108.576687';}
if(city=='66895'){rlat='37.9212814';rlng='-104.932135';}
if(city=='28305'){rlat='39.9233235';rlng='-105.805286';}
if(city=='31715'){rlat='40.2466515';rlng='-105.825629';}
if(city=='37600'){rlat='40.0748337';rlng='-106.1024857';}
if(city=='41560'){rlat='40.0565429';rlng='-106.3781604';}
if(city=='85705'){rlat='39.8778206';rlng='-105.7828131';}
if(city=='18310'){rlat='38.8677359';rlng='-106.9772664';}
if(city=='23740'){rlat='39.3610149';rlng='-104.6061722';}
if(city=='40790'){rlat='39.3435303';rlng='-104.4571759';}
if(city=='27425'){rlat='40.5482164';rlng='-105.0648327';}
if(city=='86310'){rlat='40.0799527';rlng='-102.2286219';}
if(city=='49875'){rlat='40.0497998';rlng='-107.8953553';}
if(city=='00925'){rlat='40.1643821';rlng='-103.2206849';}
if(city=='62880'){rlat='40.0951768';rlng='-108.7567395';}
if(city=='17760'){rlat='40.5170341';rlng='-107.5556743';}
if(city=='20495'){rlat='40.2405515';rlng='-109.0085896';}
if(city=='68655'){rlat='37.9946211';rlng='-108.0011887';}
if(city=='19080'){rlat='40.0635207';rlng='-104.9468043';}
if(city=='85485'){rlat='40.4775548';rlng='-104.9167996';}
if(city=='39855'){rlat='40.3897894';rlng='-104.9694426';}
if(city=='45530'){rlat='40.0104959';rlng='-104.7244844';}
if(city=='63045'){rlat='40.6077583';rlng='-103.8443288';}
if(city=='37820'){rlat='40.0783878';rlng='-104.641005';}
if(city=='45970'){rlat='40.1698416';rlng='-105.0990063';}
if(city=='22860'){rlat='40.5251809';rlng='-104.7133079';}
if(city=='40515'){rlat='40.3874297';rlng='-104.5658661';}
if(city=='82350'){rlat='37.6305976';rlng='-104.7817193';}
if(city=='19355'){rlat='39.2757332';rlng='-108.1934051';}
if(city=='34520'){rlat='38.1211183';rlng='-102.2216521';}
if(city=='73825'){rlat='40.4755865';rlng='-106.8229348';}
if(city=='09115'){rlat='38.4135431';rlng='-105.1910599';}
if(city=='11810'){rlat='38.441889';rlng='-105.2208915';}
if(city=='08400'){rlat='39.4996193';rlng='-106.0432924';}
if(city=='51690'){rlat='39.5817064';rlng='-105.8680708';}
if(city=='82130'){rlat='40.7315839';rlng='-106.2813362';}
if(city=='11645'){rlat='37.1047115';rlng='-102.5787984';}
if(city=='06530'){rlat='39.3038224';rlng='-102.4234144';}
if(city=='10600'){rlat='39.3044913';rlng='-102.2714626';}
if(city=='57630'){rlat='39.5041671';rlng='-104.7731726';}
if(city=='56420'){rlat='38.0274298';rlng='-107.6735796';}
if(city=='03620'){rlat='39.1949512';rlng='-106.8370022';}
if(city=='71755'){rlat='39.2168719';rlng='-106.9439737';}
if(city=='14175'){rlat='38.8192016';rlng='-102.3520301';}
if(city=='11260'){rlat='39.0344381';rlng='-104.2991386';}
if(city=='16000'){rlat='38.8672553';rlng='-104.760749';}
if(city=='27975'){rlat='38.1296307';rlng='-104.0256731';}
if(city=='26765'){rlat='39.2954912';rlng='-103.0767068';}
if(city=='74485'){rlat='39.3028828';rlng='-102.6034734';}
if(city=='27810'){rlat='40.2560287';rlng='-103.791319';}
if(city=='19850'){rlat='38.7573724';rlng='-108.0879591';}
if(city=='65190'){rlat='38.0502122';rlng='-103.722672';}
if(city=='75970'){rlat='38.014148';rlng='-103.6281626';}
if(city=='38590'){rlat='40.7583326';rlng='-103.0661277';}
if(city=='73935'){rlat='40.6207055';rlng='-103.1918666';}
if(city=='27865'){rlat='38.6995803';rlng='-104.6997575';}
if(city=='51800'){rlat='39.0723568';rlng='-104.8544673';}
if(city=='86090'){rlat='38.998846';rlng='-105.059362';}
if(city=='81690'){rlat='39.3021195';rlng='-102.7433516';}
if(city=='74815'){rlat='38.2327735';rlng='-103.663312';}
if(city=='18750'){rlat='38.193506';rlng='-103.8597438';}
if(city=='55705'){rlat='38.1662739';rlng='-103.9444914';}
if(city=='56145'){rlat='38.2208983';rlng='-103.7566795';}
if(city=='51745'){rlat='38.4691724';rlng='-107.8606814';}
if(city=='70635'){rlat='39.1410514';rlng='-104.0817538';}
if(city=='23025'){rlat='40.1124668';rlng='-102.4885454';}
if(city=='48445'){rlat='38.8576016';rlng='-104.9124294';}
if(city=='57025'){rlat='39.1134646';rlng='-104.8998058';}
if(city=='62660'){rlat='39.1222376';rlng='-104.1673343';}
if(city=='72395'){rlat='37.6691859';rlng='-106.6428506';}
if(city=='15330'){rlat='38.362038';rlng='-105.1417822';}
if(city=='67280'){rlat='38.5302746';rlng='-105.9987836';}
if(city=='32650'){rlat='38.9349535';rlng='-105.0197128';}
if(city=='18530'){rlat='38.7461495';rlng='-105.1840415';}
if(city=='80865'){rlat='38.7089964';rlng='-105.1418451';}
if(city=='73330'){rlat='37.4049147';rlng='-102.6188979';}
if(city=='79270'){rlat='37.5606642';rlng='-102.3965556';}
if(city=='81030'){rlat='37.3736643';rlng='-102.4474163';}
if(city=='27040'){rlat='38.3798264';rlng='-105.0981068';}
if(city=='64970'){rlat='38.3647129';rlng='-105.1647789';}
if(city=='85155'){rlat='38.3839839';rlng='-105.1711794';}
if(city=='44320'){rlat='39.2466926';rlng='-106.2935085';}
if(city=='57400'){rlat='39.4500473';rlng='-108.0554814';}
if(city=='42330'){rlat='38.0305035';rlng='-107.310176';}
if(city=='10105'){rlat='38.829332';rlng='-106.1395147';}
if(city=='60600'){rlat='38.5188435';rlng='-106.0725763';}
if(city=='42110'){rlat='37.9794141';rlng='-103.5473359';}
if(city=='25115'){rlat='40.3771167';rlng='-105.5255142';}
if(city=='83230'){rlat='40.6993664';rlng='-105.0058254';}
if(city=='48115'){rlat='37.3465969';rlng='-108.2938563';}
if(city=='45955'){rlat='39.5307441';rlng='-104.8710315';}
if(city=='12415'){rlat='39.3760887';rlng='-104.8534873';}
if(city=='18640'){rlat='40.8587523';rlng='-102.8013919';}
if(city=='55980'){rlat='38.8140588';rlng='-107.9675415';}
if(city=='50040'){rlat='40.4848253';rlng='-103.353616';}
if(city=='07571'){rlat='38.2966071';rlng='-106.1418725';}
if(city=='18420'){rlat='37.9944971';rlng='-105.6962726';}
if(city=='51250'){rlat='38.001997';rlng='-105.9054555';}
if(city=='67005'){rlat='38.0862474';rlng='-106.140876';}
if(city=='24620'){rlat='39.7597104';rlng='-105.6828128';}
if(city=='29735'){rlat='39.7212978';rlng='-105.6940293';}
if(city=='70360'){rlat='39.6954455';rlng='-105.7266659';}
if(city=='12635'){rlat='38.8941372';rlng='-107.9254979';}
if(city=='17925'){rlat='38.7051833';rlng='-107.6100607';}
if(city=='57300'){rlat='38.8698236';rlng='-107.5914328';}
if(city=='15605'){rlat='39.2400163';rlng='-107.9639562';}
if(city=='28745'){rlat='39.1539597';rlng='-108.7281959';}
if(city=='64200'){rlat='38.1591283';rlng='-107.7531109';}
if(city=='61315'){rlat='37.3700091';rlng='-102.8587491';}
if(city=='82460'){rlat='37.3861074';rlng='-102.2799331';}
if(city=='56970'){rlat='39.1074041';rlng='-108.3590873';}
if(city=='52075'){rlat='39.6256127';rlng='-105.2079187';}
if(city=='05265'){rlat='37.235248';rlng='-107.594814';}
if(city=='38535'){rlat='37.1177293';rlng='-107.6374599';}
if(city=='70580'){rlat='37.8110924';rlng='-107.6646431';}
if(city=='46355'){rlat='39.9695323';rlng='-105.1432151';}
if(city=='31605'){rlat='40.0369893';rlng='-105.9001735';}
if(city=='68105'){rlat='37.2023412';rlng='-105.4224685';}
if(city=='39965'){rlat='40.9849884';rlng='-102.2625798';}
if(city=='56475'){rlat='40.9605638';rlng='-102.3883521';}
if(city=='68930'){rlat='40.9350683';rlng='-102.5256738';}
if(city=='23135'){rlat='39.7508196';rlng='-105.0626154';}
if(city=='52350'){rlat='39.7747762';rlng='-105.056711';}
if(city=='40185'){rlat='40.1129317';rlng='-104.4891625';}
if(city=='55045'){rlat='40.7119165';rlng='-104.7898035';}
if(city=='56860'){rlat='37.2636043';rlng='-107.0035304';}
if(city=='07850'){rlat='40.027443';rlng='-105.2517397';}
if(city=='39195'){rlat='40.1170784';rlng='-105.3890478';}
if(city=='47070'){rlat='40.2230503';rlng='-105.2686649';}
if(city=='53175'){rlat='39.9638145';rlng='-105.5058636';}
if(city=='12910'){rlat='39.7957904';rlng='-105.5148347';}
if(city=='38370'){rlat='39.7489232';rlng='-105.5047595';}
if(city=='07795'){rlat='38.2504446';rlng='-104.2607921';}
if(city=='01530'){rlat='39.2859424';rlng='-106.0663188';}
if(city=='25610'){rlat='39.2237796';rlng='-105.9940054';}
if(city=='06255'){rlat='40.2846755';rlng='-104.9655277';}
if(city=='03950'){rlat='40.5834537';rlng='-104.7339622';}
if(city=='08675'){rlat='39.9647901';rlng='-104.7965815';}
if(city=='24950'){rlat='40.0403513';rlng='-105.0393651';}
if(city=='27700'){rlat='40.0815029';rlng='-104.7985443';}
if(city=='29185'){rlat='40.3945914';rlng='-104.689494';}
if(city=='29955'){rlat='40.2841561';rlng='-104.7820241';}
if(city=='32155'){rlat='40.4140338';rlng='-104.7710426';}
if(city=='09280'){rlat='39.9533825';rlng='-105.052125';}
if(city=='30780'){rlat='39.5506256';rlng='-107.3243083';}
if(city=='70195'){rlat='39.5476476';rlng='-107.6540731';}
if(city=='43605'){rlat='40.3485246';rlng='-104.7059273';}
if(city=='49600'){rlat='40.2269833';rlng='-104.9883118';}
if(city=='54330'){rlat='39.9111665';rlng='-104.9788396';}
if(city=='07410'){rlat='39.448494';rlng='-106.0367736';}
if(city=='20440'){rlat='39.6258809';rlng='-106.0437282';}
if(city=='70525'){rlat='39.6540115';rlng='-106.0924425';}
if(city=='20770'){rlat='37.4739905';rlng='-108.4998236';}
if(city=='59005'){rlat='40.6334989';rlng='-104.7551784';}
if(city=='69150'){rlat='40.5394415';rlng='-104.8701214';}
if(city=='77290'){rlat='39.9194198';rlng='-104.9428083';}
if(city=='34740'){rlat='38.4524512';rlng='-103.1648963';}
if(city=='06090'){rlat='39.7459901';rlng='-104.4428415';}
if(city=='03455'){rlat='39.8337279';rlng='-105.1503061';}
if(city=='21265'){rlat='37.766665';rlng='-108.9062972';}
if(city=='55870'){rlat='37.8568401';rlng='-107.8290229';}
if(city=='37545'){rlat='38.7990234';rlng='-107.7135945';}
if(city=='12045'){rlat='39.3946164';rlng='-107.2144748';}
if(city=='53395'){rlat='39.5782893';rlng='-107.5262433';}
if(city=='64255'){rlat='39.5375647';rlng='-107.7703446';}
if(city=='86750'){rlat='40.1244003';rlng='-102.7176124';}
if(city=='31660'){rlat='39.0890618';rlng='-108.567452';}
if(city=='35070'){rlat='40.4852407';rlng='-107.2423106';}
if(city=='55155'){rlat='40.2739914';rlng='-106.9570833';}
if(city=='76795'){rlat='37.939664';rlng='-107.8178875';}
if(city=='86475'){rlat='40.1529957';rlng='-106.9084955';}
if(city=='52550'){rlat='37.9323771';rlng='-107.8578543';}
if(city=='04110'){rlat='39.6417972';rlng='-106.5158769';}
if(city=='54880'){rlat='38.1288465';rlng='-108.2917114';}
if(city=='50920'){rlat='39.5355081';rlng='-106.3817274';}
if(city=='63265'){rlat='39.5091435';rlng='-106.37003';}
if(city=='04935'){rlat='39.3581742';rlng='-107.0185568';}
if(city=='00760'){rlat='37.4036257';rlng='-104.6550363';}
if(city=='73715'){rlat='37.1168201';rlng='-104.5232976';}
if(city=='43550'){rlat='39.2297758';rlng='-104.8857575';}
if(city=='08070'){rlat='39.6265942';rlng='-105.0509145';}
if(city=='13845'){rlat='39.6374175';rlng='-104.9474697';}
if(city=='34960'){rlat='40.6415201';rlng='-102.629539';}
if(city=='57245'){rlat='40.6128708';rlng='-102.472061';}
if(city=='16385'){rlat='39.5995804';rlng='-105.0307708';}
if(city=='28105'){rlat='39.5884054';rlng='-104.7858227';}
if(city=='30340'){rlat='39.7029171';rlng='-104.9360693';}
if(city=='69645'){rlat='39.6477575';rlng='-105.0174566';}
if(city=='12815'){rlat='39.5905678';rlng='-104.8691178';}
if(city=='37270'){rlat='40.5820944';rlng='-102.2984145';}
if(city=='37380'){rlat='37.7459758';rlng='-105.8777353';}
if(city=='42055'){rlat='37.273562';rlng='-105.9598209';}
if(city=='65740'){rlat='37.1718188';rlng='-105.9854141';}
if(city=='02355'){rlat='37.076605';rlng='-106.0102217';}
if(city=='48060'){rlat='37.1738412';rlng='-105.9372749';}
if(city=='46465'){rlat='40.41708';rlng='-105.0618552';}
if(city=='77510'){rlat='40.5330903';rlng='-104.9611929';}
if(city=='33640'){rlat='38.5454785';rlng='-106.9225511';}
if(city=='48555'){rlat='39.0718166';rlng='-107.1904669';}
if(city=='52570'){rlat='38.9084532';rlng='-106.9586725';}
if(city=='31550'){rlat='38.0629749';rlng='-102.3117069';}
if(city=='37215'){rlat='38.0556393';rlng='-102.1245886';}
if(city=='43110'){rlat='38.0747294';rlng='-102.6166823';}
if(city=='85045'){rlat='38.1553555';rlng='-102.7192483';}
if(city=='12855'){rlat='37.7513511';rlng='-106.1101949';}
if(city=='12387'){rlat='39.4625116';rlng='-104.8706198';}
if(city=='69040'){rlat='39.297967';rlng='-102.8695241';}
if(city=='29680'){rlat='39.2783302';rlng='-103.4987858';}
if(city=='37875'){rlat='39.1359624';rlng='-103.4733726';}
if(city=='04000'){rlat='39.6880021';rlng='-104.68974';}
if(city=='16495'){rlat='39.8829676';rlng='-104.795452';}
if(city=='26270'){rlat='39.8645345';rlng='-105.0161592';}
if(city=='83835'){rlat='39.8821898';rlng='-105.0644262';}
if(city=='44980'){rlat='39.2648442';rlng='-103.6837571';}
if(city=='14765'){rlat='37.8533332';rlng='-106.9272837';}
if(city=='44100'){rlat='37.5085623';rlng='-105.0084866';}
if(city=='20000'){rlat='39.7618419';rlng='-104.8812217';}
if(city=='70250'){rlat='38.1292031';rlng='-105.3991892';}
if(city=='83450'){rlat='38.1342035';rlng='-105.4653063';}
if(city=='19795'){rlat='37.6784474';rlng='-106.3539306';}
if(city=='51635'){rlat='37.5785408';rlng='-106.15063';}
if(city=='25280'){rlat='40.3501685';rlng='-104.7483878';}
if(city=='50480'){rlat='40.3105017';rlng='-104.8583837';}
if(city=='60160'){rlat='40.216683';rlng='-104.8240766';}
if(city=='80040'){rlat='39.6375267';rlng='-106.3645261';}
if(city=='26600'){rlat='40.1492606';rlng='-104.9619322';}
if(city=='28360'){rlat='40.1093618';rlng='-104.9652514';}
if(city=='62000'){rlat='38.269934';rlng='-104.6122941';}
if(city=='41010'){rlat='38.7628232';rlng='-102.7953663';}
if(city=='03235'){rlat='39.2840581';rlng='-103.2739025';}
if(city=='15550'){rlat='37.1442226';rlng='-104.6215896';}
if(city=='07190'){rlat='37.4392805';rlng='-105.5135263';}
if(city=='24785'){rlat='39.646505';rlng='-104.9940011';}
if(city=='33035'){rlat='39.6159336';rlng='-104.9116883';}
if(city=='19630'){rlat='39.6158922';rlng='-104.0430066';}
if(city=='43000'){rlat='39.6989417';rlng='-105.1175507';}
if(city=='30835'){rlat='39.742483';rlng='-105.2105614';}
if(city=='84440'){rlat='39.7726754';rlng='-105.1048006';}
if(city=='45255'){rlat='39.5903751';rlng='-105.0200838';}
if(city=='42495'){rlat='39.7790753';rlng='-105.057825';}
if(city=='75640'){rlat='39.9311898';rlng='-105.1590853';}
if(city=='01090'){rlat='37.4750413';rlng='-105.8753137';}
if(city=='41835'){rlat='39.9952679';rlng='-105.0996196';}
if(city=='82735'){rlat='40.073201';rlng='-105.5156209';}
if(city=='22035'){rlat='37.2732673';rlng='-107.8716923';}
if(city=='64090'){rlat='37.6885692';rlng='-108.0314336';}
if(city=='22145'){rlat='38.4813465';rlng='-102.779776';}
if(city=='69700'){rlat='38.4666766';rlng='-102.2941418';}
if(city=='07025'){rlat='39.8010694';rlng='-105.4892237';}
if(city=='67830'){rlat='37.2574248';rlng='-105.900741';}
if(city=='22200'){rlat='39.6344958';rlng='-106.8164019';}
if(city=='33695'){rlat='39.6399706';rlng='-106.9114712';}
if(city=='59830'){rlat='38.6086116';rlng='-106.5164662';}
if(city=='56365'){rlat='40.1501287';rlng='-102.9621385';}

//convert rlat,rlng to point array??

return latlng;
}



function highlightFeatureAnn(e) {
    var layer = e.target;

var dtime = layer.feature.properties.CL_RE_DATE;

var slar=$('#sl1').data('slider').getValue();
minyear=slar[0];
maxyear=slar[1];

var curdate=new Date(dtime);
var curyear=curdate.getUTCFullYear();
var curmonth=(curdate.getUTCMonth() + 1)/12;

if(dtime === null){
	if($('#ialign').prop('checked')===true){
	  return {fillColor: 'rgb(0,0,0)', weight: 1, opacity: 0.6, color: 'rgb(0,0,0)', fillOpacity: 0.04};
	  }else{
	  		layer.setStyle({
			weight: 2,
			opacity: 1,
			color: 'yellow'
		});
	layer.bringToFront();	
	  }
}else{

	  if((curyear+curmonth)<=minyear){
	  layer.setStyle({
fillColor: 'rgb(0,0,0)', weight: 1, opacity: 0.6, color: 'rgb(0,0,0)', fillOpacity: 0.1
	  });
	  } //dont show all before this date
	  
	  if((curyear+curmonth)>=maxyear){
	  layer.setStyle({
fillColor: 'rgb(0,0,0)', weight: 1, opacity: 0.6, color: 'rgb(0,0,0)', fillOpacity: 0.1
	  });
	  } //dont show all after this date
	  
	  if((minyear<=(curyear+curmonth)) && ((curyear+curmonth)<=maxyear)){
		layer.setStyle({
			weight: 3,
			opacity: 1,
			color: 'yellow'
		});
	layer.bringToFront();	
	  }
	  
}
	  
}


function resetHighlightAnn(e) {
    var layer = e.target;
var cityname = e.target.feature.properties.CITYNAME;
var dtime = e.target.feature.properties.CL_RE_DATE;

    layer.setStyle(resetcitystyle(cityname, dtime));

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
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      $("#attribution").html((layer.getAttribution()));
    }
  });
  $("#attribution").find("a").find("img").hide();
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
  position: "bottomright"
});
attributionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution");
  div.innerHTML = "<a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
};
map.addControl(attributionControl);

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

var baseLayers = {
  "Mapquest Imagery": mapquestOAM,
  "Mapquest Hybrid": mapquestHYB,
  "ESRI Topographic": esritopo,
  "OpenStreetMap Simple": mbmap1,
  "OpenStreetMap Terrain": mbmap2, 
};

var groupedOverlays = {
  "Layers": {
	"<img src='assets/img/muni.png' width='24' height='28'>&nbsp;Boundaries & Annexations": annexations,
	"<img src='assets/img/deannex.png' width='24' height='28'>&nbsp;De-Annexations": deannex,	
	"<img src='assets/img/county.png' width='24' height='28'>&nbsp;County Lines": counties
  }
};

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed
}).addTo(map);

/* Highlight search box text on click */
$("#the-basics").click(function () {
  $(this).select();
});


  $("#loading").hide();
  
  
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

 $("#searchbox").click(function () {
  $(this).select();
});

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
	
$('#the-basics .typeahead').on('typeahead:selected', function (e, datum) {
    //console.log(datum);
	searchresult(datum);
}).on('typeahead:autocompleted', function (e, datum) {
    //console.log(datum);
	searchresult(datum);	
});	
	
function searchresult(result){

for(i=1;i<523;i++){
	if(lv[i].n==result.value){
		map.panTo(new L.LatLng(lv[i].lat,lv[i].lng));
		}
	}
}

