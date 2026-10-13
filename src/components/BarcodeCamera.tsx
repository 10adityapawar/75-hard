import { CameraView, useCameraPermissions } from 'expo-camera';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../lib/theme';
import { Button } from './ui';

export function BarcodeCamera({ onScan }: { onScan: (data: string) => void }) {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission?.granted) {
    return (
      <View style={[styles.frame, { gap: 12, padding: 24 }]}>
        <Text style={styles.error}>
          {permission && !permission.canAskAgain
            ? 'Camera access is turned off. Enable it in Settings, or type the barcode below.'
            : 'Allow camera access to scan food barcodes.'}
        </Text>
        {permission?.canAskAgain !== false ? <Button small label="Allow camera" icon="camera" onPress={requestPermission} /> : null}
      </View>
    );
  }

  return (
    <View style={styles.frame}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'qr'] }}
        onBarcodeScanned={(r) => onScan(r.data)}
      />
      <View pointerEvents="none" style={styles.guide} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: '#000', justifyContent: 'center' },
  guide: { position: 'absolute', left: '12%', right: '12%', top: '35%', bottom: '35%', borderWidth: 2, borderColor: colors.accent, borderRadius: radius.sm },
  error: { color: colors.text, textAlign: 'center', lineHeight: 21 },
});
