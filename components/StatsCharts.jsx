import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, TextInput } from 'react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Dumbbell, Flame, X, TrendingDown, TrendingUp } from 'lucide-react-native';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { EXERCISES } from '../data/exercises';

const DAYS_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MONTHS_TR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

function getWeekDates(offset = 0) {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function getMonthWeeks(offset = 0) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + offset;
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const weeks = [];
  let cur = new Date(first);
  const dayOfWeek = cur.getDay();
  cur.setDate(cur.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  while (cur <= last || weeks.length < 4) {
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(cur);
      d.setDate(cur.getDate() + i);
      weekDates.push(d.toISOString().slice(0, 10));
    }
    weeks.push(weekDates);
    cur.setDate(cur.getDate() + 7);
    if (weeks.length >= 6) break;
  }
  return { weeks, month: first.getMonth(), year: first.getFullYear() };
}

function formatVol(v) {
  if (v >= 1000) return (v / 1000).toFixed(1).replace('.0', '') + 'k';
  return v;
}

function aggregateDay(workoutLog, dateKey) {
  let volume = 0;
  let sets = 0;
  let exercises = 0;
  const exDetails = [];

  for (const [exId, sessions] of Object.entries(workoutLog)) {
    const session = sessions.find(s => s.date === dateKey);
    if (session && session.sets.length > 0) {
      exercises++;
      let exVol = 0;
      for (const s of session.sets) {
        const w = s.weight || 0;
        const r = s.reps || 0;
        volume += w * r;
        exVol += w * r;
        sets++;
      }
      exDetails.push({
        name: exId,
        sets: session.sets.length,
        volume: exVol,
        bestWeight: Math.max(...session.sets.map(s => s.weight || 0)),
      });
    }
  }
  return { volume, sets, exercises, details: exDetails };
}

function StatPill({ icon, value, label, color }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.statPill, { backgroundColor: colors.iconBg }]}>
      {React.cloneElement(icon, { color })}
      <Text style={[styles.statPillValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statPillLabel, { color: colors.textSub }]}>{label}</Text>
    </View>
  );
}

export function WeeklyChart({ onDayTap }) {
  const { workoutLog } = useUser();
  const { colors } = useTheme();
  const [weekOffset, setWeekOffset] = useState(0);
  const dates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  const rawData = useMemo(() => {
    return dates.map(d => ({ date: d, ...aggregateDay(workoutLog, d) }));
  }, [dates, workoutLog]);

  const totalVol = rawData.reduce((s, d) => s + d.volume, 0);
  const totalSets = rawData.reduce((s, d) => s + d.sets, 0);
  const daysWorked = rawData.filter(d => d.sets > 0).length;

  const chartData = rawData.map((d, i) => {
    const isToday = d.date === new Date().toISOString().slice(0, 10);
    const hasData = d.sets > 0;
    return {
      value: d.volume > 0 ? d.volume : 0,
      label: DAYS_TR[i],
      frontColor: hasData ? (isToday ? '#FF6B35' : '#00AAFF') : colors.border,
      topLabelComponent: () => hasData ? <Text style={{fontSize: 9, color: colors.textSub, marginBottom: 2}}>{formatVol(d.volume)}</Text> : null,
      onPress: () => hasData && onDayTap?.(d)
    };
  });

  const weekLabel = (() => {
    if (weekOffset === 0) return 'Bu hafta';
    if (weekOffset === -1) return 'Geçen hafta';
    const d0 = new Date(dates[0]);
    const d6 = new Date(dates[6]);
    return `${d0.getDate()} ${MONTHS_TR[d0.getMonth()]} – ${d6.getDate()} ${MONTHS_TR[d6.getMonth()]}`;
  })();

  return (
    <View style={styles.chartContainer}>
      <View style={styles.navRow}>
        <Pressable onPress={() => setWeekOffset(w => w - 1)} style={[styles.navBtn, { backgroundColor: colors.iconBg }]}>
          <ChevronLeft size={20} color={colors.text} />
        </Pressable>
        <Text style={[styles.navLabel, { color: colors.text }]}>{weekLabel}</Text>
        <Pressable 
          onPress={() => setWeekOffset(w => Math.min(w + 1, 0))} 
          style={[styles.navBtn, { backgroundColor: colors.iconBg }, weekOffset >= 0 && { opacity: 0.3 }]}
          disabled={weekOffset >= 0}
        >
          <ChevronRight size={20} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.pillsRow}>
        <StatPill icon={<CalendarIcon size={14} />} value={`${daysWorked}/7`} label="gün" color="#FF6B35" />
        <StatPill icon={<Dumbbell size={14} />} value={totalSets} label="set" color="#00AAFF" />
        <StatPill icon={<Flame size={14} />} value={formatVol(totalVol)} label="kg" color="#A855F7" />
      </View>

      <View style={styles.barChartWrapper}>
        <BarChart
          data={chartData}
          width={280}
          height={140}
          barWidth={22}
          spacing={16}
          hideRules
          hideYAxisText
          yAxisThickness={0}
          xAxisThickness={0}
          barBorderRadius={4}
          isAnimated
          initialSpacing={10}
          rulesColor={colors.border}
          xAxisColor={colors.border}
          yAxisColor={colors.border}
          xAxisLabelTextStyle={{color: colors.textSub, fontSize: 11}}
        />
      </View>
    </View>
  );
}

export function MonthlyChart({ onWeekTap }) {
  const { workoutLog } = useUser();
  const { colors } = useTheme();
  const [monthOffset, setMonthOffset] = useState(0);

  const { weeks, month, year } = useMemo(() => getMonthWeeks(monthOffset), [monthOffset]);

  const rawData = useMemo(() => {
    return weeks.map((weekDates, i) => {
      let volume = 0, sets = 0, days = 0;
      for (const d of weekDates) {
        const agg = aggregateDay(workoutLog, d);
        volume += agg.volume;
        sets += agg.sets;
        if (agg.sets > 0) days++;
      }
      return { label: `Hafta ${i+1}`, dates: weekDates, volume, sets, days };
    });
  }, [weeks, workoutLog]);

  const totalVol = rawData.reduce((s, w) => s + w.volume, 0);
  const totalDays = rawData.reduce((s, w) => s + w.days, 0);

  const chartData = rawData.map(w => ({
    value: w.volume > 0 ? w.volume : 0,
    label: w.label,
    frontColor: w.volume > 0 ? '#A855F7' : colors.border,
    topLabelComponent: () => w.volume > 0 ? <Text style={{fontSize: 9, color: colors.textSub, marginBottom: 2}}>{formatVol(w.volume)}</Text> : null,
    onPress: () => w.volume > 0 && onWeekTap?.(w)
  }));

  const monthLabel = monthOffset === 0 ? 'Bu ay' : monthOffset === -1 ? 'Geçen ay' : `${MONTHS_TR[month]} ${year}`;

  return (
    <View style={styles.chartContainer}>
      <View style={styles.navRow}>
        <Pressable onPress={() => setMonthOffset(m => m - 1)} style={[styles.navBtn, { backgroundColor: colors.iconBg }]}>
          <ChevronLeft size={20} color={colors.text} />
        </Pressable>
        <Text style={[styles.navLabel, { color: colors.text }]}>{monthLabel}</Text>
        <Pressable 
          onPress={() => setMonthOffset(m => Math.min(m + 1, 0))} 
          style={[styles.navBtn, { backgroundColor: colors.iconBg }, monthOffset >= 0 && { opacity: 0.3 }]}
          disabled={monthOffset >= 0}
        >
          <ChevronRight size={20} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.pillsRow}>
        <StatPill icon={<CalendarIcon size={14} />} value={totalDays} label="gün" color="#FF6B35" />
        <StatPill icon={<Flame size={14} />} value={formatVol(totalVol)} label="kg hacim" color="#A855F7" />
      </View>

      <View style={styles.barChartWrapper}>
        <BarChart
          data={chartData}
          width={280}
          height={140}
          barWidth={32}
          spacing={24}
          hideRules
          hideYAxisText
          yAxisThickness={0}
          xAxisThickness={0}
          barBorderRadius={6}
          isAnimated
          initialSpacing={15}
          rulesColor={colors.border}
          xAxisColor={colors.border}
          yAxisColor={colors.border}
          xAxisLabelTextStyle={{color: colors.textSub, fontSize: 11}}
        />
      </View>
    </View>
  );
}

export function WeightProgressChart() {
  const { profile, weightHistory, updateProfile } = useUser();
  const { colors } = useTheme();
  const [weightInput, setWeightInput] = useState('');

  const saveWeight = () => {
    const val = parseFloat(String(weightInput).replace(',', '.'));
    if (!val || val < 20 || val > 400) return;
    updateProfile({ weightKg: Math.round(val * 10) / 10 });
    setWeightInput('');
  };

  // Bugünkü kilonu hızlıca gir → grafiğe işlensin
  const entry = (
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16, alignItems: 'center' }}>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.iconBg, borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: colors.border }}>
        <TextInput
          style={{ flex: 1, fontSize: 16, fontWeight: '700', color: colors.text }}
          placeholder={`Bugünkü kilon (${profile.weightKg} kg)`}
          placeholderTextColor={colors.textSub}
          keyboardType="decimal-pad"
          value={weightInput}
          onChangeText={setWeightInput}
          onSubmitEditing={saveWeight}
        />
        <Text style={{ color: colors.textSub, fontWeight: '700' }}>kg</Text>
      </View>
      <Pressable
        style={{ backgroundColor: weightInput ? '#00AAFF' : colors.border, paddingHorizontal: 18, height: 44, borderRadius: 12, justifyContent: 'center' }}
        onPress={saveWeight}
        disabled={!weightInput}
      >
        <Text style={{ color: '#FFF', fontWeight: '800' }}>Kaydet</Text>
      </Pressable>
    </View>
  );

  // Gerçek kilo geçmişi (son 6 kayıt). Tek kayıt varsa onu göster.
  const history = (weightHistory && weightHistory.length > 0)
    ? weightHistory
    : [{ date: new Date().toISOString().slice(0, 10), weight: profile.weightKg }];
  const recent = history.slice(-6);

  if (recent.length < 2) {
    return (
      <View style={styles.chartContainer}>
        <View style={styles.navRow}>
          <Text style={[styles.navLabel, { color: colors.text }]}>Vücut Ağırlığı Gelişimi</Text>
        </View>
        {entry}
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <Text style={{ fontSize: 32, fontWeight: '800', color: '#00AAFF' }}>{profile.weightKg} kg</Text>
          <Text style={{ color: colors.textSub, fontSize: 13, marginTop: 8, textAlign: 'center' }}>
            Kilonu yukarıdan girdikçe gelişim grafiğin burada oluşacak.
          </Text>
        </View>
      </View>
    );
  }

  const lineData = recent.map((h, i) => {
    const d = new Date(h.date);
    const label = `${d.getDate()} ${MONTHS_TR[d.getMonth()]}`;
    return {
      value: h.weight,
      label,
      ...(i === recent.length - 1 ? { dataPointText: `${h.weight}kg` } : {}),
    };
  });
  const maxW = Math.max(...lineData.map(d => d.value));
  const minW = Math.min(...lineData.map(d => d.value));
  const yOffset = Math.max(0, Math.floor(minW) - 2);
  const maxV = Math.ceil(maxW - yOffset + 2);

  return (
    <View style={styles.chartContainer}>
      <View style={styles.navRow}>
        <Text style={[styles.navLabel, { color: colors.text }]}>Vücut Ağırlığı Gelişimi</Text>
      </View>
      {entry}
      <View style={styles.barChartWrapper}>
        <LineChart
          data={lineData}
          maxValue={maxV}
          yAxisOffset={yOffset}
          noOfSections={4}
          stepValue={1}
          width={280}
          height={140}
          thickness={4}
          color="#00AAFF"
          dataPointsColor="#00AAFF"
          dataPointsRadius={5}
          textColor={colors.text}
          textFontSize={11}
          hideRules
          yAxisThickness={0}
          xAxisThickness={0}
          xAxisColor={colors.border}
          yAxisColor={colors.border}
          xAxisLabelTextStyle={{color: colors.textSub, fontSize: 11}}
          isAnimated
        />
      </View>
    </View>
  );
}

const estimate1RM = (weight, reps) => {
  if (!weight || !reps) return 0;
  return Math.round(weight * (1 + reps / 30));
};

export function OneRMChart() {
  const { workoutLog } = useUser();
  const { colors } = useTheme();

  // En çok takip edilen (ağırlıklı set girilmiş) egzersizi seç ve 1RM geçmişini çıkar
  const { exId, points } = useMemo(() => {
    let bestExId = null;
    let bestSessions = 0;
    for (const [id, sessions] of Object.entries(workoutLog || {})) {
      const weighted = sessions.filter(s => s.sets?.some(set => (set.weight || 0) > 0));
      if (weighted.length > bestSessions) {
        bestSessions = weighted.length;
        bestExId = id;
      }
    }
    if (!bestExId) return { exId: null, points: [] };

    const sessions = (workoutLog[bestExId] || [])
      .filter(s => s.sets?.some(set => (set.weight || 0) > 0))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-6);

    const pts = sessions.map(s => {
      const best = Math.max(...s.sets.map(set => estimate1RM(set.weight, set.reps)));
      return { date: s.date, value: best };
    });
    return { exId: bestExId, points: pts };
  }, [workoutLog]);

  const exName = exId ? (EXERCISES[exId]?.name || exId) : null;

  if (points.length < 2) {
    return (
      <View style={styles.chartContainer}>
        <View style={styles.navRow}>
          <Text style={[styles.navLabel, { color: colors.text }]}>Tahmini 1RM Gelişimi</Text>
        </View>
        <View style={{ alignItems: 'center', paddingVertical: 32 }}>
          <Text style={{ color: colors.textSub, fontSize: 13, textAlign: 'center' }}>
            Antrenmanlarda ağırlık girdikçe en çok çalıştığın hareketin tahmini 1RM gelişimi burada görünecek.
          </Text>
        </View>
      </View>
    );
  }

  const lineData = points.map((p, i) => {
    const d = new Date(p.date);
    return {
      value: p.value,
      label: `${d.getDate()} ${MONTHS_TR[d.getMonth()]}`,
      ...(i === points.length - 1 ? { dataPointText: `${p.value}kg` } : {}),
    };
  });
  const maxV = Math.max(...lineData.map(d => d.value));
  const minV = Math.min(...lineData.map(d => d.value));
  const offset1rm = Math.max(0, Math.floor(minV) - 5);
  const maxValue1rm = Math.ceil(maxV - offset1rm + 5);

  return (
    <View style={styles.chartContainer}>
      <View style={styles.navRow}>
        <Text style={[styles.navLabel, { color: colors.text }]}>Tahmini 1RM ({exName})</Text>
      </View>
      <View style={styles.barChartWrapper}>
        <LineChart
          data={lineData}
          maxValue={maxValue1rm}
          yAxisOffset={offset1rm}
          noOfSections={4}
          width={280}
          height={140}
          thickness={4}
          color="#FF6B35"
          dataPointsColor="#FF6B35"
          dataPointsRadius={5}
          textColor={colors.text}
          textFontSize={11}
          hideRules
          yAxisThickness={0}
          xAxisThickness={0}
          xAxisColor={colors.border}
          yAxisColor={colors.border}
          xAxisLabelTextStyle={{color: colors.textSub, fontSize: 11}}
          isAnimated
          curved
        />
      </View>
    </View>
  );
}

export function HistoryCalendar() {
  const { workoutLog } = useUser();
  const { colors } = useTheme();
  
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Adjust first day for Mon-Sun week
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  
  const grid = [];
  let currentDay = 1;
  
  for (let row = 0; row < 6; row++) {
    const week = [];
    for (let col = 0; col < 7; col++) {
      if (row === 0 && col < startOffset) {
        week.push(null);
      } else if (currentDay > daysInMonth) {
        week.push(null);
      } else {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
        const agg = aggregateDay(workoutLog, dateStr);
        week.push({
          day: currentDay,
          dateStr,
          hasWorkout: agg.sets > 0
        });
        currentDay++;
      }
    }
    grid.push(week);
    if (currentDay > daysInMonth) break;
  }

  return (
    <View style={styles.chartContainer}>
      <View style={styles.navRow}>
        <Text style={[styles.navLabel, { color: colors.text }]}>{MONTHS_TR[month]} {year} Takvimi</Text>
      </View>
      <View style={styles.calendarHeader}>
        {DAYS_TR.map(d => (
           <Text key={d} style={[styles.calDayLabel, { color: colors.textSub }]}>{d}</Text>
        ))}
      </View>
      <View style={styles.calendarGrid}>
        {grid.map((week, rIndex) => (
          <View key={rIndex} style={styles.calRow}>
            {week.map((cell, cIndex) => {
               if (!cell) return <View key={cIndex} style={styles.calCellEmpty} />;
               const isToday = cell.dateStr === new Date().toISOString().slice(0, 10);
               return (
                 <View key={cIndex} style={[styles.calCell, cell.hasWorkout && { backgroundColor: 'rgba(0,170,255,0.15)' }]}>
                   <Text style={[styles.calCellText, { color: cell.hasWorkout ? '#00AAFF' : colors.text }, isToday && { fontWeight: '900', color: '#FF6B35' }]}>
                     {cell.day}
                   </Text>
                   {cell.hasWorkout && <View style={[styles.calDot, { backgroundColor: '#00AAFF' }]} />}
                 </View>
               );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

export function DayDetailSheet({ data, onClose }) {
  const { colors } = useTheme();
  if (!data) return null;
  return (
    <Modal visible={!!data} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{data.date} Özeti</Text>
            <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.iconBg }]}><X size={20} color={colors.text} /></Pressable>
          </View>
          <View style={styles.modalPills}>
             <StatPill icon={<Dumbbell size={14} />} value={data.sets} label="Set" color="#00AAFF" />
             <StatPill icon={<Flame size={14} />} value={data.volume} label="kg" color="#FF6B35" />
          </View>
          <ScrollView style={{ marginTop: 16 }}>
            {data.details.map((ex, i) => (
              <View key={i} style={[styles.exRow, { borderBottomColor: colors.border }]}>
                <View>
                  <Text style={[styles.exName, { color: colors.text }]}>{ex.name}</Text>
                  <Text style={[styles.exSub, { color: colors.textSub }]}>{ex.sets} set · Maks {ex.bestWeight}kg</Text>
                </View>
                <Text style={styles.exVol}>{ex.volume}kg</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function WeekDetailSheet({ data, onClose }) {
  const { colors } = useTheme();
  if (!data) return null;
  return (
    <Modal visible={!!data} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{data.label} Özeti</Text>
            <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.iconBg }]}><X size={20} color={colors.text} /></Pressable>
          </View>
          <View style={styles.modalPills}>
             <StatPill icon={<CalendarIcon size={14} />} value={data.days} label="Gün" color="#FF6B35" />
             <StatPill icon={<Dumbbell size={14} />} value={data.sets} label="Set" color="#00AAFF" />
             <StatPill icon={<Flame size={14} />} value={formatVol(data.volume)} label="kg" color="#A855F7" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  chartContainer: { paddingBottom: 16 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  navBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  navLabel: { fontSize: 15, fontWeight: '700' },
  pillsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  statPillValue: { fontSize: 13, fontWeight: '800' },
  statPillLabel: { fontSize: 11, fontWeight: '600' },
  barChartWrapper: { alignItems: 'center' },

  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  calDayLabel: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '700' },
  calendarGrid: { },
  calRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  calCellEmpty: { flex: 1, height: 40 },
  calCell: { flex: 1, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginHorizontal: 2 },
  calCellText: { fontSize: 14, fontWeight: '600' },
  calDot: { width: 4, height: 4, borderRadius: 2, position: 'absolute', bottom: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  closeBtn: { padding: 8, borderRadius: 20 },
  modalPills: { flexDirection: 'row', gap: 8 },
  exRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  exName: { fontSize: 15, fontWeight: '700' },
  exSub: { fontSize: 13, marginTop: 2 },
  exVol: { fontSize: 15, fontWeight: '800', color: '#FF6B35' }
});
