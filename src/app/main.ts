/// <amd-dependency path="esri/identity/IdentityManager" name="IdentityManager"/>
/// <amd-dependency path="esri/Map" name="Map"/>
/// <amd-dependency path="esri/views/MapView" name="MapView"/>
/// <amd-dependency path="esri/layers/VectorTileLayer" name="VectorTileLayer"/>
/// <amd-dependency path="esri/portal/Portal" name="Portal"/>
/// <amd-dependency path="esri/portal/PortalQueryParams" name="PortalQueryParams"/>
/// <amd-dependency path="esri/request" name="esriRequest"/>
/// <amd-dependency path="dojo/domReady!"/>

declare var Elm : any;
declare var IdentityManager : any;
declare var Map : any;
declare var MapView : any;
declare var VectorTileLayer : any;
declare var Portal : any;
declare var PortalQueryParams : any;
declare var esriRequest : any;

function container(): HTMLElement {
  let node = document.createElement("div");
  document.body.appendChild(node);
  return node;
}

function asJSON(item) {
  return { id : item.id || ""
  , title : item.title || ""
  , thumbnailUrl : item.itemUrl + "/info/" + item.thumbnail
  , description : item.description || ""
  , accessInformation : item.accessInformation || "Not available"
  , itemUrl : item.itemUrl || ""
  , owner: item.owner || ""
  , snippet : item.snippet || ""
  , avgRating : item.avgRating || 0.0
  , selected : false
  , showmap : false
  };
}

let view = null;

let map = null;

const portal = new Portal();

const query = new PortalQueryParams({ query: 'type:"Vector Tile Service"' });

const mainNode: HTMLElement = container();

const elmApp: any = Elm.embed(Elm.PortalItems, mainNode, { portalItems: { items: [] }});

const updateItems = (items) => elmApp.ports.portalItems.send({ items });

const dealwithit = ({ results }) => updateItems(results.map(asJSON));

// subscribe to Elm app model updates
elmApp.ports.modelChanges.subscribe(model => {
  if (view) {
    view.destroy();
    view = null;
  }
  if (map && map.loaded) {
    map.destroy();
    map = null;
  }
  let forShow = model.items.filter(x => x.showmap);
  if (forShow.length) {
    let model = forShow.shift();
    // DOM not complete when this signal
    // fires. Need a slight delay
    setTimeout(() => {
      let node = document.querySelector(".view-div");
      map = new Map();
      view = new MapView({
        container: node,
        map: map,
        center: [-100.33, 25.69],
        zoom: 10
      });
      let tileLyr = new VectorTileLayer({
        url: model.itemUrl + "/resources/styles/root.json"
      });
      map.add(tileLyr);
    }, 500);
  }
});

portal.queryItems(query).then(dealwithit);

export default elmApp;
