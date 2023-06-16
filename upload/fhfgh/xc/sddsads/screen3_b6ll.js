import React from 'react';
import { Text, View, StyleSheet, BackHandler, ToastAndroid } from 'react-native'
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import Pressable from 'react-native/Libraries/Components/Pressable/Pressable';
import {DeviceEventEmitter} from "react-native"

class Screen3 extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          loading: false,
          hasCameraPermission: null,         // przydzielone uprawnienia do używania kamery
          type: Camera.Constants.Type.back,  // typ kamery
      };
    }
    camera
    async componentDidMount(){
      let { status } = await Camera.requestCameraPermissionsAsync();
      this.setState({ hasCameraPermission: status == 'granted' });
      BackHandler.addEventListener("hardwareBackPress", () => {DeviceEventEmitter.emit("refreshevent",{})});
    }

    flip() {
      this.setState({
        type: this.state.type === Camera.Constants.Type.back
            ? Camera.Constants.Type.front
            : Camera.Constants.Type.back,
      });
    }

    async photo() {
      if (this.camera) {
        let foto = await this.camera.takePictureAsync();
        await MediaLibrary.createAssetAsync(foto.uri)
        console.log(foto.uri);
        ToastAndroid.showWithGravity(
          'photo made',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER
        );
        DeviceEventEmitter.emit("refreshevent",{})
      }
  }

    render() {
      const hasCameraPermission = this.state.hasCameraPermission; // podstawienie zmiennej ze state
      if (hasCameraPermission == null) {
          return (<View />);
      } else if (hasCameraPermission == false) {
          return (<Text>brak dostępu do kamery</Text>);
      } else {
          return (
              <View style={{ flex: 1 }}>
                  <Camera
                      ref={ref => {
                          this.camera = ref; // Uwaga: referencja do kamery używana później
                      }}
                      style={{ flex: 1 }}
                      type={this.state.type}>
                      <View style={{ flex: 1, display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                        <Pressable onPress={() => this.photo()} style={styles.buttons}><Text style={styles.text}>+</Text></Pressable>
                        <Pressable onPress={() => this.flip()} style={styles.buttons}><Text style={[styles.text, {paddingBottom: 11}]}>↺</Text></Pressable>
                      </View>
                  </Camera>
              </View>
          );
      }
  }
}

const styles = StyleSheet.create({
  buttons: {
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    display: 'flex',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginBottom: 40
  },
  text: {
    color: 'limegreen',
    fontWeight: 'bold',
    fontSize: 70,
    alignSelf: 'center',
    textAlign: 'center'
  }
})

export default Screen3;
