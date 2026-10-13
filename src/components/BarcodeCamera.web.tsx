// Web version of BarcodeCamera: live camera preview decoded with ZXing (Safari on iPhone has no built-in barcode reader).
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../lib/theme';

const FORMATS = [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E, BarcodeFormat.QR_CODE];

export function BarcodeCamera({ onScan }: { onScan: (data: string) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const onScanRef = useRef(onScan);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onScanRef.current = onScan;
  });

  useEffect(() => {
    let controls: IScannerControls | undefined;
    let stopped = false;
    const reader = new BrowserMultiFormatReader(new Map([[DecodeHintType.POSSIBLE_FORMATS, FORMATS]]));
    reader
      .decodeFromConstraints({ video: { facingMode: 'environment' } }, video.current!, (result) => {
        if (result && !stopped) onScanRef.current(result.getText());
      })
      .then((c) => {
        controls = c;
        if (stopped) c.stop();
      })
      .catch((e: Error) => {
        setError(
          e?.name === 'NotAllowedError'
            ? 'Camera access was blocked. Allow camera access for this site in your browser settings, or type the barcode below.'
            : "Couldn't start the camera. You can type the barcode number below instead.",
        );
      });
    return () => {
      stopped = true;
      controls?.stop();
    };
  }, []);

  return (
    <View style={styles.frame}>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <video ref={video} muted playsInline autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <View pointerEvents="none" style={styles.guide} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: '#000', justifyContent: 'center' },
  guide: { position: 'absolute', left: '12%', right: '12%', top: '35%', bottom: '35%', borderWidth: 2, borderColor: colors.accent, borderRadius: radius.sm },
  error: { color: colors.text, textAlign: 'center', padding: 24, lineHeight: 21 },
});
