package com.cvoid19;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.util.Log;
import android.view.View;
import android.widget.ImageButton;
import android.widget.RemoteViews;
import android.content.SharedPreferences;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.text.DateFormat;
import java.util.Date;

/**
 * Implementation of App Widget functionality.
 */

public class CoronaWidget extends AppWidgetProvider {
//    final String API_URL ="https://covid-19-coronavirus-statistics.p.rapidapi.com/v1/stats?country=India";
//    URL url = new URL("http://www.android.com/");


    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager,
                                int appWidgetId) {
//        CharSequence widgetText = context.getString(R.string.appwidget_text);
//        // Construct the RemoteViews object
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.corona_widget);
//        views.setTextViewText(R.id.appwidget_infected, widgetText);
//
//        // Instruct the widget manager to update the widget


        //Create an Intent with the AppWidgetManager.ACTION_APPWIDGET_UPDATE action//

        Intent intentUpdate = new Intent(context, CoronaWidget.class);
        intentUpdate.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);

//Update the current widget instance only, by creating an array that contains the widget’s unique ID//

        int[] idArray = new int[]{appWidgetId};
        intentUpdate.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, idArray);

//Wrap the intent as a PendingIntent, using PendingIntent.getBroadcast()//

        PendingIntent pendingUpdate = PendingIntent.getBroadcast(
                context, appWidgetId, intentUpdate,
                PendingIntent.FLAG_UPDATE_CURRENT);

//Send the pending intent in response to the user tapping the ‘Update’ TextView//

        views.setOnClickPendingIntent(R.id.update, pendingUpdate);

        appWidgetManager.updateAppWidget(appWidgetId, views);

        getdata(context, appWidgetManager, appWidgetId);



    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // There may be multiple widgets active, so update all of them
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);

            getdata(context, appWidgetManager, appWidgetId);

        }


    }

    @Override
    public void onEnabled(Context context) {
        // Enter relevant functionality for when the first widget is created
    }

    @Override
    public void onDisabled(Context context) {
        // Enter relevant functionality for when the last widget is disabled
    }

    public static void getdatafrominternet(Context context){
        RequestQueue queue = Volley.newRequestQueue(context);
        Log.d("Response", "loading");
        String url = "https://thevirustracker.com/free-api?countryTotal=IN";

        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest
                (Request.Method.GET, url, null, new Response.Listener<JSONObject>() {

                    @Override
                    public void onResponse(JSONObject response) {
//                        textView.setText("Response: " + response.toString());
                        Log.d("Response", response.toString());
                    }
                }, new Response.ErrorListener() {

                    @Override
                    public void onErrorResponse(VolleyError error) {
                        // TODO: Handle error
                        Log.d("Response", error.toString());

                    }
                });
        queue.add(jsonObjectRequest);
    }

    public static void getdata(Context context, AppWidgetManager appWidgetManager, int appWidgetId){

        try {
            SharedPreferences sharedPref = context.getSharedPreferences("DATA", Context.MODE_PRIVATE);
            String appString = sharedPref.getString("appData", "{\"data\":'no data'}");
            JSONObject appData = new JSONObject(appString);
            JSONObject liveData = appData.getJSONObject("data");
            String timeString = DateFormat.getTimeInstance(DateFormat.SHORT).format(new Date());
            String location = liveData.getString("location");
            String color = liveData.getString("color");
            RequestQueue queue = Volley.newRequestQueue(context);
            Log.d("Response", "loading");
            String url = "https://thevirustracker.com/free-api?countryTotal="+location;


            JsonObjectRequest jsonObjectRequest = new JsonObjectRequest
                    (Request.Method.GET, url, null, new Response.Listener<JSONObject>() {

                        @Override
                        public void onResponse(JSONObject response) {

                            try {
                                JSONObject countrydata = response.getJSONArray("countrydata").getJSONObject(0);
                                Log.d("Response", countrydata.toString());

                                RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.corona_widget);

                                views.setTextViewText(R.id.appwidget_infected, countrydata.getString("total_cases"));
                                views.setTextViewText(R.id.appwidget_death, countrydata.getString("total_deaths"));
                                views.setTextViewText(R.id.appwidget_cure, countrydata.getString("total_recovered"));
                                views.setTextViewText(R.id.appwidget_time, timeString);

                                views.setTextColor(R.id.appwidget_time, Color.parseColor(color));
                                views.setTextColor(R.id.appwidget_cure, Color.parseColor(color));
                                views.setTextColor(R.id.appwidget_death, Color.parseColor(color));
                                views.setTextColor(R.id.appwidget_infected, Color.parseColor(color));

                                views.setTextColor(R.id.textView, Color.parseColor(color));
                                views.setTextColor(R.id.textView2, Color.parseColor(color));
                                views.setTextColor(R.id.textView3, Color.parseColor(color));
                                views.setTextColor(R.id.textView4, Color.parseColor(color));
//                                views.setTextColor(R.id.update, Color.parseColor(color));
//                                button.setColorFilter(Color.parseColor(color)); // White Tint
                                // Instruct the widget manager to update the widget
                                appWidgetManager.updateAppWidget(appWidgetId, views);

                            } catch (JSONException e) {
                                e.printStackTrace();
                            }
                        }
                    }, new Response.ErrorListener() {

                        @Override
                        public void onErrorResponse(VolleyError error) {
                            // TODO: Handle error
                            Log.d("Response", error.toString());

                        }
                    });
            queue.add(jsonObjectRequest);




            // Construct the RemoteViews object

        }catch (JSONException e) {
            e.printStackTrace();
        }
    }

}

