import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { supabase } from "../services/supabase";
import { useUser } from "../context/UserContext";

const cities = [
  {
    city: "New York City",
    state: "New York",
    longitude: -74.006,
    latitude: 40.7128,
  },
  {
    city: "Los Angeles",
    state: "California",
    longitude: -118.2437,
    latitude: 34.0522,
  },
  {
    city: "Chicago",
    state: "Illinois",
    longitude: -87.6298,
    latitude: 41.8781,
  },
  { city: "Houston", state: "Texas", longitude: -95.3698, latitude: 29.7604 },
  { city: "Phoenix", state: "Arizona", longitude: -112.074, latitude: 33.4484 },
  {
    city: "Philadelphia",
    state: "Pennsylvania",
    longitude: -75.1652,
    latitude: 39.9526,
  },
  {
    city: "San Antonio",
    state: "Texas",
    longitude: -98.4936,
    latitude: 29.4241,
  },
  {
    city: "San Diego",
    state: "California",
    longitude: -117.1611,
    latitude: 32.7157,
  },
  { city: "Dallas", state: "Texas", longitude: -96.7969, latitude: 32.7767 },
  {
    city: "San Jose",
    state: "California",
    longitude: -121.8863,
    latitude: 37.3382,
  },
  { city: "Austin", state: "Texas", longitude: -97.7431, latitude: 30.2672 },
  {
    city: "Jacksonville",
    state: "Florida",
    longitude: -81.6557,
    latitude: 30.3322,
  },
  {
    city: "San Francisco",
    state: "California",
    longitude: -122.4194,
    latitude: 37.7749,
  },
  {
    city: "Indianapolis",
    state: "Indiana",
    longitude: -86.1581,
    latitude: 39.7684,
  },
  { city: "Columbus", state: "Ohio", longitude: -82.9988, latitude: 39.9612 },
  {
    city: "Fort Worth",
    state: "Texas",
    longitude: -97.3308,
    latitude: 32.7555,
  },
  {
    city: "Charlotte",
    state: "North Carolina",
    longitude: -80.8431,
    latitude: 35.2271,
  },
  {
    city: "Seattle",
    state: "Washington",
    longitude: -122.3321,
    latitude: 47.6062,
  },
  {
    city: "Denver",
    state: "Colorado",
    longitude: -104.9903,
    latitude: 39.7392,
  },
  { city: "Washington", state: "D.C.", longitude: -77.0369, latitude: 38.9072 },
  {
    city: "Boston",
    state: "Massachusetts",
    longitude: -71.0589,
    latitude: 42.3601,
  },
  { city: "El Paso", state: "Texas", longitude: -106.485, latitude: 31.7619 },
  {
    city: "Detroit",
    state: "Michigan",
    longitude: -83.0458,
    latitude: 42.3314,
  },
  {
    city: "Nashville",
    state: "Tennessee",
    longitude: -86.7816,
    latitude: 36.1627,
  },
  {
    city: "Portland",
    state: "Oregon",
    longitude: -122.6765,
    latitude: 45.5051,
  },
  {
    city: "Memphis",
    state: "Tennessee",
    longitude: -90.049,
    latitude: 35.1495,
  },
  {
    city: "Oklahoma City",
    state: "Oklahoma",
    longitude: -97.5164,
    latitude: 35.4676,
  },
  {
    city: "Las Vegas",
    state: "Nevada",
    longitude: -115.1398,
    latitude: 36.1699,
  },
  {
    city: "Louisville",
    state: "Kentucky",
    longitude: -85.7585,
    latitude: 38.2527,
  },
  {
    city: "Baltimore",
    state: "Maryland",
    longitude: -76.6122,
    latitude: 39.2904,
  },
  {
    city: "Milwaukee",
    state: "Wisconsin",
    longitude: -87.9065,
    latitude: 43.0389,
  },
  {
    city: "Albuquerque",
    state: "New Mexico",
    longitude: -106.6504,
    latitude: 35.0844,
  },
  { city: "Tucson", state: "Arizona", longitude: -110.9747, latitude: 32.2226 },
  {
    city: "Fresno",
    state: "California",
    longitude: -119.7871,
    latitude: 36.7378,
  },
  {
    city: "Sacramento",
    state: "California",
    longitude: -121.4944,
    latitude: 38.5816,
  },
  {
    city: "Kansas City",
    state: "Missouri",
    longitude: -94.5786,
    latitude: 39.0997,
  },
  {
    city: "Long Beach",
    state: "California",
    longitude: -118.1937,
    latitude: 33.7701,
  },
  { city: "Mesa", state: "Arizona", longitude: -111.8315, latitude: 33.4152 },
  { city: "Atlanta", state: "Georgia", longitude: -84.388, latitude: 33.749 },
  {
    city: "Colorado Springs",
    state: "Colorado",
    longitude: -104.8214,
    latitude: 38.8339,
  },
  {
    city: "Virginia Beach",
    state: "Virginia",
    longitude: -75.9779,
    latitude: 36.8529,
  },
  {
    city: "Raleigh",
    state: "North Carolina",
    longitude: -78.6382,
    latitude: 35.7796,
  },
  { city: "Omaha", state: "Nebraska", longitude: -95.9345, latitude: 41.2565 },
  { city: "Miami", state: "Florida", longitude: -80.1918, latitude: 25.7617 },
  {
    city: "Oakland",
    state: "California",
    longitude: -122.2711,
    latitude: 37.8044,
  },
  {
    city: "Minneapolis",
    state: "Minnesota",
    longitude: -93.265,
    latitude: 44.9778,
  },
  { city: "Tulsa", state: "Oklahoma", longitude: -95.9928, latitude: 36.1539 },
  { city: "Wichita", state: "Kansas", longitude: -97.3301, latitude: 37.6872 },
  {
    city: "New Orleans",
    state: "Louisiana",
    longitude: -90.0715,
    latitude: 29.9511,
  },
  { city: "Arlington", state: "Texas", longitude: -97.1081, latitude: 32.7357 },
  { city: "Cleveland", state: "Ohio", longitude: -81.6944, latitude: 41.4993 },
  {
    city: "Bakersfield",
    state: "California",
    longitude: -119.0187,
    latitude: 35.3733,
  },
  { city: "Tampa", state: "Florida", longitude: -82.4572, latitude: 27.9506 },
  {
    city: "Aurora",
    state: "Colorado",
    longitude: -104.8319,
    latitude: 39.7294,
  },
  {
    city: "Honolulu",
    state: "Hawaii",
    longitude: -157.8583,
    latitude: 21.3069,
  },
  {
    city: "Anaheim",
    state: "California",
    longitude: -117.9145,
    latitude: 33.8366,
  },
  {
    city: "Santa Ana",
    state: "California",
    longitude: -117.8678,
    latitude: 33.7455,
  },
  {
    city: "Corpus Christi",
    state: "Texas",
    longitude: -97.3964,
    latitude: 27.8006,
  },
  {
    city: "Riverside",
    state: "California",
    longitude: -117.3962,
    latitude: 33.9533,
  },
  {
    city: "St. Louis",
    state: "Missouri",
    longitude: -90.1994,
    latitude: 38.627,
  },
  {
    city: "Lexington",
    state: "Kentucky",
    longitude: -84.5037,
    latitude: 38.0406,
  },
  {
    city: "Stockton",
    state: "California",
    longitude: -121.2908,
    latitude: 37.9577,
  },
  {
    city: "Pittsburgh",
    state: "Pennsylvania",
    longitude: -79.9959,
    latitude: 40.4406,
  },
  {
    city: "Saint Paul",
    state: "Minnesota",
    longitude: -93.089,
    latitude: 44.9537,
  },
  {
    city: "Anchorage",
    state: "Alaska",
    longitude: -149.9003,
    latitude: 61.2181,
  },
  { city: "Cincinnati", state: "Ohio", longitude: -84.512, latitude: 39.1031 },
  {
    city: "Henderson",
    state: "Nevada",
    longitude: -114.9817,
    latitude: 36.0395,
  },
  {
    city: "#4A3AFFsboro",
    state: "North Carolina",
    longitude: -79.791,
    latitude: 36.0726,
  },
  { city: "Plano", state: "Texas", longitude: -96.6989, latitude: 33.0198 },
  {
    city: "Newark",
    state: "New Jersey",
    longitude: -74.1724,
    latitude: 40.7357,
  },
  {
    city: "Lincoln",
    state: "Nebraska",
    longitude: -96.6852,
    latitude: 40.8136,
  },
  { city: "Orlando", state: "Florida", longitude: -81.3792, latitude: 28.5383 },
  {
    city: "Irvine",
    state: "California",
    longitude: -117.8265,
    latitude: 33.6846,
  },
  { city: "Toledo", state: "Ohio", longitude: -83.5552, latitude: 41.6528 },
  {
    city: "Jersey City",
    state: "New Jersey",
    longitude: -74.0445,
    latitude: 40.7178,
  },
  {
    city: "Chula Vista",
    state: "California",
    longitude: -117.0842,
    latitude: 32.6401,
  },
  {
    city: "Durham",
    state: "North Carolina",
    longitude: -78.8986,
    latitude: 35.994,
  },
  {
    city: "Fort Wayne",
    state: "Indiana",
    longitude: -85.1394,
    latitude: 41.0793,
  },
  {
    city: "St. Petersburg",
    state: "Florida",
    longitude: -82.6403,
    latitude: 27.7676,
  },
  { city: "Laredo", state: "Texas", longitude: -99.5075, latitude: 27.5306 },
  {
    city: "Buffalo",
    state: "New York",
    longitude: -78.8784,
    latitude: 42.8864,
  },
  {
    city: "Madison",
    state: "Wisconsin",
    longitude: -89.4012,
    latitude: 43.0731,
  },
  { city: "Lubbock", state: "Texas", longitude: -101.8552, latitude: 33.5779 },
  {
    city: "Chandler",
    state: "Arizona",
    longitude: -111.8413,
    latitude: 33.3062,
  },
  {
    city: "Scottsdale",
    state: "Arizona",
    longitude: -111.9261,
    latitude: 33.4942,
  },
  { city: "Reno", state: "Nevada", longitude: -119.8138, latitude: 39.5296 },
  {
    city: "Glendale",
    state: "Arizona",
    longitude: -112.1858,
    latitude: 33.5387,
  },
  {
    city: "Norfolk",
    state: "Virginia",
    longitude: -76.2859,
    latitude: 36.8508,
  },
  {
    city: "Winston-Salem",
    state: "North Carolina",
    longitude: -80.2442,
    latitude: 36.0999,
  },
  {
    city: "North Las Vegas",
    state: "Nevada",
    longitude: -115.1175,
    latitude: 36.1989,
  },
  { city: "Irving", state: "Texas", longitude: -96.9489, latitude: 32.814 },
  {
    city: "Chesapeake",
    state: "Virginia",
    longitude: -76.2875,
    latitude: 36.7682,
  },
  { city: "Gilbert", state: "Arizona", longitude: -111.789, latitude: 33.3528 },
  { city: "Hialeah", state: "Florida", longitude: -80.2781, latitude: 25.8576 },
  { city: "Garland", state: "Texas", longitude: -96.6389, latitude: 32.9126 },
  {
    city: "Fremont",
    state: "California",
    longitude: -121.9886,
    latitude: 37.5485,
  },
  {
    city: "Baton Rouge",
    state: "Louisiana",
    longitude: -91.1403,
    latitude: 30.4515,
  },
  {
    city: "Richmond",
    state: "Virginia",
    longitude: -77.436,
    latitude: 37.5407,
  },
  { city: "Boise", state: "Idaho", longitude: -116.2146, latitude: 43.615 },
  {
    city: "Spokane",
    state: "Washington",
    longitude: -117.426,
    latitude: 47.6588,
  },
  { city: "Des Moines", state: "Iowa", longitude: -93.6091, latitude: 41.5868 },
  {
    city: "Tacoma",
    state: "Washington",
    longitude: -122.4443,
    latitude: 47.2529,
  },
  {
    city: "San Bernardino",
    state: "California",
    longitude: -117.2898,
    latitude: 34.1083,
  },
  {
    city: "Modesto",
    state: "California",
    longitude: -120.9969,
    latitude: 37.6391,
  },
  {
    city: "Fontana",
    state: "California",
    longitude: -117.435,
    latitude: 34.0922,
  },
  {
    city: "Santa Clarita",
    state: "California",
    longitude: -118.5426,
    latitude: 34.3917,
  },
  {
    city: "Birmingham",
    state: "Alabama",
    longitude: -86.8025,
    latitude: 33.5207,
  },
  {
    city: "Oxnard",
    state: "California",
    longitude: -119.1771,
    latitude: 34.1975,
  },
  {
    city: "Fayetteville",
    state: "North Carolina",
    longitude: -78.8784,
    latitude: 35.0527,
  },
  {
    city: "Moreno Valley",
    state: "California",
    longitude: -117.2297,
    latitude: 33.9425,
  },
  {
    city: "Rochester",
    state: "New York",
    longitude: -77.6109,
    latitude: 43.1566,
  },
  {
    city: "Glendale",
    state: "California",
    longitude: -118.2551,
    latitude: 34.1425,
  },
  {
    city: "Huntington Beach",
    state: "California",
    longitude: -117.9992,
    latitude: 33.6603,
  },
  {
    city: "Salt Lake City",
    state: "Utah",
    longitude: -111.891,
    latitude: 40.7608,
  },
  {
    city: "Grand Rapids",
    state: "Michigan",
    longitude: -85.6681,
    latitude: 42.9634,
  },
  { city: "Amarillo", state: "Texas", longitude: -101.8313, latitude: 35.2219 },
  {
    city: "Yonkers",
    state: "New York",
    longitude: -73.8988,
    latitude: 40.9312,
  },
  { city: "Aurora", state: "Illinois", longitude: -88.3201, latitude: 41.7606 },
  { city: "Montgomery", state: "Alabama", longitude: -86.3, latitude: 32.3792 },
  { city: "Akron", state: "Ohio", longitude: -81.519, latitude: 41.0814 },
  {
    city: "Little Rock",
    state: "Arkansas",
    longitude: -92.2896,
    latitude: 34.7465,
  },
  {
    city: "Huntsville",
    state: "Alabama",
    longitude: -86.5861,
    latitude: 34.7304,
  },
  { city: "Augusta", state: "Georgia", longitude: -82.0105, latitude: 33.4735 },
  {
    city: "Port St. Lucie",
    state: "Florida",
    longitude: -80.3582,
    latitude: 27.273,
  },
  {
    city: "Grand Prairie",
    state: "Texas",
    longitude: -97.0195,
    latitude: 32.7459,
  },
  { city: "Columbus", state: "Georgia", longitude: -84.9877, latitude: 32.46 },
  {
    city: "Tallahassee",
    state: "Florida",
    longitude: -84.2807,
    latitude: 30.4383,
  },
  {
    city: "Overland Park",
    state: "Kansas",
    longitude: -94.6708,
    latitude: 38.9822,
  },
  { city: "Tempe", state: "Arizona", longitude: -111.94, latitude: 33.4255 },
  { city: "McKinney", state: "Texas", longitude: -96.6398, latitude: 33.1972 },
  { city: "Mobile", state: "Alabama", longitude: -88.0399, latitude: 30.6954 },
  {
    city: "Cape Coral",
    state: "Florida",
    longitude: -81.9495,
    latitude: 26.5629,
  },
  {
    city: "Shreveport",
    state: "Louisiana",
    longitude: -93.7502,
    latitude: 32.5252,
  },
  { city: "Frisco", state: "Texas", longitude: -96.8217, latitude: 33.1507 },
  {
    city: "Knoxville",
    state: "Tennessee",
    longitude: -83.9207,
    latitude: 35.9606,
  },
  {
    city: "Worcester",
    state: "Massachusetts",
    longitude: -71.8023,
    latitude: 42.2626,
  },
  {
    city: "Brownsville",
    state: "Texas",
    longitude: -97.4894,
    latitude: 25.9017,
  },
  {
    city: "Vancouver",
    state: "Washington",
    longitude: -122.6615,
    latitude: 45.6387,
  },
  {
    city: "Fort Lauderdale",
    state: "Florida",
    longitude: -80.1373,
    latitude: 26.1224,
  },
  {
    city: "Sioux Falls",
    state: "South Dakota",
    longitude: -96.7311,
    latitude: 43.5473,
  },
  {
    city: "Ontario",
    state: "California",
    longitude: -117.6512,
    latitude: 34.0633,
  },
  {
    city: "Chattanooga",
    state: "Tennessee",
    longitude: -85.3097,
    latitude: 35.0456,
  },
  {
    city: "Providence",
    state: "Rhode Island",
    longitude: -71.4128,
    latitude: 41.824,
  },
  {
    city: "Newport News",
    state: "Virginia",
    longitude: -76.4947,
    latitude: 37.0871,
  },
  {
    city: "Rancho Cucamonga",
    state: "California",
    longitude: -117.5931,
    latitude: 34.1064,
  },
  {
    city: "Santa Rosa",
    state: "California",
    longitude: -122.7141,
    latitude: 38.4405,
  },
  { city: "Peoria", state: "Arizona", longitude: -112.2374, latitude: 33.5806 },
  {
    city: "Oceanside",
    state: "California",
    longitude: -117.3795,
    latitude: 33.1959,
  },
  {
    city: "Elk Grove",
    state: "California",
    longitude: -121.3716,
    latitude: 38.4088,
  },
  { city: "Salem", state: "Oregon", longitude: -123.0351, latitude: 44.9429 },
  {
    city: "Pembroke Pines",
    state: "Florida",
    longitude: -80.2949,
    latitude: 26.0078,
  },
  { city: "Eugene", state: "Oregon", longitude: -123.0868, latitude: 44.0521 },
  {
    city: "Garden Grove",
    state: "California",
    longitude: -117.973,
    latitude: 33.7743,
  },
  {
    city: "Cary",
    state: "North Carolina",
    longitude: -78.7811,
    latitude: 35.7915,
  },
  {
    city: "Fort Collins",
    state: "Colorado",
    longitude: -105.0844,
    latitude: 40.5853,
  },
  {
    city: "Corona",
    state: "California",
    longitude: -117.5664,
    latitude: 33.8753,
  },
  {
    city: "Springfield",
    state: "Missouri",
    longitude: -93.2923,
    latitude: 37.2089,
  },
  {
    city: "Jackson",
    state: "Mississippi",
    longitude: -90.1848,
    latitude: 32.2988,
  },
  {
    city: "Alexandria",
    state: "Virginia",
    longitude: -77.0469,
    latitude: 38.8048,
  },
  {
    city: "Hayward",
    state: "California",
    longitude: -122.0808,
    latitude: 37.6688,
  },
  {
    city: "Clarksville",
    state: "Tennessee",
    longitude: -87.3595,
    latitude: 36.5298,
  },
  {
    city: "Lakewood",
    state: "Colorado",
    longitude: -105.0844,
    latitude: 39.7047,
  },
  {
    city: "Lancaster",
    state: "California",
    longitude: -118.1465,
    latitude: 34.6868,
  },
  {
    city: "Salinas",
    state: "California",
    longitude: -121.6555,
    latitude: 36.6777,
  },
  {
    city: "Palmdale",
    state: "California",
    longitude: -118.1165,
    latitude: 34.5794,
  },
  {
    city: "Hollywood",
    state: "Florida",
    longitude: -80.1495,
    latitude: 26.0112,
  },
  {
    city: "Springfield",
    state: "Massachusetts",
    longitude: -72.5853,
    latitude: 42.1015,
  },
  { city: "Macon", state: "Georgia", longitude: -83.6324, latitude: 32.8407 },
  {
    city: "Kansas City",
    state: "Kansas",
    longitude: -94.6275,
    latitude: 39.1141,
  },
  {
    city: "Sunnyvale",
    state: "California",
    longitude: -122.0363,
    latitude: 37.3688,
  },
  {
    city: "Pomona",
    state: "California",
    longitude: -117.7507,
    latitude: 34.0551,
  },
  { city: "Killeen", state: "Texas", longitude: -97.7278, latitude: 31.1171 },
  {
    city: "Escondido",
    state: "California",
    longitude: -117.0864,
    latitude: 33.1192,
  },
  { city: "Pasadena", state: "Texas", longitude: -95.2091, latitude: 29.6911 },
  {
    city: "Naperville",
    state: "Illinois",
    longitude: -88.1473,
    latitude: 41.7508,
  },
  {
    city: "Bellevue",
    state: "Washington",
    longitude: -122.2015,
    latitude: 47.6101,
  },
  { city: "Joliet", state: "Illinois", longitude: -88.0817, latitude: 41.525 },
  {
    city: "Murfreesboro",
    state: "Tennessee",
    longitude: -86.3903,
    latitude: 35.8456,
  },
  { city: "Midland", state: "Texas", longitude: -102.0779, latitude: 31.9973 },
  {
    city: "Rockford",
    state: "Illinois",
    longitude: -89.0937,
    latitude: 42.2711,
  },
  {
    city: "Paterson",
    state: "New Jersey",
    longitude: -74.1718,
    latitude: 40.9168,
  },
  {
    city: "Savannah",
    state: "Georgia",
    longitude: -81.0998,
    latitude: 32.0809,
  },
  {
    city: "Bridgeport",
    state: "Connecticut",
    longitude: -73.1952,
    latitude: 41.1792,
  },
  {
    city: "Torrance",
    state: "California",
    longitude: -118.3406,
    latitude: 33.8358,
  },
  { city: "McAllen", state: "Texas", longitude: -98.23, latitude: 26.2034 },
  {
    city: "Syracuse",
    state: "New York",
    longitude: -76.1474,
    latitude: 43.0481,
  },
  {
    city: "Surprise",
    state: "Arizona",
    longitude: -112.3679,
    latitude: 33.6292,
  },
  { city: "Denton", state: "Texas", longitude: -97.1331, latitude: 33.2148 },
  {
    city: "Roseville",
    state: "California",
    longitude: -121.2925,
    latitude: 38.7521,
  },
  {
    city: "Thornton",
    state: "Colorado",
    longitude: -104.9719,
    latitude: 39.868,
  },
  { city: "Miramar", state: "Florida", longitude: -80.3036, latitude: 25.9861 },
  {
    city: "Pasadena",
    state: "California",
    longitude: -118.1445,
    latitude: 34.1478,
  },
  { city: "Mesquite", state: "Texas", longitude: -96.598, latitude: 32.7668 },
  { city: "Olathe", state: "Kansas", longitude: -94.8191, latitude: 38.8814 },
  { city: "Dayton", state: "Ohio", longitude: -84.1916, latitude: 39.7589 },
  {
    city: "Carrollton",
    state: "Texas",
    longitude: -96.8903,
    latitude: 32.9537,
  },
  { city: "Waco", state: "Texas", longitude: -97.1467, latitude: 31.5493 },
  {
    city: "Orange",
    state: "California",
    longitude: -117.8531,
    latitude: 33.7879,
  },
  {
    city: "Fullerton",
    state: "California",
    longitude: -117.9243,
    latitude: 33.8704,
  },
  {
    city: "Charleston",
    state: "South Carolina",
    longitude: -79.9311,
    latitude: 32.7765,
  },
  {
    city: "West Valley City",
    state: "Utah",
    longitude: -111.9515,
    latitude: 40.6916,
  },
  {
    city: "Visalia",
    state: "California",
    longitude: -119.2921,
    latitude: 36.3302,
  },
  {
    city: "Hampton",
    state: "Virginia",
    longitude: -76.3452,
    latitude: 37.0299,
  },
  {
    city: "Gainesville",
    state: "Florida",
    longitude: -82.3248,
    latitude: 29.6516,
  },
  { city: "Warren", state: "Michigan", longitude: -83.014, latitude: 42.5145 },
  {
    city: "Coral Springs",
    state: "Florida",
    longitude: -80.2717,
    latitude: 26.2712,
  },
  {
    city: "Cedar Rapids",
    state: "Iowa",
    longitude: -91.6656,
    latitude: 42.0083,
  },
  {
    city: "Round Rock",
    state: "Texas",
    longitude: -97.6833,
    latitude: 30.5083,
  },
  {
    city: "Sterling Heights",
    state: "Michigan",
    longitude: -83.0302,
    latitude: 42.5803,
  },
  {
    city: "Kent",
    state: "Washington",
    longitude: -122.2348,
    latitude: 47.3809,
  },
  {
    city: "Columbia",
    state: "South Carolina",
    longitude: -81.0348,
    latitude: 34.0007,
  },
  {
    city: "Santa Clara",
    state: "California",
    longitude: -121.9552,
    latitude: 37.3541,
  },
  {
    city: "New Haven",
    state: "Connecticut",
    longitude: -72.9282,
    latitude: 41.3083,
  },
  {
    city: "Stamford",
    state: "Connecticut",
    longitude: -73.5387,
    latitude: 41.0534,
  },
  {
    city: "Concord",
    state: "California",
    longitude: -122.0311,
    latitude: 37.9779,
  },
  {
    city: "Elizabeth",
    state: "New Jersey",
    longitude: -74.2107,
    latitude: 40.6639,
  },
  { city: "Athens", state: "Georgia", longitude: -83.3833, latitude: 33.9519 },
  {
    city: "Thousand Oaks",
    state: "California",
    longitude: -118.8376,
    latitude: 34.1706,
  },
  {
    city: "Lafayette",
    state: "Louisiana",
    longitude: -92.0198,
    latitude: 30.2241,
  },
  {
    city: "Simi Valley",
    state: "California",
    longitude: -118.7815,
    latitude: 34.2694,
  },
  { city: "Topeka", state: "Kansas", longitude: -95.689, latitude: 39.0489 },
  { city: "Norman", state: "Oklahoma", longitude: -97.4395, latitude: 35.2226 },
  {
    city: "Fargo",
    state: "North Dakota",
    longitude: -96.7898,
    latitude: 46.8772,
  },
  {
    city: "Wilmington",
    state: "North Carolina",
    longitude: -77.9447,
    latitude: 34.2257,
  },
  { city: "Abilene", state: "Texas", longitude: -99.7331, latitude: 32.4487 },
  { city: "Odessa", state: "Texas", longitude: -102.3676, latitude: 31.8457 },
  {
    city: "Columbia",
    state: "Missouri",
    longitude: -92.3341,
    latitude: 38.9517,
  },
  { city: "Pearland", state: "Texas", longitude: -95.286, latitude: 29.5635 },
  {
    city: "Victorville",
    state: "California",
    longitude: -117.2912,
    latitude: 34.5362,
  },
  {
    city: "Hartford",
    state: "Connecticut",
    longitude: -72.6851,
    latitude: 41.7637,
  },
  {
    city: "Vallejo",
    state: "California",
    longitude: -122.2566,
    latitude: 38.1041,
  },
  {
    city: "Allentown",
    state: "Pennsylvania",
    longitude: -75.4714,
    latitude: 40.6084,
  },
  {
    city: "Berkeley",
    state: "California",
    longitude: -122.2727,
    latitude: 37.8715,
  },
  {
    city: "Richardson",
    state: "Texas",
    longitude: -96.7297,
    latitude: 32.9483,
  },
  {
    city: "Arvada",
    state: "Colorado",
    longitude: -105.0875,
    latitude: 39.8028,
  },
  {
    city: "Ann Arbor",
    state: "Michigan",
    longitude: -83.743,
    latitude: 42.2808,
  },
  {
    city: "Rochester",
    state: "Minnesota",
    longitude: -92.4802,
    latitude: 44.0121,
  },
  {
    city: "Cambridge",
    state: "Massachusetts",
    longitude: -71.1097,
    latitude: 42.3736,
  },
];

export default function EditLocation({ route, navigation }) {
  const { user, setUser } = useUser();
  const [city, setCity] = useState(`${user?.city}, ${user?.state}`);
  const [filteredCities, setFilteredCities] = useState([]);

  const [selectedCity, setSelectedCity] = useState(
    `${user?.city}, ${user?.state}`
  );

  const handleCityChange = (text) => {
    setCity(text);
    if (text.length > 0) {
      const filtered = cities
        .filter(
          ({ city, state }) =>
            city.toLowerCase().includes(text.toLowerCase()) ||
            state.toLowerCase().includes(text.toLowerCase())
        )
        .map(({ city, state, longitude, latitude }) => ({
          city,
          state,
          longitude,
          latitude,
        }));
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
  };

  const handleCitySelect = (selectedCity) => {
    setCity(`${selectedCity.city}, ${selectedCity.state}`);
    setFilteredCities([]);
    setSelectedCity(selectedCity);
    console.log("selectedCity", selectedCity);
  };

  async function editLocation() {
    const userId = supabase.auth.currentUser.id;

    const res = await supabase
      .from("profiles")
      .update({
        city: selectedCity.city,
        state: selectedCity.state,
        longitude: selectedCity.longitude,
        latitude: selectedCity.latitude,
      })
      .eq("user_id", userId);

    if (!res.error) {
      Alert.alert("Update Successful");
      navigation.goBack();
      setUser(res.body[0]);
    } else {
      console.error("ERROR", res.error);
      Alert.alert("Something Went Wrong");
    }

    return res;
  }

  const updateLocation = async () => {
    if (!selectedCity) {
      Alert.alert(
        "Location",
        "The input is blank. Please enter your location."
      );
    }

    if (selectedCity === `${user?.city}, ${user?.state}`) {
      Alert.alert("Location", "Nothing was changed.");
      return;
    }

    editLocation();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Please enter your location to get personalized recommendations!
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter City or State"
        value={city}
        onChangeText={handleCityChange}
      />

      {filteredCities.length > 0 && (
        <FlatList
          data={filteredCities}
          keyExtractor={(item) => `${item.city}, ${item.state}`}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleCitySelect(item)}>
              <Text
                style={styles.cityItem}
              >{`${item.city}, ${item.state}`}</Text>
            </TouchableOpacity>
          )}
          style={styles.cityList}
        />
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => updateLocation()}
        >
          <Text style={styles.buttonText}>Update My Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  header: {
    fontSize: 20,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "300",
  },
  button: {
    backgroundColor: "#4A3AFF",
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  input: {
    width: "100%",
    height: 50,
    fontSize: 18,
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 16,
    borderRadius: 8,
  },
  cityList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  cityItem: {
    padding: 10,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  buttonContainer: {
    marginTop: 16,
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    alignSelf: "center",
  },
});
