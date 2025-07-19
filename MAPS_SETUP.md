# 🗺️ Google Maps API Setup Instructions

Your UST Campus Map is ready to use! To enable the interactive Google Maps features, follow these simple steps:

## 📋 Quick Setup (5 minutes)

### Step 1: Get Your Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API** and **Places API**
4. Go to "Credentials" and click "Create Credentials" → "API Key"
5. Copy your new API key

### Step 2: Add Your API Key
1. Open `map.html` in your code editor
2. Find this line (around line 8):
   ```html
   <script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap"></script>
   ```
3. Replace `YOUR_API_KEY` with your actual API key:
   ```html
   <script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB1234567890abcdef&callback=initMap"></script>
   ```

### Step 3: Test Your Map
1. Save the file and refresh your browser
2. The interactive map should now work!

## 🎯 Current Features (Working Without API Key)

✅ **Campus Reference Map** - View and zoom the UST campus image  
✅ **Mobile Responsive** - Optimized for phone screens  
✅ **Touch Controls** - Pinch to zoom, pan with finger  
✅ **Navigation** - Back to schedule page  

## 🚀 Features Unlocked With API Key

🔓 **Interactive Google Maps** - Live satellite/street view  
🔓 **Location Markers** - Click on campus buildings  
🔓 **Current Location** - Find yourself on the map  
🔓 **Directions** - Get routes to UST from anywhere  
🔓 **Nearby Places** - Find restaurants, parking, etc.  

## 🆓 Free Tier Information

Google Maps API includes:
- **28,000 free map loads per month**
- **100 free directions requests per day**
- **Perfect for personal/student projects**

## 🔧 Troubleshooting

**Problem:** "Authentication failed" error  
**Solution:** Double-check your API key is correct and APIs are enabled

**Problem:** Map not loading  
**Solution:** The app automatically switches to reference map mode

**Problem:** Over API limits  
**Solution:** The free tier is very generous for personal use

## 📱 Current Status

Your map is **fully functional** even without the API key! The reference map with zoom controls provides a complete campus navigation experience. The API key simply adds extra interactive features.

---

**File Location:** `c:\Users\Jethro Wang\Downloads\schdule\map.html` (line 8)  
**Documentation:** [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
