import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Screen, SectionLabel } from '../../components/ui';
import { dayNumberFor } from '../../lib/challenge';
import { formatDate } from '../../lib/dates';
import { photoUri } from '../../lib/photos';
import { useStore } from '../../lib/store';
import { colors, radius } from '../../lib/theme';

export default function PhotosScreen() {
  const { state, today } = useStore();
  const [open, setOpen] = useState<number | null>(null);

  const photos = Object.values(state.logs)
    .filter((l) => l.photo)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((l) => ({ date: l.date, uri: photoUri(l.photo)!, day: dayNumberFor(state, l.date, today) }));

  const label = (p: (typeof photos)[number]) => (p.day ? `Day ${p.day}` : formatDate(p.date));
  const first = photos[0];
  const latest = photos[photos.length - 1];
  const current = open !== null ? photos[open] : null;

  return (
    <Screen title="Photos" subtitle={`${photos.length} progress photo${photos.length === 1 ? '' : 's'}`}>
      {photos.length === 0 ? (
        <Card style={{ alignItems: 'center', gap: 10, paddingVertical: 32 }}>
          <Ionicons name="camera-outline" size={40} color={colors.muted} />
          <Text style={styles.empty}>Your daily photos will appear here. By Day 75 you'll have your whole transformation.</Text>
          <Button label="Add today's photo" icon="camera" onPress={() => router.navigate('/')} />
        </Card>
      ) : null}

      {photos.length >= 2 ? (
        <>
          <SectionLabel>Before & now</SectionLabel>
          <View style={styles.compare}>
            {[first, latest].map((p, i) => (
              <Pressable key={p.date} style={{ flex: 1 }} onPress={() => setOpen(i === 0 ? 0 : photos.length - 1)}>
                <Image source={{ uri: p.uri }} style={styles.compareImg} />
                <Text style={styles.compareLabel}>{label(p)}</Text>
                <Text style={styles.muted}>{formatDate(p.date)}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      {photos.length > 0 ? (
        <>
          <SectionLabel>Every day</SectionLabel>
          <View style={styles.grid}>
            {photos.map((p, i) => (
              <Pressable key={p.date} style={styles.cellWrap} onPress={() => setOpen(i)}>
                <Image source={{ uri: p.uri }} style={styles.cell} />
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{label(p)}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      <Modal visible={current !== null} animationType="fade" onRequestClose={() => setOpen(null)}>
        <SafeAreaView style={styles.viewer}>
          {current ? (
            <>
              <View style={styles.viewerHeader}>
                <View>
                  <Text style={styles.viewerTitle}>{label(current)}</Text>
                  <Text style={styles.muted}>{formatDate(current.date, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
                </View>
                <Pressable onPress={() => setOpen(null)} hitSlop={12} accessibilityLabel="Close">
                  <Ionicons name="close-circle" size={32} color={colors.muted} />
                </Pressable>
              </View>
              <Image source={{ uri: current.uri }} style={styles.full} resizeMode="contain" />
              <View style={styles.viewerNav}>
                <Button variant="secondary" icon="chevron-back" label="Prev" disabled={open === 0} onPress={() => setOpen((o) => (o! > 0 ? o! - 1 : o))} style={{ flex: 1 }} />
                <Button variant="secondary" icon="chevron-forward" label="Next" disabled={open === photos.length - 1} onPress={() => setOpen((o) => (o! < photos.length - 1 ? o! + 1 : o))} style={{ flex: 1 }} />
              </View>
            </>
          ) : null}
        </SafeAreaView>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { color: colors.muted, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 6 },
  muted: { color: colors.muted, fontSize: 13 },
  compare: { flexDirection: 'row', gap: 10 },
  compareImg: { width: '100%', aspectRatio: 3 / 4, borderRadius: radius.md, backgroundColor: colors.card },
  compareLabel: { color: colors.text, fontWeight: '800', fontSize: 16, marginTop: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -3 },
  cellWrap: { width: '33.333%', padding: 3 },
  cell: { width: '100%', aspectRatio: 3 / 4, borderRadius: radius.sm, backgroundColor: colors.card },
  tag: { position: 'absolute', left: 8, bottom: 8, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  viewer: { flex: 1, backgroundColor: '#000' },
  viewerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  viewerTitle: { color: colors.text, fontSize: 24, fontWeight: '800' },
  full: { flex: 1, width: '100%' },
  viewerNav: { flexDirection: 'row', gap: 10, padding: 16 },
});
