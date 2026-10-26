import fs from "node:fs";
import { createRequire } from "node:module";
import { feature } from "topojson-client";
import { geoNaturalEarth1, geoPath, geoCentroid } from "d3-geo";
const require = createRequire(import.meta.url);
const iso = require("i18n-iso-countries");
iso.registerLocale(require("i18n-iso-countries/langs/en.json"));
const read = (name) => JSON.parse(fs.readFileSync(require.resolve(name), "utf8"));
const world = feature(read("world-atlas/countries-110m.json"), read("world-atlas/countries-110m.json").objects.countries);
world.features = world.features.filter(f => f.id !== "010");

function separateFrenchGuiana(collection) {
  const france = collection.features.find(f => f.id === "250");
  if (!france || france.geometry.type !== "MultiPolygon") throw new Error("France geometry missing");
  const inGuiana = polygon => polygon[0].every(([lon,lat]) => lon > -55 && lon < -50 && lat > 1 && lat < 7);
  const guiana = france.geometry.coordinates.filter(inGuiana);
  if (!guiana.length) throw new Error("French Guiana geometry missing");
  france.geometry.coordinates = france.geometry.coordinates.filter(p => !inGuiana(p));
  collection.features = collection.features.filter(f => f.id !== "254");
  collection.features.push({type:"Feature",id:"254",properties:{name:"French Guiana"},geometry:{type:"MultiPolygon",coordinates:guiana}});
}
separateFrenchGuiana(world);

const projection = geoNaturalEarth1().fitExtent([[10,10],[990,490]], world);
const path = geoPath(projection).digits(2);
const details = feature(read("world-atlas/countries-10m.json"), read("world-atlas/countries-10m.json").objects.countries);
separateFrenchGuiana(details);
const countries = Object.entries(iso.getNames("en", {select:"official"})).filter(([code]) => code !== "AQ").map(([code,name]) => {
  const id = iso.alpha2ToNumeric(code);
  const shape = world.features.find(f => f.id === id);
  const detail = details.features.find(f => f.id === id);
  const center = code === "BM" ? projection([-64.75,32.3]) : detail ? projection(geoCentroid(detail)) : null;
  const tiny = !shape || path.area(shape) < 24;
  return {code,name,type:"country",d:shape ? path(shape) : null, marker:tiny ? center?.map(v=>Math.round(v*100)/100) : null};
});
const abbreviations = "AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split(" ");
const fips = "01 02 04 05 06 08 09 10 11 12 13 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 44 45 46 47 48 49 50 51 53 54 55 56".split(" ");
const usa = read("us-atlas/states-albers-10m.json");
const states = feature(usa,usa.objects.states).features.filter(f=>fips.includes(f.id)).map(f=>({
 code:"US-"+abbreviations[fips.indexOf(f.id)], name:f.properties.name, type:"state", d:geoPath().digits(2)(f),
}));
fs.writeFileSync("src/data/travelMaps.json",JSON.stringify({countries,states}));
console.log(countries.length+" countries/territories; "+states.length+" states/DC; Bermuda marker: "+JSON.stringify(countries.find(p=>p.code==="BM").marker));

