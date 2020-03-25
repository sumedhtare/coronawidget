/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  NativeModules,
  TouchableOpacity
} from 'react-native';
import BackgroundTask from 'react-native-background-task'
import { ColorPicker } from 'react-native-color-picker'
import CountryPicker from 'react-native-country-picker-modal'
import AsyncStorage from '@react-native-community/async-storage';
const SharedStorage = NativeModules.SharedStorage;



BackgroundTask.define(async () => {
  // Fetch some data over the network which we want the user to have an up-to-
  // date copy of, even if they have no network when using the app
  // const response = await fetch('http://feeds.bbci.co.uk/news/rss.xml')
  // const text = await response.text()
  
  // Data persisted to AsyncStorage can later be accessed by the foreground app
  
   _getData2();
  // Remember to call finish()
   BackgroundTask.finish()
})


class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data:{},
      location: 'India',
      color:'#ffffff',
      cca2: {cca2:'IN',name:'India'},
    }
  }

  async componentDidMount() {
    
    const color = await AsyncStorage.getItem('@color')
    const cca2 = await AsyncStorage.getItem('@cca2')
  
    this.setState({
      color:color!== null?color:'#ffffff',
      cca2: cca2!== null?JSON.parse(cca2):{cca2:'IN',name:'India'}
  })
    // Optional: Check if the device is blocking background tasks or not
    this.checkStatus()
  }

  async checkStatus() {
    const status = await BackgroundTask.statusAsync()
    
    if (status.available) {
      // Everything's fine
      return
    }
    
    const reason = status.unavailableReason
    if (reason === BackgroundTask.UNAVAILABLE_DENIED) {
      Alert.alert('Denied', 'Please enable background "Background App Refresh" for this app')
    } else if (reason === BackgroundTask.UNAVAILABLE_RESTRICTED) {
      Alert.alert('Restricted', 'Background tasks are restricted on your device')
    }
  }

  async setcolor(color){
    console.log('color',color)
    this.setState({color})
    await AsyncStorage.setItem('@color', color) 
  }


  async appendChanges(value){
    console.log('location',value)
     await AsyncStorage.setItem('@cca2', JSON.stringify(value)) 
  }


  getdataforapp(){
      fetch('https://thevirustracker.com/free-api?countryTotal='+cca2.cca2, { 
    method: 'get', 
  })
 .then((response) => response.json())
    .then((responseJson) => {
       console.log('res3', responseJson)
       let data = responseJson.countrydata[0]
       let newdata ={
        confirmed:data.total_cases,
        recovered:data.total_recovered,
        deaths:data.total_deaths,
        color:color,
        location:cca2.cca2
       }
       this.setState({data})
    })
    .catch((error) => {
     console.error(error);
    });
  }
  

  render() {
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={{ flex: 1, justifyContent:'center', alignItems:'center' }}>

        <View style={{height:50, flexDirection:'row', justifyContent:'center', alignItems:'center', marginBottom:10}}>
<CountryPicker
                    //hideAlphabetFilter={true}
                    //filterable={true}
                    closeable={true}
                    //closeButtonImage={closeImgLight}
                   // ref={picker => (this.picker = picker)}
                   onSelect={value =>{
                    this.appendChanges(value)
                        //console.log('appendChanges 2',value)
                        this.setState({ location: value.name, cca2: value } )
                        
                    }
                    }
                    withCountryNameButton={true}
                    countryCode={this.state.cca2.cca2}
                    translation="eng"
                    filterPlaceholder="Search"
                    withFilter={true}
                    withFlag={true}
                    withCallingCode={true}
                    withAlphaFilter={true}
                />
                <Text>{this.state.cca2.name}</Text>
</View>

{/* <TouchableOpacity onPress={()=>{BackgroundTask.schedule({
      period: 1800, // Aim to run every 30 mins - more conservative on battery
    })}}
    style={{width:'75%', height:40, backgroundColor:'#ddd', borderRadius:20, justifyContent:'center', alignItems:'center', marginBottom:20}}>
<Text>Get Updates every 30 mins</Text>
</TouchableOpacity> */}

<TouchableOpacity onPress={()=>{_getData2()}}
style={{width:'75%', height:40, backgroundColor:'#ddd', borderRadius:20, justifyContent:'center', alignItems:'center', marginBottom:20}}>
<Text>Update now</Text>
</TouchableOpacity>

{/* <TouchableOpacity onPress={()=>{BackgroundTask.finish()}}
style={{width:'75%', height:40, backgroundColor:'#ddd', borderRadius:20, justifyContent:'center', alignItems:'center', marginBottom:20}}>
<Text>Cancle Updates</Text>
</TouchableOpacity> */}
<View style={{height:200}}>
  <Text>Select font color</Text>
<ColorPicker
oldColor={this.state.color}
onColorSelected={color => this.setcolor(color)}
  />
  <Text>{this.state.color}</Text>
</View>



         
        </SafeAreaView>
      </>
    )
  }
}


async function _getData(){
  fetch('https://covid-19-coronavirus-statistics.p.rapidapi.com/v1/stats?country=India', { 
    method: 'get', 
    headers: new Headers({
      'x-rapidapi-host': 'covid-19-coronavirus-statistics.p.rapidapi.com', 
      'x-rapidapi-key': '2f55f7d2b0msh4528acb8a2ad4cdp1b04b7jsn5d2b55f61148'
    }), 
    // body: 'country=India'
  })
 .then((response) => response.json())
    .then((responseJson) => {
       console.log('res3', responseJson)
// this.setState({data:responseJson.data.covid19Stats[0]},()=>this._sendData())
_sendData(responseJson.data.covid19Stats[0]);
    })
    .catch((error) => {
     console.error(error);
    });

  
}


export async function _getData2(){
 // alert('background task executed')
  let cca2 = await AsyncStorage.getItem('@cca2')
  let color = await AsyncStorage.getItem('@color')
  cca2= cca2!== null?JSON.parse(cca2):{cca2:'IN',name:'India'}
  color=color!==null?color:'#ffffff'
  console.log('cca2',cca2)



  let newdata ={
    color:color,
    location:cca2.cca2
   }
// this.setState({data:responseJson.data.covid19Stats[0]},()=>this._sendData())
_sendData(newdata);
  
}

export function _sendData(data){
  console.log('data',data)
  SharedStorage.set(
    JSON.stringify({ data: data})
  );
}



export default App;
