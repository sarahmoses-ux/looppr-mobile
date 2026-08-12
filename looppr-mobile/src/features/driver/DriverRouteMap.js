import { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { colors } from '../../theme/tokens';

const EDMOND_OK = { latitude: 35.6528, longitude: -97.4781 };

// Android needs a real Google Maps API key (see app.json's react-native-maps
// plugin config) before tiles render in production — this still mounts
// safely without one, it just shows blank tiles. iOS uses Apple Maps by
// default and needs no key at all.
export default function DriverRouteMap({ stops }) {
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({});
      setCurrent({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    })();
  }, []);

  const region = {
    ...(current ?? stops[0]?.location ?? EDMOND_OK),
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={{ height: 180, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
      <MapView style={{ flex: 1 }} initialRegion={region} showsUserLocation={Boolean(current)}>
        {stops.map((stop, i) =>
          stop.location ? (
            <Marker
              key={stop._id}
              coordinate={stop.location}
              title={`${i + 1}. ${stop.customerName}`}
              description={stop.address}
              pinColor={i === 0 ? colors.brand : colors.faint}
            />
          ) : null
        )}
      </MapView>
      {Platform.OS === 'android' ? (
        <View style={{ position: 'absolute', bottom: 6, left: 6, right: 6 }}>
          <Text className="font-body text-[9.5px] text-faint">Map tiles need a Google Maps API key in app.json for production.</Text>
        </View>
      ) : null}
    </View>
  );
}
