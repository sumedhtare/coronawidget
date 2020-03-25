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
  _getData2();
  BackgroundTask.finish()
})


class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: {},
      location: 'India',
      color: '#ffffff',
      cca2: { cca2: 'IN', name: 'India' },
    }
  }

  async componentDidMount() {

    const color = await AsyncStorage.getItem('@color')
    const cca2 = await AsyncStorage.getItem('@cca2')

    this.setState({
      color: color !== null ? color : '#ffffff',
      cca2: cca2 !== null ? JSON.parse(cca2) : { cca2: 'IN', name: 'India' }
    })
    // Optional: Check if the device is blocking background tasks or not
    this.checkStatus()
    this.getdataforapp();
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

  async setcolor(color) {
    console.log('color', color)
    this.setState({ color })
    await AsyncStorage.setItem('@color', color)
  }


  async appendChanges(value) {
    console.log('location', value)
    await AsyncStorage.setItem('@cca2', JSON.stringify(value))
  }


  async getdataforapp() {
    let cca2 = await AsyncStorage.getItem('@cca2')
    let color = await AsyncStorage.getItem('@color')
    cca2 = cca2 !== null ? JSON.parse(cca2) : { cca2: 'IN', name: 'India' }
    color = color !== null ? color : '#ffffff'

    fetch('https://thevirustracker.com/free-api?countryTotal=' + cca2.cca2, {
      method: 'get',
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log('res3', responseJson)
        let data = responseJson.countrydata[0]
        this.setState({ data })
      })
      .catch((error) => {
        console.error(error);
      });
  }


  render() {
    const { data } = this.state;
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={{flex:1}}>
        <SafeAreaView style={{ flex: 1, alignItems: 'center', marginTop: 40, paddingHorizontal: 20 }}>
       
          <View style={{ justifyContent: 'flex-start', width: '100%', marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 10 }}>Coronavirus stats live update</Text>
            <Text>Infected: {data.total_cases}</Text>
            <Text>Deaths: {data.total_deaths}</Text>
            <Text>Recovered: {data.total_recovered}</Text>
            <Text>Today's cases: {data.total_new_cases_today}</Text>

          </View>
          <View style={{ height: 50, flexDirection: 'row', justifyContent: 'flex-start', width: '100%', alignItems: 'center', marginBottom: 10 }}>
            <Text>Select Country:    </Text>
            <CountryPicker
              //hideAlphabetFilter={true}
              //filterable={true}
              closeable={true}
              //closeButtonImage={closeImgLight}
              //  ref='picker'
              ref={(feedback) => this.feedback = feedback}
              onSelect={value => {
                this.appendChanges(value)
                //console.log('appendChanges 2',value)
                this.setState({ location: value.name, cca2: value })

              }
              }
              withCountryNameButton={true}
              countryCode={this.state.cca2.cca2}
              translation="eng"
              filterPlaceholder="Search"
              withFilter={true}
              withFlag={true}
              // withCallingCode={true}
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

          <TouchableOpacity onPress={() => {
            _getData2()
            this.getdataforapp()
          }
          }
            style={{ width: '75%', height: 40, backgroundColor: '#3486eb', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{color:'#fff'}}>Update now</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity onPress={()=>{BackgroundTask.finish()}}
style={{width:'75%', height:40, backgroundColor:'#ddd', borderRadius:20, justifyContent:'center', alignItems:'center', marginBottom:20}}>
<Text>Cancle Updates</Text>
</TouchableOpacity> */}
          <View style={{ height: 200 }}>
            <Text>Select font color for widget</Text>
            <ColorPicker
              oldColor={this.state.color}
              onColorSelected={color => this.setcolor(color)}
            />
            <Text>{this.state.color}</Text>
          </View>


        <View style={{flex:1, justifyContent:'flex-end', paddingBottom:20}}>
          <Text style={{fontSize:12, color:'grey'}}>Note: Please select corona widget from your home screen widgets</Text>
        </View>
          
        </SafeAreaView>
        </ScrollView>
      </>
    )
  }
}


export async function _getData2() {
  // alert('background task executed')
  let cca2 = await AsyncStorage.getItem('@cca2')
  let color = await AsyncStorage.getItem('@color')
  cca2 = cca2 !== null ? JSON.parse(cca2) : { cca2: 'IN', name: 'India' }
  color = color !== null ? color : '#ffffff'
  console.log('cca2', cca2)



  let newdata = {
    color: color,
    location: cca2.cca2
  }
  _sendData(newdata);

}

export function _sendData(data) {
  console.log('data', data)
  SharedStorage.set(
    JSON.stringify({ data: data })
  );
}



export default App;
